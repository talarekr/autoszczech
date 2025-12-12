import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDate } from "../lib/format";

const DEFAULT_RATE = 4.35;
const RATE_STORAGE_KEY = "autoszczech.chfRate";

type StoredRate = {
  rate: number;
  effectiveDate: string | null;
  fetchedAt: string;
};

const sanitizeInput = (rawValue: string) => rawValue.replace(/[^0-9.,]/g, "");

export const ChfPlnCalculator: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [rate, setRate] = useState<number>(DEFAULT_RATE);
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoadingRate, setIsLoadingRate] = useState(true);
  const [rateError, setRateError] = useState(false);
  const { t, i18n } = useTranslation();

  const locale = i18n.language.split("-")[0];

  const formatNumber = useMemo(() => {
    return (value: number) =>
      value
        .toLocaleString(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        .replace(/\s/g, " ");
  }, [locale]);

  const parsedAmount = useMemo(() => {
    const normalized = amount.replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const convertedValue = useMemo(() => {
    if (!amount) {
      return "";
    }
    return formatNumber(parsedAmount * rate);
  }, [amount, parsedAmount, rate, formatNumber]);

  const formattedRate = useMemo(() => formatNumber(rate), [formatNumber, rate]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoadingRate(false);
      return;
    }

    let active = true;

    const restoreStoredRate = () => {
      try {
        const raw = window.localStorage.getItem(RATE_STORAGE_KEY);
        if (!raw) return false;
        const parsed: StoredRate = JSON.parse(raw);
        if (typeof parsed.rate !== "number") return false;
        if (active) {
          setRate(parsed.rate);
          setEffectiveDate(parsed.effectiveDate ?? null);
        }
        return true;
      } catch (error) {
        console.warn("Failed to restore stored CHF rate", error);
        return false;
      }
    };

    const fetchRate = async () => {
      try {
        setIsLoadingRate(true);
        setRateError(false);
        const response = await fetch(
          "https://api.nbp.pl/api/exchangerates/rates/a/chf?format=json",
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`NBP rate fetch failed with status ${response.status}`);
        }

        const data = await response.json();
        const apiRate: number | undefined = data?.rates?.[0]?.mid;
        const apiEffectiveDate: string | undefined = data?.rates?.[0]?.effectiveDate;

        if (!apiRate || Number.isNaN(apiRate)) {
          throw new Error("NBP response did not include a numeric rate");
        }

        if (active) {
          setRate(apiRate);
          setEffectiveDate(apiEffectiveDate ?? null);
        }
        const payload: StoredRate = {
          rate: apiRate,
          effectiveDate: apiEffectiveDate ?? null,
          fetchedAt: new Date().toISOString(),
        };
        window.localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(payload));
      } catch (error) {
        console.error("Unable to load CHF rate from NBP", error);
        if (active) {
          setRateError(true);
        }
      } finally {
        if (active) {
          setIsLoadingRate(false);
        }
      }
    };

    restoreStoredRate();
    fetchRate().catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(sanitizeInput(event.target.value));
  };

  const toggleCollapsed = () => {
    setIsCollapsed((previous) => !previous);
  };

  return (
    <div
      className="relative w-full rounded-3xl border border-neutral-200 bg-white/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.07)] backdrop-blur"
      aria-label={t("calculator.heading")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wide text-red-500">{t("calculator.badge")}</span>
          <h2 className="text-lg font-semibold text-neutral-900">{t("calculator.heading")}</h2>
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-500 transition hover:border-red-200 hover:text-red-600"
          aria-expanded={!isCollapsed}
          aria-controls="chf-pln-calculator-panel"
        >
          {isCollapsed ? "+" : "–"}
        </button>
      </div>
      <div
        id="chf-pln-calculator-panel"
        className={`mt-4 space-y-4 transition-[max-height,opacity] duration-300 ease-out ${
          isCollapsed ? "max-h-0 overflow-hidden opacity-0" : "max-h-[700px] opacity-100"
        }`}
        aria-hidden={isCollapsed}
      >
        <p className="text-xs text-neutral-500">{t("calculator.description")}</p>
        <label className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
          {t("calculator.amountLabel")}
          <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder={t("calculator.amountPlaceholder")}
              className="w-full bg-transparent px-3 py-3 text-base font-semibold text-neutral-900 outline-none"
              aria-label={t("calculator.amountAria")}
            />
            <span className="px-3 text-sm font-semibold text-neutral-500">CHF</span>
          </div>
        </label>
        <div className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
          <span>{t("calculator.rateLabel")}</span>
          <div className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <span>{t("calculator.rateValueLabel")}</span>
              <span className="text-base font-semibold text-neutral-900">{formattedRate} PLN</span>
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>{t("calculator.rateSource")}</span>
              {effectiveDate ? (
                <span>{t("calculator.rateUpdated", { date: formatDate(effectiveDate) })}</span>
              ) : (
                <span>{t("calculator.rateUpdated", { date: "—" })}</span>
              )}
            </div>
            {isLoadingRate && (
              <span className="text-xs text-neutral-400">{t("calculator.rateLoading")}</span>
            )}
            {rateError && !isLoadingRate && (
              <span className="text-xs text-red-500">{t("calculator.rateError")}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm font-medium text-neutral-600">
          {t("calculator.resultLabel")}
          <div className="flex items-center overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="w-full px-3 py-3 text-base font-semibold text-neutral-900">
              {convertedValue || t("calculator.resultPlaceholder")}
            </div>
            <span className="px-3 text-sm font-semibold text-neutral-500">PLN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChfPlnCalculator;
