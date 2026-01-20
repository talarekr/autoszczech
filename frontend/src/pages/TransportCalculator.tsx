import { ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const sanitizeCurrencyInput = (value: string) => value.replace(/[^0-9.,]/g, "");

type VehicleType = "car" | "vanL1L2" | "vanL3L4" | "motorcycle";

type EntityOption = {
  vatRate: number;
  labelKey: string;
};

type VehicleOption = {
  labelKey: string;
  baseCostPln: number;
};

const FORWARDING_COST_PLN = 350;
const DEFAULT_CHF_RATE = 4.35;
const DEFAULT_EUR_RATE = 4.7;
const RATE_STORAGE_KEY_CHF = "autoszczech.chfRate";
const RATE_STORAGE_KEY_EUR = "autoszczech.eurRate";

type CustomsOption = {
  rate: number;
  labelKey: string;
};

const VEHICLE_OPTIONS: Record<VehicleType, VehicleOption> = {
  car: { labelKey: "transportCalculator.types.car", baseCostPln: 3000 },
  vanL1L2: { labelKey: "transportCalculator.types.vanL1L2", baseCostPln: 3500 },
  vanL3L4: { labelKey: "transportCalculator.types.vanL3L4", baseCostPln: 4500 },
  motorcycle: { labelKey: "transportCalculator.types.motorcycle", baseCostPln: 1000 },
};

const CUSTOMS_OPTIONS: CustomsOption[] = [
  { rate: 0.1, labelKey: "transportCalculator.customsOptions.nonEu" },
  { rate: 0, labelKey: "transportCalculator.customsOptions.eu" },
];

const ENTITY_OPTIONS: EntityOption[] = [
  { vatRate: 0.19, labelKey: "transportCalculator.entity.individual" },
  { vatRate: 0, labelKey: "transportCalculator.entity.company" },
];

export default function TransportCalculator() {
  const { t, i18n } = useTranslation();
  const [auctionAmount, setAuctionAmount] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [customsRate, setCustomsRate] = useState<number>(0.1);
  const [vatRate, setVatRate] = useState<number>(0.19);
  const [chfRate, setChfRate] = useState<number>(DEFAULT_CHF_RATE);
  const [eurRate, setEurRate] = useState<number>(DEFAULT_EUR_RATE);

  const locale = i18n.language.split("-")[0];

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let active = true;

    const restoreStoredRate = (key: string, setter: (value: number) => void) => {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw) as { rate?: number };
        if (typeof parsed.rate !== "number") return false;
        if (active) {
          setter(parsed.rate);
        }
        return true;
      } catch (error) {
        console.warn("Failed to restore stored rate", error);
        return false;
      }
    };

    const fetchRate = async (currency: "chf" | "eur") => {
      try {
        const response = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${currency}?format=json`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`NBP rate fetch failed with status ${response.status}`);
        }

        const data = await response.json();
        const apiRate: number | undefined = data?.rates?.[0]?.mid;

        if (!apiRate || Number.isNaN(apiRate)) {
          throw new Error("NBP response did not include a numeric rate");
        }

        if (active) {
          if (currency === "chf") {
            setChfRate(apiRate);
          } else {
            setEurRate(apiRate);
          }
        }

        window.localStorage.setItem(
          currency === "chf" ? RATE_STORAGE_KEY_CHF : RATE_STORAGE_KEY_EUR,
          JSON.stringify({ rate: apiRate })
        );
      } catch (error) {
        console.error(`Unable to load ${currency.toUpperCase()} rate from NBP`, error);
      }
    };

    restoreStoredRate(RATE_STORAGE_KEY_CHF, setChfRate);
    restoreStoredRate(RATE_STORAGE_KEY_EUR, setEurRate);
    fetchRate("chf").catch(() => undefined);
    fetchRate("eur").catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const formatChf = useMemo(
    () =>
      (value: number) =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "CHF",
          maximumFractionDigits: 0,
        }).format(value),
    [locale]
  );

  const formatEur = useMemo(
    () =>
      (value: number) =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        }).format(value),
    [locale]
  );

  const formatPln = useMemo(
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
  const customsDuty = auctionValue * customsRate;
  const vatAmount = auctionValue * vatRate;
  const chfToEurRate = eurRate > 0 ? chfRate / eurRate : 0;

  const customsDutyEur = customsDuty * chfToEurRate;
  const vatAmountEur = vatAmount * chfToEurRate;
  const transportCostPln = VEHICLE_OPTIONS[vehicleType].baseCostPln;
  const forwardingCostPln = FORWARDING_COST_PLN;
  const customsDutyPln = customsDuty * chfRate;
  const vatAmountPln = vatAmount * chfRate;
  const totalTransportCostsPln =
    customsDutyPln + vatAmountPln + transportCostPln + forwardingCostPln;
  const customsPercentLabel = Math.round(customsRate * 100);

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
              <span className="text-sm font-semibold text-neutral-500">CHF</span>
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
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">{t("transportCalculator.vehicleHint")}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-neutral-700">{t("transportCalculator.entity.label")}</span>
            <div className="grid gap-3 sm:grid-cols-2">
              {ENTITY_OPTIONS.map((option) => {
                const isSelected = option.vatRate === vatRate;
                return (
                  <label
                    key={option.vatRate}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition ${
                      isSelected ? "border-red-300 bg-red-50" : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="entity"
                      value={option.vatRate}
                      checked={isSelected}
                      onChange={() => setVatRate(option.vatRate)}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-neutral-800">{t(option.labelKey)}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500">{t("transportCalculator.entity.hint")}</p>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-neutral-700">
              {t("transportCalculator.customsLabel")}
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              {CUSTOMS_OPTIONS.map((option) => {
                const isSelected = option.rate === customsRate;
                return (
                  <label
                    key={option.rate}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition ${
                      isSelected ? "border-red-300 bg-red-50" : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="customs"
                      value={option.rate}
                      checked={isSelected}
                      onChange={() => setCustomsRate(option.rate)}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="font-semibold text-neutral-800">{t(option.labelKey)}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-neutral-500">{t("transportCalculator.customsHint")}</p>
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
              {auctionValue > 0 ? formatChf(auctionValue) : t("transportCalculator.summary.auctionPlaceholder")}
            </SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.customs", { rate: customsPercentLabel })}>
              {formatEur(customsDutyEur)}
            </SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.vat")}> 
              {vatRate > 0 ? formatEur(vatAmountEur) : t("transportCalculator.summary.vatZero")}
            </SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.transportPln")}>
              {formatPln(transportCostPln)}
            </SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.forwarding")}>{formatPln(forwardingCostPln)}</SummaryRow>
            <SummaryRow label={t("transportCalculator.summary.transportCosts")}>{formatPln(totalTransportCostsPln)}</SummaryRow>
            <div className="px-4 py-3 text-sm text-neutral-700">
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-neutral-800">
                  {t("transportCalculator.summary.registration.title")}
                  <span className="text-xs font-normal text-neutral-500 group-open:hidden">+</span>
                  <span className="text-xs font-normal text-neutral-500 hidden group-open:inline">−</span>
                </summary>
                <p className="mt-2 text-neutral-600">
                  {t("transportCalculator.summary.registration.content")}
                </p>
              </details>
            </div>
          </div>

        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">{t("transportCalculator.additional.title")}</h2>
        <div className="space-y-3 text-sm text-neutral-700">
          <p>{t("transportCalculator.additional.intro")}</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>{t("transportCalculator.additional.items.excise")}</li>
            <li>{t("transportCalculator.additional.items.usDuty")}</li>
            <li>{t("transportCalculator.additional.items.loadingFee")}</li>
            <li>{t("transportCalculator.additional.items.specialTransport")}</li>
            <li>{t("transportCalculator.additional.items.pickup")}</li>
          </ul>
          <p>{t("transportCalculator.additional.contact")}</p>
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
