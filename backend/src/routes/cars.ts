import { Prisma } from "@prisma/client";
import { Router, Request, Response } from "express";

import prisma from "../lib/prisma.js";
import { importInsurancePayload } from "../lib/insuranceImporter.js";
import { auth } from "../middleware/auth.js";

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

const r = Router();

r.get("/", async (_req: Request, res: Response) => {
  const cars = await prisma.car.findMany({
    include: { images: { orderBy: { order: "asc" } } },
    orderBy: { id: "desc" },
  });
  res.json(cars);
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

    if (!car) return res.status(404).json({ error: "Nie znaleziono" });
    res.json(car);
  } catch (error) {
    console.error("Nie udało się pobrać pojazdu", error);
    res.status(500).json({ error: "Nie udało się pobrać pojazdu" });
  }
});

r.post("/", auth("ADMIN"), async (req: Request, res: Response) => {
  const payload = req.body || {};
  const displayId = typeof payload.displayId === "string" && payload.displayId.trim().length > 0
    ? payload.displayId.trim()
    : `API-${Date.now()}`;

  const car = await prisma.car.create({
    data: {
      displayId,
      make: payload.make,
      model: payload.model,
      year: parseNumber(payload.year) ?? new Date().getFullYear(),
      mileage: parseNumber(payload.mileage) ?? 0,
      price: parseNumber(payload.price),
      location: payload.location ?? null,
      description: payload.description ?? null,
      auctionStart: parseDate(payload.auctionStart),
      auctionEnd: parseDate(payload.auctionEnd),
      provider: payload.provider ?? null,
      vin: payload.vin ?? null,
      registrationNumber: payload.registrationNumber ?? null,
      firstRegistrationDate: parseDate(payload.firstRegistrationDate),
      fuelType: payload.fuelType ?? null,
      transmission: payload.transmission ?? null,
      bodyType: payload.bodyType ?? null,
      driveType: payload.driveType ?? null,
      power: payload.power ?? null,
      seats: parseNumber(payload.seats),
      doors: parseNumber(payload.doors),
      descriptionDetails: parseDescriptionDetails(payload.descriptionDetails),
      source: payload.source ?? "API",
      images: {
        create: normalizeImages(payload.images).map((image) => ({
          url: image.url,
          order: image.order,
        })),
      },
    },
    include: { images: { orderBy: { order: "asc" } }, offers: true },
  });
  res.json(car);
});

r.put("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const payload = req.body || {};

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Nieprawidłowe ID pojazdu" });
  }

  try {
    const car = await prisma.car.update({
      where: { id },
      data: {
        displayId:
          typeof payload.displayId === "string" && payload.displayId.trim().length > 0
            ? payload.displayId.trim()
            : undefined,
        make: payload.make,
        model: payload.model,
        year: parseNumber(payload.year) ?? undefined,
        mileage: parseNumber(payload.mileage) ?? undefined,
        price: parseNumber(payload.price),
        location: payload.location ?? null,
        description: payload.description ?? null,
        auctionStart: parseDate(payload.auctionStart),
        auctionEnd: parseDate(payload.auctionEnd),
        provider: payload.provider ?? null,
        vin: payload.vin ?? null,
        registrationNumber: payload.registrationNumber ?? null,
        firstRegistrationDate: parseDate(payload.firstRegistrationDate),
        fuelType: payload.fuelType ?? null,
        transmission: payload.transmission ?? null,
        bodyType: payload.bodyType ?? null,
        driveType: payload.driveType ?? null,
        power: payload.power ?? null,
        seats: parseNumber(payload.seats),
        doors: parseNumber(payload.doors),
        descriptionDetails: parseDescriptionDetails(payload.descriptionDetails) ?? undefined,
        images: {
          deleteMany: {},
          create: normalizeImages(payload.images).map((image) => ({
            url: image.url,
            order: image.order,
          })),
        },
      },
      include: { images: { orderBy: { order: "asc" } }, offers: true },
    });
    res.json(car);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Nie znaleziono pojazdu" });
    }
    console.error("Nie udało się zaktualizować pojazdu", error);
    res.status(500).json({ error: "Nie udało się zaktualizować pojazdu" });
  }
});

r.delete("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Nieprawidłowe ID pojazdu" });
  }

  try {
    await prisma.car.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Pojazd nie istnieje" });
    }
    console.error("Nie udało się usunąć pojazdu", error);
    res.status(500).json({ error: "Nie udało się usunąć pojazdu" });
  }
});

export default r;
