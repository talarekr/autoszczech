export interface InsuranceCarImage {
  id?: number;
  url: string;
  order?: number;
}

export interface DescriptionEntry {
  label: string;
  value: string;
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
  descriptionDetails?: DescriptionEntry[];
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
  skipped?: { displayId?: string; reason: string }[];
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

  const rawParts = normalized.split(/[./-]/).filter(Boolean);
  if (rawParts.length === 0) return undefined;

  if (rawParts.length === 1 && rawParts[0].length === 4) {
    const [year] = rawParts;
    return `${year}-${"01"}-${"01"}`;
  }

  if (rawParts.length === 2) {
    const [p1, p2] = rawParts as [string, string];
    const yearCandidate = [p1, p2].find((part) => part.length === 4) ?? p2;
    const [year, month] = yearCandidate === p1 ? [p1, p2] : [p2, p1];
    const iso = `${year.padStart(4, "0")}-${month.padStart(2, "0")}-01`;
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return iso;
  }

  const parts = (rawParts.length === 3 ? rawParts : rawParts.slice(-3)) as [string, string, string];
  const [p1, p2, p3] = parts;
  const yearCandidate = [p1, p2, p3].find((part) => part.length === 4) ?? p3;

  const [year, month, day] = (() => {
    if (yearCandidate === p1) return [p1, p2, p3];
    if (yearCandidate === p2) return [p2, p1, p3];
    return [yearCandidate, p2, p1];
  })();
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

  const iso = `${isoDate}T${hours?.padStart(2, "0") ?? "00"}:${minutes?.padStart(2, "0") ?? "00"}:00`;
  const parsed = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return `${isoDate}T00:00:00`;
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
  if (fallback) {
    return fallback;
  }

  if (rawId) {
    const prefix = rawId.split(/[-_]/)[0];
    if (prefix && prefix.length >= 2) {
      return prefix.toUpperCase();
    }
  }
  return "Partner";
};

const normalizeLabel = (label: string) =>
  label
    .replace(/[_]+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeValue = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (value === null || value === undefined) {
    return undefined;
  }

  const normalized = normalizeString(value);
  if (normalized) {
    return normalized;
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => normalizeValue(item))
      .filter((item): item is string => Boolean(item))
      .join(", ");
    return joined.length > 0 ? joined : undefined;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return undefined;
};

const gatherDescriptionDetails = (vehicle: Record<string, unknown> = {}, damage?: RawOffer["damage"]) => {
  const entries: DescriptionEntry[] = [];

  Object.entries(vehicle).forEach(([rawKey, rawValue]) => {
    if (rawKey === "additional_description") return;

    const value = normalizeValue(rawValue);
    if (!value) return;

    const label = normalizeLabel(rawKey);
    if (!label) return;

    entries.push({ label, value });
  });

  const damageDetails = normalizeString(damage?.defects);
  if (damageDetails) {
    entries.push({ label: "Szkody", value: damageDetails });
  }

  return entries;
};

const resolveDisplayId = (offer: RawOffer, options: InsuranceParseOptions) => {
  const vehicle = (offer.vehicle ?? {}) as Record<string, unknown>;
  const rawOfferId = offer.offer_id ?? vehicle["Referenz"];
  const rawId =
    typeof rawOfferId === "number" && Number.isFinite(rawOfferId)
      ? String(rawOfferId)
      : normalizeString(rawOfferId);
  if (!rawId) {
    return undefined;
  }

  if ((options.fallbackProvider ?? "").toUpperCase() === "REST") {
    return rawId.startsWith("REST_") ? rawId : `REST_${rawId}`;
  }

  return rawId;
};

const parseOffer = (offer: RawOffer, options: InsuranceParseOptions): InsuranceCarSeed | undefined => {
  const vehicle = (offer.vehicle ?? {}) as Record<string, unknown>;
  const getVehicleValue = (key: string) => vehicle[key];
  const getVehicleString = (key: string) => normalizeString(getVehicleValue(key));

  const displayId = resolveDisplayId(offer, options);
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

  const description = normalizeString(vehicle["additional_description"]);
  const descriptionDetails = gatherDescriptionDetails(vehicle, offer.damage);

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
    descriptionDetails,
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
  const skipped: { displayId?: string; reason: string }[] = [];

  const payload: RawOffer[] = Array.isArray(input)
    ? (input as RawOffer[])
    : input && typeof input === "object"
    ? [input as RawOffer]
    : [];

  if (payload.length === 0) {
    return { cars: [], errors: ["admin.integrator.errors.invalidFile"] };
  }

  payload.forEach((offer) => {
    if ((offer as Record<string, unknown>)["__skipRestImport"]) {
      const skippedId = resolveDisplayId(offer, options);
      const reason = (offer as Record<string, unknown>)["__skipReason"];
      skipped.push({ displayId: skippedId, reason: typeof reason === "string" ? reason : "skipped" });
      return;
    }
    const parsed = parseOffer(offer, options);
    if (parsed) {
      seeds.push(parsed);
    } else {
      errors.push("admin.integrator.errors.missingId");
    }
  });

  return { cars: seeds, errors, skipped };
};
