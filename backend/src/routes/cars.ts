import { createHash } from "node:crypto";

import { Prisma } from "@prisma/client";
import { Router, Request, Response } from "express";

import prisma from "../lib/prisma.js";
import { importInsurancePayload } from "../lib/insuranceImporter.js";
import { auth } from "../middleware/auth.js";

const COUNT_CACHE_TTL_MS = 10_000;
const LIST_CACHE_TTL_MS = 20_000;

const countCache = new Map<string, { expiresAt: number; value: number }>();
const listCache = new Map<string, { expiresAt: number; payload: string; etag: string }>();

const invalidateListCaches = () => {
  countCache.clear();
  listCache.clear();
};

type SortOption = "endingAsc" | "endingDesc" | "newest";

const parseNumber = (value: unknown): number | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDescriptionDetails = (value: unknown): Prisma.InputJsonValue | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const entries = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const candidate = item as { label?: unknown; value?: unknown };
      const label = typeof candidate.label === "string" ? candidate.label.trim() : String(candidate.label ?? "").trim();
      const detail = typeof candidate.value === "string" ? candidate.value.trim() : String(candidate.value ?? "").trim();

      if (!label || !detail) return null;

      return { label, value: detail };
    })
    .filter((entry): entry is { label: string; value: string } => Boolean(entry));

  return entries.length > 0 ? entries : [];
};

const normalizeImages = (images: unknown): { url: string; order: number }[] => {
  if (!Array.isArray(images)) {
    return [];
  }
  return images
    .map((image, index) => {
      if (typeof image === "string") {
        return { url: image, order: index };
      }
      if (image && typeof image === "object" && "url" in image) {
        const candidate = image as { url?: unknown; order?: unknown };
        const url = typeof candidate.url === "string" ? candidate.url : String(candidate.url ?? "");
        const order = parseNumber(candidate.order);
        return { url, order: order ?? index };
      }
      return null;
    })
    .filter((entry): entry is { url: string; order: number } => Boolean(entry?.url));
};

const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.floor(parsed);
  return normalized > 0 ? normalized : fallback;
};

const parseOptionalPositiveInt = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;

  const normalized = Math.floor(parsed);
  return normalized > 0 ? normalized : undefined;
};

const toThumbnailUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes("w=")) return trimmed;
  return `${trimmed}${trimmed.includes("?") ? "&" : "?"}w=400`;
};

const normalizeSort = (value: unknown): SortOption => {
  if (value === "endingDesc" || value === "newest") {
    return value;
  }
  return "endingAsc";
};

const normalizeCacheKey = (prefix: string, query: Record<string, unknown>) => {
  const entries = Object.entries(query)
    .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : String(value ?? "")] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  return `${prefix}:${entries.map(([k, v]) => `${k}=${v}`).join("&")}`;
};

const getCarsWhere = (query: Request["query"]): Prisma.CarWhereInput => {
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const provider = typeof query.provider === "string" ? query.provider.trim() : "";
  const yearFrom = parseOptionalPositiveInt(query.yearFrom);
  const yearTo = parseOptionalPositiveInt(query.yearTo);
  const includeArchived = String(query.includeArchived ?? "false").toLowerCase() === "true";

  const andFilters: Prisma.CarWhereInput[] = [{ adminDismissed: false }];

  if (!includeArchived) {
    andFilters.push({
      OR: [{ auctionEnd: null }, { auctionEnd: { gt: new Date() } }],
    });
  }

  if (q) {
    andFilters.push({
      OR: [
        { make: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
        { displayId: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (provider) {
    andFilters.push({ provider: { equals: provider, mode: "insensitive" } });
  }

  if (yearFrom !== undefined || yearTo !== undefined) {
    andFilters.push({
      year: {
        ...(yearFrom !== undefined ? { gte: yearFrom } : {}),
        ...(yearTo !== undefined ? { lte: yearTo } : {}),
      },
    });
  }

  return { AND: andFilters };
};

const getCarsOrderBy = (query: Request["query"]): Prisma.CarOrderByWithRelationInput[] => {
  const sort = normalizeSort(query.sort);

  if (sort === "newest") {
    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  if (sort === "endingDesc") {
    return [{ auctionEnd: "desc" }, { createdAt: "desc" }, { id: "desc" }];
  }

  return [{ auctionEnd: "asc" }, { createdAt: "desc" }, { id: "desc" }];
};

const r = Router();

r.get("/count", async (req: Request, res: Response) => {
  const cacheKey = normalizeCacheKey("count", req.query);
  const cached = countCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return res.json({ count: cached.value });
  }

  const where = getCarsWhere(req.query);
  const count = await prisma.car.count({ where });
  countCache.set(cacheKey, { value: count, expiresAt: Date.now() + COUNT_CACHE_TTL_MS });

  return res.json({ count });
});

r.get("/", async (req: Request, res: Response) => {
  const limit = Math.min(parsePositiveInt(req.query.limit, 50), 200);
  const page = parsePositiveInt(req.query.page, 1);
  const skip = req.query.offset !== undefined ? Math.max(0, Number(req.query.offset) || 0) : (page - 1) * limit;

  const cacheKey = normalizeCacheKey("list", { ...req.query, limit, skip });
  const cached = listCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    if (req.headers["if-none-match"] === cached.etag) {
      return res.status(304).end();
    }
    res.setHeader("ETag", cached.etag);
    res.setHeader("Cache-Control", "public, max-age=10");
    return res.type("application/json").send(cached.payload);
  }

  const where = getCarsWhere(req.query);
  const orderBy = getCarsOrderBy(req.query);

  const [total, cars] = await Promise.all([
    prisma.car.count({ where }),
    prisma.car.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        displayId: true,
        make: true,
        model: true,
        year: true,
        mileage: true,
        price: true,
        location: true,
        auctionEnd: true,
        provider: true,
        fuelType: true,
        transmission: true,
        firstRegistrationDate: true,
        source: true,
        images: {
          orderBy: { order: "asc" },
          take: 1,
          select: { id: true, url: true },
        },
      },
    }),
  ]);

  const carsWithThumbnails = cars.map((car) => {
    const firstImage = car.images[0];
    if (!firstImage) return car;

    return {
      ...car,
      images: [{ ...firstImage, url: toThumbnailUrl(firstImage.url) }],
    };
  });

  const payloadObject = {
    offset: skip,
    limit,
    total,
    cars: carsWithThumbnails,
  };
  const payload = JSON.stringify(payloadObject);
  const etag = `W/\"${createHash("sha1").update(payload).digest("hex")}\"`;

  listCache.set(cacheKey, {
    payload,
    etag,
    expiresAt: Date.now() + LIST_CACHE_TTL_MS,
  });

  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }

  res.setHeader("ETag", etag);
  res.setHeader("Cache-Control", "public, max-age=10");

  return res.type("application/json").send(payload);
});

r.post("/import", auth("ADMIN"), async (req: Request, res: Response) => {
  const { payloads, imageBaseUrl, fallbackProvider } = req.body ?? {};
  const entries: unknown[] = Array.isArray(payloads)
    ? payloads
    : payloads
    ? [payloads]
    : [];

  if (entries.length === 0) {
    return res.status(400).json({ error: "Brak danych do importu" });
  }

  const summary = {
    added: 0,
    updated: 0,
    skipped: 0,
    total: 0,
    errors: [] as string[],
  };

  for (const entry of entries) {
    const result = await importInsurancePayload(entry, {
      imageBaseUrl: typeof imageBaseUrl === "string" ? imageBaseUrl : undefined,
      fallbackProvider: typeof fallbackProvider === "string" ? fallbackProvider : undefined,
    });
    summary.added += result.added;
    summary.updated += result.updated;
    summary.skipped += result.skipped;
    summary.total += result.total;
    summary.errors.push(...result.errors);
  }

  const cars = await prisma.car.findMany({
    include: { images: { orderBy: { order: "asc" } }, offers: true },
    orderBy: { id: "desc" },
  });

  invalidateListCaches();
  res.json({ summary, cars });
});

r.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Nieprawidłowe ID pojazdu" });
  }

  try {
    const car = await prisma.car.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    });

    if (!car) return res.status(404).json({ error: "Nie znaleziono pojazdu" });

    const offers = await prisma.offer.findMany({
      where: { carId: car.id },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ ...car, offers });
  } catch (error) {
    console.error("Błąd podczas pobierania pojazdu:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

r.post("/", auth("ADMIN"), async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};

    const auctionStart = parseDate(body.auctionStart);
    const auctionEnd = parseDate(body.auctionEnd);

    if (body.auctionStart && !auctionStart) {
      return res.status(400).json({ error: "Nieprawidłowa data rozpoczęcia aukcji" });
    }
    if (body.auctionEnd && !auctionEnd) {
      return res.status(400).json({ error: "Nieprawidłowa data zakończenia aukcji" });
    }

    const descriptionDetails = parseDescriptionDetails(body.descriptionDetails);

    const car = await prisma.car.create({
      data: {
        displayId: body.displayId,
        make: body.make,
        model: body.model,
        year: Number(body.year),
        mileage: Number(body.mileage),
        price: parseNumber(body.price),
        location: body.location ?? null,
        description: body.description ?? null,
        descriptionDetails,
        auctionStart,
        auctionEnd,
        provider: body.provider ?? null,
        vin: body.vin ?? null,
        registrationNumber: body.registrationNumber ?? null,
        firstRegistrationDate: parseDate(body.firstRegistrationDate),
        fuelType: body.fuelType ?? null,
        transmission: body.transmission ?? null,
        bodyType: body.bodyType ?? null,
        driveType: body.driveType ?? null,
        power: body.power ?? null,
        seats: parseNumber(body.seats),
        doors: parseNumber(body.doors),
        images: {
          create: normalizeImages(body.images).map((img) => ({ url: img.url, order: img.order })),
        },
      },
      include: { images: { orderBy: { order: "asc" } } },
    });

    invalidateListCaches();
    res.status(201).json(car);
  } catch (error) {
    console.error("Błąd tworzenia pojazdu:", error);
    res.status(400).json({ error: "Nie udało się utworzyć pojazdu" });
  }
});

r.put("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Nieprawidłowe ID" });
  }

  try {
    const body = req.body ?? {};

    const auctionStart = parseDate(body.auctionStart);
    const auctionEnd = parseDate(body.auctionEnd);

    if (body.auctionStart && !auctionStart) {
      return res.status(400).json({ error: "Nieprawidłowa data rozpoczęcia aukcji" });
    }
    if (body.auctionEnd && !auctionEnd) {
      return res.status(400).json({ error: "Nieprawidłowa data zakończenia aukcji" });
    }

    const descriptionDetails = parseDescriptionDetails(body.descriptionDetails);

    const updated = await prisma.car.update({
      where: { id },
      data: {
        displayId: body.displayId,
        make: body.make,
        model: body.model,
        year: Number(body.year),
        mileage: Number(body.mileage),
        price: parseNumber(body.price),
        location: body.location ?? null,
        description: body.description ?? null,
        descriptionDetails,
        auctionStart,
        auctionEnd,
        provider: body.provider ?? null,
        vin: body.vin ?? null,
        registrationNumber: body.registrationNumber ?? null,
        firstRegistrationDate: parseDate(body.firstRegistrationDate),
        fuelType: body.fuelType ?? null,
        transmission: body.transmission ?? null,
        bodyType: body.bodyType ?? null,
        driveType: body.driveType ?? null,
        power: body.power ?? null,
        seats: parseNumber(body.seats),
        doors: parseNumber(body.doors),
      },
      include: { images: { orderBy: { order: "asc" } } },
    });

    await prisma.carImage.deleteMany({ where: { carId: id } });

    const incomingImages = normalizeImages(body.images);
    if (incomingImages.length > 0) {
      await prisma.carImage.createMany({
        data: incomingImages.map((img) => ({ carId: id, url: img.url, order: img.order })),
      });
    }

    const withImages = await prisma.car.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    });

    invalidateListCaches();
    res.json(withImages ?? updated);
  } catch (error) {
    console.error("Błąd aktualizacji pojazdu:", error);
    res.status(400).json({ error: "Nie udało się zaktualizować pojazdu" });
  }
});

r.delete("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Nieprawidłowe ID" });
  }

  try {
    await prisma.carImage.deleteMany({ where: { carId: id } });
    await prisma.offer.deleteMany({ where: { carId: id } });
    await prisma.car.delete({ where: { id } });
    invalidateListCaches();
    res.status(204).send();
  } catch (error) {
    console.error("Błąd usuwania pojazdu:", error);
    res.status(400).json({ error: "Nie udało się usunąć pojazdu" });
  }
});

export default r;
