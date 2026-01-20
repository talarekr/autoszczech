export type FuelTypeKey = "petrol" | "diesel" | "electric" | "hybrid" | "lpg";
export type TransmissionKey = "automatic" | "manual" | "semiAutomatic";
export type InsuranceProviderKey = "BEST" | "REST" | "AXA" | "ALLIANZ" | "SCC";

const fuelStringToKey = new Map<string, FuelTypeKey>([
  ["benzyna", "petrol"],
  ["petrol", "petrol"],
  ["gasoline", "petrol"],
  ["benzin", "petrol"],
  ["diesel", "diesel"],
  ["olej napędowy", "diesel"],
  ["elektryczny", "electric"],
  ["electric", "electric"],
  ["elektrisch", "electric"],
  ["hybryda", "hybrid"],
  ["hybrid", "hybrid"],
  ["hybridantrieb", "hybrid"],
  ["lpg", "lpg"],
  ["gaz", "lpg"],
  ["autogas", "lpg"],
]);

const transmissionStringToKey = new Map<string, TransmissionKey>([
  ["automatyczna", "automatic"],
  ["automatic", "automatic"],
  ["automatik", "automatic"],
  ["manualna", "manual"],
  ["manual", "manual"],
  ["schaltgetriebe", "manual"],
  ["półautomatyczna", "semiAutomatic"],
  ["semi-automatic", "semiAutomatic"],
  ["halbautomatik", "semiAutomatic"],
]);

export function normalizeFuelType(value?: string | null): FuelTypeKey | null {
  if (!value) return null;
  const key = fuelStringToKey.get(value.toLowerCase());
  return key ?? null;
}

export function normalizeTransmission(value?: string | null): TransmissionKey | null {
  if (!value) return null;
  const key = transmissionStringToKey.get(value.toLowerCase());
  return key ?? null;
}

export function fuelTranslationKey(key: FuelTypeKey): string {
  return `common.fuel.${key}`;
}

export function transmissionTranslationKey(key: TransmissionKey): string {
  return `common.transmission.${key}`;
}

export function normalizeProvider(value?: string | null): InsuranceProviderKey | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (normalized.startsWith("BEST")) return "BEST";
  if (normalized.startsWith("REST")) return "REST";
  if (normalized.startsWith("AXA")) return "AXA";
  if (normalized.startsWith("ALLIANZ")) return "ALLIANZ";
  if (normalized.startsWith("SCC")) return "SCC";
  return null;
}

export const orderedFuelTypes: FuelTypeKey[] = ["petrol", "diesel", "electric", "hybrid", "lpg"];
export const orderedTransmissions: TransmissionKey[] = ["automatic", "manual", "semiAutomatic"];
export const orderedInsuranceProviders: InsuranceProviderKey[] = ["BEST", "REST", "AXA", "ALLIANZ", "SCC"];
