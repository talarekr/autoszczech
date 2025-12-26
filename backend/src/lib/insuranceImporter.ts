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

const getImportTimeZone = () =>
  process.env.IMPORT_TIMEZONE || process.env.IMPORT_TIME_ZONE || "Europe/Zurich";

const hasExplicitZone = (value: string) => /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);

const getTimeZoneOffsetMinutes = (date: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const lookup = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  const asUTC = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour),
    Number(lookup.minute),
    Number(lookup.second)
  );

  return (asUTC - date.getTime()) / 60_000;
};

const toDate = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }

  let normalized = value.trim().replace(" ", "T");

  const dateOnlyMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    normalized = `${dateOnlyMatch[0]}T00:00:00`;
  }

  if (hasExplicitZone(normalized)) {
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second = "0", millisecond = "0"] = match;
  const utcGuess = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecond.padEnd(3, "0"))
    )
  );

  const offsetMinutes = getTimeZoneOffsetMinutes(utcGuess, getImportTimeZone());

  return new Date(utcGuess.getTime() - offsetMinutes * 60_000);
};

const normalizeDisplayId = (value?: string | null) => value?.trim() ?? "";

const normalizeSeed = (seed: InsuranceCarSeed) => {
  const displayId = normalizeDisplayId(seed.displayId) || null;

  return {
    ...seed,
    displayId,
    descriptionDetails: seed.descriptionDetails ?? [],
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
  const { cars, errors, skipped = [] } = parseInsuranceOffers(payload, options);
  const seeds = cars.map(normalizeSeed);

  const summary: ImportSummary = {
    added: 0,
    updated: 0,
    skipped: skipped.length,
    total: seeds.length + skipped.length,
    errors: [...errors],
  };

  skipped.forEach((entry) => {
    console.info(
      `[import-insurance] Skipping offer displayId=${entry.displayId ?? "<unknown>"} reason=${entry.reason}`
    );
  });

  for (const seed of seeds) {
    const displayId = seed.displayId;
    if (!displayId) {
      summary.skipped += 1;
      summary.errors.push("admin.integrator.errors.missingId");
      console.info("[import-insurance] Skipping offer reason=validation_failed_missing_display_id");
      continue;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.car.findUnique({ where: { displayId } });
      const operation = existing ? "update" : "create";

      if ((seed.provider ?? options.fallbackProvider ?? "").toUpperCase() === "REST") {
        console.info(
          `[import-insurance] REST upsert displayId=${displayId} provider=${seed.provider ?? "REST"} make=${seed.make} model=${seed.model} year=${seed.year} imagesDownloaded=${seed.images.length} op=${operation}`
        );
      }
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
        descriptionDetails: (seed.descriptionDetails ?? []) as unknown as Prisma.InputJsonValue,
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
