import i18n from "../../i18n";

const localeMap: Record<string, string> = {
  pl: "pl-PL",
  en: "en-GB",
  de: "de-DE",
};

function currentLocale(): string {
  const language = i18n.language.split("-")[0];
  return localeMap[language] ?? "pl-PL";
}

export function formatMileage(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${new Intl.NumberFormat(currentLocale()).format(value)} km`;
}

export function formatCurrency(value?: number | null, currency: string = "CHF"): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat(currentLocale(), {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDateTime(value?: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(currentLocale(), options ?? { dateStyle: "long", timeStyle: "short" }).format(date);
}

export function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(currentLocale(), options ?? { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function formatYear(year?: number | null): string {
  if (!year) return "—";
  return `${year}`;
}

export function formatFirstRegistration(value?: string | null): string {
  return formatDate(value, { year: "numeric", month: "2-digit" });
}
