import { Router, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { auth } from "../middleware/auth.js";

const normalizeDate = (value?: any) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeImages = (images: any[] | undefined) => {
  if (!images) return [] as { url: string }[];
  return images
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return { url: item };
      if (typeof item.url === "string") return { url: item.url };
      return null;
    })
    .filter(Boolean) as { url: string }[];
};

const normalizeSpecs = (specs: any): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined => {
  if (specs === undefined) return undefined;
  if (specs === null) return Prisma.JsonNull;
  return specs as Prisma.InputJsonValue;
};

const r = Router();

r.get("/", async (_req: Request, res: Response) => {
  const cars = await prisma.car.findMany({
    include: {
      images: true,
      _count: { select: { offers: true } },
    },
    orderBy: [{ auctionEnd: "asc" }, { createdAt: "desc" }],
  });
  res.json(cars);
});

r.get("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      images: true,
      offers: { include: { user: true }, orderBy: { createdAt: "desc" } },
      _count: { select: { offers: true } },
    },
  });
  if (!car) return res.status(404).json({ error: "Nie znaleziono" });
  res.json(car);
});

r.post("/", auth("ADMIN"), async (req: Request, res: Response) => {
  const {
    make,
    model,
    year,
    mileage,
    price,
    location,
    description,
    auctionStart,
    auctionEnd,
    images,
    specs,
    externalId,
  } = req.body || {};
  const car = await prisma.car.create({
    data: {
      make,
      model,
      year,
      mileage,
      price,
      location,
      description,
      specs: normalizeSpecs(specs),
      externalId: externalId ?? null,
      auctionStart: normalizeDate(auctionStart),
      auctionEnd: normalizeDate(auctionEnd),
      images: { create: normalizeImages(images) },
    },
    include: { images: true },
  });
  res.json(car);
});

r.put("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const {
    make,
    model,
    year,
    mileage,
    price,
    location,
    description,
    auctionStart,
    auctionEnd,
    specs,
    externalId,
  } = req.body || {};
  const car = await prisma.car.update({
    where: { id },
    data: {
      make,
      model,
      year,
      mileage,
      price,
      location,
      description,
      specs: normalizeSpecs(specs),
      externalId: externalId ?? null,
      auctionStart: normalizeDate(auctionStart),
      auctionEnd: normalizeDate(auctionEnd),
    },
  });
  res.json(car);
});

r.delete("/:id", auth("ADMIN"), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await prisma.car.delete({ where: { id } });
  res.json({ ok: true });
});

r.post("/import", auth("ADMIN"), async (req: Request, res: Response) => {
  const payload = Array.isArray(req.body?.cars) ? req.body.cars : req.body;
  if (!Array.isArray(payload)) {
    return res.status(400).json({ error: "Błędny format danych. Oczekiwano tablicy samochodów." });
  }

  const imported: any[] = [];
  const errors: { externalId?: string; error: string }[] = [];

  for (const item of payload) {
    if (!item || typeof item !== "object") {
      errors.push({ error: "Pusta pozycja w pliku" });
      continue;
    }

    if (!item.make || !item.model || !item.year || !item.mileage || !item.price) {
      errors.push({ externalId: item.externalId, error: "Brak wymaganych pól make/model/year/mileage/price" });
      continue;
    }

    const computedSpecs = (() => {
      const specs = { ...(item.specs || {}) } as Record<string, unknown>;
      const keys = [
        "vin",
        "bodyType",
        "fuelType",
        "power",
        "transmission",
        "engine",
        "drivetrain",
        "color",
        "registration",
      ];
      for (const key of keys) {
        if (item[key] !== undefined && specs[key] === undefined) {
          specs[key] = item[key];
        }
      }
      return Object.keys(specs).length ? (specs as Prisma.InputJsonValue) : undefined;
    })();

    const baseData = {
      make: item.make,
      model: item.model,
      year: Number(item.year),
      mileage: Number(item.mileage),
      price: Number(item.price),
      location: item.location ?? null,
      description: item.description ?? null,
      auctionStart: normalizeDate(item.auctionStart),
      auctionEnd: normalizeDate(item.auctionEnd),
      externalId: item.externalId ?? item.id ?? null,
      specs: normalizeSpecs(computedSpecs),
    };

    const imageData = normalizeImages(item.images);

    try {
      let saved;
      if (baseData.externalId) {
        const existing = await prisma.car.findUnique({ where: { externalId: baseData.externalId } });
        if (existing) {
          await prisma.carImage.deleteMany({ where: { carId: existing.id } });
          saved = await prisma.car.update({
            where: { id: existing.id },
            data: {
              ...baseData,
              images: { create: imageData },
            },
            include: { images: true, _count: { select: { offers: true } } },
          });
        } else {
          saved = await prisma.car.create({
            data: {
              ...baseData,
              images: { create: imageData },
            },
            include: { images: true, _count: { select: { offers: true } } },
          });
        }
      } else {
        saved = await prisma.car.create({
          data: {
            ...baseData,
            images: { create: imageData },
          },
          include: { images: true, _count: { select: { offers: true } } },
        });
      }
      imported.push(saved);
    } catch (error: any) {
      errors.push({ externalId: baseData.externalId ?? undefined, error: error.message ?? "Błąd zapisu" });
    }
  }

  res.json({ imported: imported.length, errors, cars: imported });
});

export default r;
