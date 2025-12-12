import { ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const sanitizeCurrencyInput = (value: string) => value.replace(/[^0-9.,]/g, "");

type VehicleType = "car" | "vanL1L2" | "vanL3L4" | "motorcycle";

type VehicleOption = {
  labelKey: string;
  baseCost: number;
};

const VEHICLE_OPTIONS: Record<VehicleType, VehicleOption> = {
  car: { labelKey: "transportCalculator.types.car", baseCost: 3350 },
  vanL1L2: { labelKey: "transportCalculator.types.vanL1L2", baseCost: 3850 },
  vanL3L4: { labelKey: "transportCalculator.types.vanL3L4", baseCost: 4850 },
  motorcycle: { labelKey: "transportCalculator.types.motorcycle", baseCost: 1350 },
};

export default function TransportCalculator() {
  const { t, i18n } = useTranslation();
  const [auctionAmount, setAuctionAmount] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");

  const locale = i18n.language.split("-")[0];

  const formatCurrency = useMemo(
    () =>
      (value: number) =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "PLN",
          maximumFractionDigits: 0,
        }).format(value),
    [locale]
  );

  const parsedAuctionAmount = useMemo(() => {
    if (!auctionAmount) return 0;
    const normalized = auctionAmount.replace(/,/g, ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [auctionAmount]);

  const auctionValue = Math.max(parsedAuctionAmount, 0);
  const customsDuty = auctionValue * 0.1;
  const transportCost = VEHICLE_OPTIONS[vehicleType].baseCost;
  const importSubtotal = customsDuty + transportCost;
  const grandTotal = auctionValue + importSubtotal;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">
          {t("transportCalculator.badge")}
        </p>
        <h1 className="text-3xl font-extrabold text-neutral-900">{t("transportCalculator.title")}</h1>
        <p className="max-w-3xl text-base text-neutral-600">{t("transportCalculator.lead")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card space-y-6">
          <div className="space-y-2">
            <label htmlFor="auctionAmount" className="text-sm font-semibold text-neutral-700">
              {t("transportCalculator.auctionLabel")}
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 shadow-inner focus-within:border-red-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-100">
              <input
                id="auctionAmount"
                type="text"
                inputMode="decimal"
                value={auctionAmount}
                onChange={(event) => setAuctionAmount(sanitizeCurrencyInput(event.target.value))}
                placeholder={t("transportCalculator.auctionPlaceholder")}
                className="w-full bg-transparent text-base font-semibold text-neutral-900 outline-none"
                aria-describedby="auction-amount-hint"
              />
              <span className="text-sm font-semibold text-neutral-500">PLN</span>
            </div>
            <p id="auction-amount-hint" className="text-xs text-neutral-500">
              {t("transportCalculator.auctionHint")}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="vehicleType" className="text-sm font-semibold text-neutral-700">
              {t("transportCalculator.vehicleLabel")}
            </label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value as VehicleType)}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-base font-semibold text-neutral-900 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              {Object.entries(VEHICLE_OPTIONS).map(([key, option]) => (
                <option key={key} value={key}>
                  {t(option.labelKey)} · {formatCurrency(option.baseCost)}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">{t("transportCalculator.vehicleHint")}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(VEHICLE_OPTIONS).map(([key, option]) => (
              <div
                key={key}
                className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                  vehicleType === key ? "border-red-300 bg-red-50" : "border-neutral-200 bg-neutral-50"
                }`}
              >
                <div className="flex items-center justify-between text-neutral-700">
                  <span className="font-semibold">{t(option.labelKey)}</span>
                  <span className="text-neutral-500">{formatCurrency(option.baseCost)}</span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{t("transportCalculator.costIncludes")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-neutral-900">{t("transportCalculator.summary.title")}</h2>
            <p className="text-sm text-neutral-600">{t("transportCalculator.summary.description")}</p>
          </div>

          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl bg-neutral-50">
            <SummaryRow label={t("transportCalculator.summary.auctionValue")}>
              {auctionValue > 0 ? formatCurrency(auctionValue) : t("transportCalculator.summary.auctionPlaceholder")}
            </SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.customs")}>{formatCurrency(customsDuty)}</SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.transport")}>{formatCurrency(transportCost)}</SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.importSubtotal")}>{formatCurrency(importSubtotal)}</SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.total")}>{formatCurrency(grandTotal)}</SummaryRow>
          </div>

          <div className="space-y-2 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
            <p className="font-semibold text-neutral-800">{t("transportCalculator.notes.duty")}</p>
            <p>{t("transportCalculator.notes.disclaimer")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  children: ReactNode;
};

const SummaryRow = ({ label, children }: SummaryRowProps) => (
  <div className="flex items-center justify-between px-4 py-3 first:rounded-t-2xl last:rounded-b-2xl">
    <span className="text-sm font-semibold text-neutral-700">{label}</span>
    <span className="text-base font-bold text-neutral-900">{children}</span>
  </div>
);
