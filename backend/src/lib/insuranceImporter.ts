import type { Prisma } from "@prisma/client";
import { parseInsuranceOffers, type InsuranceCarSeed, type InsuranceParseOptions } from "#shared/importers/insurance.js";
import prisma from "./prisma.js";

export interface ImportSummary {
  added: number;
  updated: number;
  skipped: number;
  total: number;
  errors: string[];
}

const parseOffsetMinutes = (): number => {
  const raw = process.env.IMPORT_TIMEZONE_OFFSET_MINUTES ?? process.env.IMPORT_TIME_OFFSET_MINUTES;
  const numeric = raw ? Number(raw) : NaN;
  if (Number.isFinite(numeric)) return numeric;
  // Domyślnie traktujemy godziny aukcji jako czas środkowoeuropejski, aby uniknąć przesunięcia +1h.
  return 60;
};

const toDate = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  const parsed = new Date(normalized.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const hasExplicitZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized);
  const offsetMinutes = hasExplicitZone ? 0 : parseOffsetMinutes();
  const adjusted = new Date(parsed.getTime() - offsetMinutes * 60_000);

  return adjusted;
};

const normalizeDisplayId = (value?: string | null) => value?.trim() ?? "";

const normalizeSeed = (seed: InsuranceCarSeed) => {
  const displayId = normalizeDisplayId(seed.displayId) || null;

  return {
    ...seed,
    displayId,
    images: (seed.images ?? []).map((image, index) => ({
      url: image.url,
      order: index,
    })),
  };
};

type PrismaCarSource = "API" | "IMPORTED" | "SAMPLE";

export const importInsurancePayload = async (
  payload: unknown,
  options: InsuranceParseOptions & { source?: PrismaCarSource } = {}
): Promise<ImportSummary> => {
  const { cars, errors } = parseInsuranceOffers(payload, options);
  const seeds = cars.map(normalizeSeed);

  const summary: ImportSummary = {
    added: 0,
    updated: 0,
    skipped: 0,
    total: seeds.length,
    errors: [...errors],
  };

  for (const seed of seeds) {
    const displayId = seed.displayId;
    if (!displayId) {
      summary.skipped += 1;
      summary.errors.push("admin.integrator.errors.missingId");
      continue;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.car.findUnique({ where: { displayId } });
      const baseData = {
        displayId,
        make: seed.make,
        model: seed.model,
        year: seed.year,
        mileage: seed.mileage,
        price: seed.price ?? null,
        location: seed.location ?? null,
        description: seed.description ?? null,
        auctionStart: toDate(seed.auctionStart),
        auctionEnd: toDate(seed.auctionEnd),
        provider: seed.provider ?? null,
        vin: seed.vin ?? null,
        registrationNumber: seed.registrationNumber ?? null,
        firstRegistrationDate: toDate(seed.firstRegistrationDate),
        fuelType: seed.fuelType ?? null,
        transmission: seed.transmission ?? null,
        bodyType: seed.bodyType ?? null,
        driveType: seed.driveType ?? null,
        power: seed.power ?? null,
        seats: seed.seats ?? null,
        doors: seed.doors ?? null,
        source: options.source ?? "IMPORTED",
        importedAt: new Date(),
      } as const;

      if (existing) {
        await tx.car.update({
          where: { id: existing.id },
          data: {
            ...baseData,
            price: baseData.price,
            seats: baseData.seats,
            doors: baseData.doors,
          },
        });
        await tx.carImage.deleteMany({ where: { carId: existing.id } });
        if (seed.images.length > 0) {
          await tx.carImage.createMany({
            data: seed.images.map((image) => ({
              carId: existing.id,
              url: image.url,
              order: image.order,
            })),
          });
        }
        summary.updated += 1;
      } else {
        await tx.car.create({
          data: {
            ...baseData,
            images: {
              create: seed.images.map((image) => ({
                url: image.url,
                order: image.order,
              })),
            },
          },
        });
        summary.added += 1;
      }
    });
  }

  return summary;
};
