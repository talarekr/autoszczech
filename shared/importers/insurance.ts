export interface InsuranceCarImage {
  id?: number;
  url: string;
  order?: number;
}

export interface InsuranceCarSeed {
  id?: number;
  displayId?: string | null;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price?: number | null;
  location?: string | null;
  description?: string | null;
  auctionStart?: string | null;
  auctionEnd?: string | null;
  provider?: string | null;
  vin?: string | null;
  registrationNumber?: string | null;
  firstRegistrationDate?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  driveType?: string | null;
  power?: string | null;
  seats?: number | null;
  doors?: number | null;
  images: InsuranceCarImage[];
}

interface RawOffer {
  offer_id?: string;
  vehicle?: Record<string, unknown>;
  damage?: {
    overview?: Record<string, unknown>;
    defects?: string;
  };
  offer_images?: string[];
  location?: string;
  offerStart?: {
    date?: string;
    time?: string;
  };
  offerEnd?: {
    date?: string;
    time?: string;
  };
}

export interface InsuranceParseOptions {
  imageBaseUrl?: string;
  fallbackProvider?: string;
}

export interface InsuranceParseResult {
  cars: InsuranceCarSeed[];
  errors: string[];
}

const normalizeString = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

const parseInteger = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^0-9-]/g, ""));
    if (Number.isFinite(numeric)) {
      return Math.round(numeric);
    }
  }
  return undefined;
};

const parseMileage = (value: unknown) => parseInteger(value) ?? 0;

const parseIsoDate = (value: unknown): string | undefined => {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  const parts = normalized.split(/[./-]/).filter(Boolean);
  if (parts.length < 3) return undefined;
  const [day, month, year] = parts.length === 3 ? parts : parts.slice(-3);
  const iso = `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return iso;
};

const combineDateTime = (dateValue?: string, timeValue?: string): string | undefined => {
  const isoDate = parseIsoDate(dateValue);
  if (!isoDate) return undefined;
  const normalizedTime = normalizeString(timeValue) ?? "00:00";
  const [hours, minutes] = normalizedTime.split(":");
  const iso = `${isoDate}T${hours?.padStart(2, "0") ?? "00"}:${minutes?.padStart(2, "0") ?? "00"}:00Z`;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return `${isoDate}T00:00:00Z`;
  }
  return iso;
};

const buildImageUrl = (filename: string, displayId: string, imageBaseUrl?: string) => {
  if (!filename) {
    return `https://placehold.co/800x600?text=${encodeURIComponent(displayId)}`;
  }
  if (/^https?:/i.test(filename)) {
    return filename;
  }
  if (imageBaseUrl) {
    return `${imageBaseUrl.replace(/\/$/, "")}/${filename}`;
  }
  return `https://placehold.co/800x600?text=${encodeURIComponent(displayId)}`;
};

const parseProvider = (rawId?: string, fallback?: string) => {
  if (rawId) {
    const prefix = rawId.split(/[-_]/)[0];
    if (prefix && prefix.length >= 2) {
      return prefix.toUpperCase();
    }
  }
  return fallback ?? "Partner";
};

const gatherDescription = (vehicle: Record<string, unknown> = {}, damage?: RawOffer["damage"]) => {
  const fragments: string[] = [];
  const extra = normalizeString(vehicle["additional_description"]);
  if (extra) {
    fragments.push(extra);
  }
  const damageDetails = normalizeString(damage?.defects);
  if (damageDetails) {
    fragments.push(`Szkody: ${damageDetails}`);
  }
  return fragments.join("\n\n");
};

const parseOffer = (offer: RawOffer, options: InsuranceParseOptions): InsuranceCarSeed | undefined => {
  const vehicle = (offer.vehicle ?? {}) as Record<string, unknown>;
  const getVehicleValue = (key: string) => vehicle[key];
  const getVehicleString = (key: string) => normalizeString(getVehicleValue(key));

  const displayId = normalizeString(offer.offer_id ?? getVehicleValue("Referenz"));
  if (!displayId) {
    return undefined;
  }

  const firstRegistrationIso = parseIsoDate(getVehicleValue("1._Inv."));
  const firstRegistrationYear = firstRegistrationIso ? Number(firstRegistrationIso.slice(0, 4)) : undefined;
  const auctionStart = combineDateTime(offer.offerStart?.date, offer.offerStart?.time);
  const auctionEnd = combineDateTime(offer.offerEnd?.date, offer.offerEnd?.time);

  const mileage = parseMileage(getVehicleValue("Km"));
  const make = getVehicleString("Marke") ?? "Nieznana marka";
  const model = getVehicleString("Typ") ?? "Nieznany model";

  const fuelType = getVehicleString("Treibstoff");
  const transmission = getVehicleString("Getriebe");
  const bodyType = getVehicleString("Karosserie") ?? getVehicleString("Bauart_/_Aufbau_/_Turen");
  const power = getVehicleString("Leistung");
  const seats = parseInteger(getVehicleValue("Sitzplatze"));
  const doors = parseInteger(getVehicleValue("Turen"));

  const images = (offer.offer_images ?? []).map((filename, index) => ({
    id: index + 1,
    url: buildImageUrl(filename, displayId, options.imageBaseUrl),
  }));

  if (images.length === 0) {
    images.push({ id: 1, url: buildImageUrl("", displayId, options.imageBaseUrl) });
  }

  const description = gatherDescription(vehicle, offer.damage);

  return {
    id: undefined,
    displayId,
    make,
    model,
    year: firstRegistrationYear ?? new Date().getFullYear(),
    mileage,
    price: null,
    firstRegistrationDate: firstRegistrationIso ?? null,
    registrationNumber:
      normalizeString(getVehicleValue("Chassis-Nr.")) ?? getVehicleString("Referenz") ?? null,
    fuelType: fuelType ?? null,
    transmission: transmission ?? null,
    bodyType: bodyType ?? null,
    power: power ?? null,
    seats: seats ?? null,
    doors: doors ?? null,
    location: offer.location ?? null,
    description: description || null,
    auctionStart: auctionStart ?? null,
    auctionEnd: auctionEnd ?? null,
    provider: parseProvider(offer.offer_id, options.fallbackProvider),
    images,
  };
};

export const parseInsuranceOffers = (
  input: unknown,
  options: InsuranceParseOptions = {}
): InsuranceParseResult => {
  const errors: string[] = [];
  const seeds: InsuranceCarSeed[] = [];

  const payload: RawOffer[] = Array.isArray(input)
    ? (input as RawOffer[])
    : input && typeof input === "object"
    ? [input as RawOffer]
    : [];

  if (payload.length === 0) {
    return { cars: [], errors: ["admin.integrator.errors.invalidFile"] };
  }

  payload.forEach((offer) => {
    const parsed = parseOffer(offer, options);
    if (parsed) {
      seeds.push(parsed);
    } else {
      errors.push("admin.integrator.errors.missingId");
    }
  });

  return { cars: seeds, errors };
};
