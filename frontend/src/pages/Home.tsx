import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

import CarCard from "../components/CarCard";
import { sampleCars } from "../data/sampleCars";
import { useInventory } from "../contexts/InventoryContext";
import { getApiUrl } from "../lib/api";
import {
  InsuranceProviderKey,
  normalizeProvider,
  orderedInsuranceProviders,
} from "../lib/lookups";
import { Car } from "../types/car";

type SortOption = "endingAsc" | "endingDesc" | "newest";

type MessageKey = string | null;

const isAuctionActive = (car: Car) => {
  if (!car.auctionEnd) return true;
  const end = new Date(car.auctionEnd).getTime();
  return Number.isFinite(end) ? end > Date.now() : true;
};

export default function Home() {
  const { cars, replaceBaseCars } = useInventory();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<MessageKey>(null);
  const [statusMessageKey, setStatusMessageKey] = useState<MessageKey>(null);
  const [usingSampleData, setUsingSampleData] = useState<boolean>(
    () => cars.length === 0 || cars.every((car) => (car.source ?? "").toLowerCase() === "sample")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [sort, setSort] = useState<SortOption>("endingAsc");
  const [provider, setProvider] = useState<InsuranceProviderKey | "">("");
  const { t } = useTranslation();

  const providerOptions = useMemo(
    () => orderedInsuranceProviders.map((key) => ({ key, label: t(`home.search.providers.${key}`) })),
    [t]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorKey(null);

    (async () => {
      try {
        const apiUrl = await getApiUrl();
        const response = await axios.get<Car[]>(`${apiUrl}/api/cars`);
        if (!cancelled) {
          replaceBaseCars(response.data, "api");
          setErrorKey(null);
          setStatusMessageKey(null);
          setUsingSampleData(false);
        }
      } catch (error) {
        if (!cancelled) {
          const hasImported = cars.some((car) => (car.source ?? "").toLowerCase() === "imported");
          const fallbackAvailable = sampleCars.length > 0 || cars.length > 0;
          if (cars.length === 0 && sampleCars.length > 0) {
            replaceBaseCars(sampleCars, "sample");
          }
          setErrorKey(fallbackAvailable ? null : "home.listings.error");
          setStatusMessageKey(hasImported ? null : "home.listings.demoMode");
          setUsingSampleData(!hasImported);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // We intentionally run this effect only on mount to avoid overriding manually imported offers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCars = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const parsedYearFrom = Number(yearFrom) || undefined;
    const parsedYearTo = Number(yearTo) || undefined;

    return cars
      .filter((car) => isAuctionActive(car))
      .filter((car) => {
        if (normalizedSearch) {
          const haystack = `${car.make} ${car.model} ${car.id} ${car.displayId ?? ""}`.toLowerCase();
          if (!haystack.includes(normalizedSearch)) return false;
        }
        if (parsedYearFrom && car.year < parsedYearFrom) return false;
        if (parsedYearTo && car.year > parsedYearTo) return false;

        const normalizedProvider = normalizeProvider(car.provider);
        if (provider && normalizedProvider !== provider) return false;
        if (provider && !normalizedProvider) return false;

        return true;
      })
      .sort((a, b) => {
        if (sort === "newest") return b.id - a.id;

        const dateA = a.auctionEnd ? new Date(a.auctionEnd).getTime() : Number.POSITIVE_INFINITY;
        const dateB = b.auctionEnd ? new Date(b.auctionEnd).getTime() : Number.POSITIVE_INFINITY;

        if (sort === "endingAsc") return dateA - dateB;
        if (sort === "endingDesc") return dateB - dateA;
        return 0;
      });
  }, [cars, searchTerm, yearFrom, yearTo, sort, provider]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-16">
      <section
        id="jak-kupowac"
        className="grid gap-0 overflow-hidden rounded-[32px] bg-white shadow-lg ring-1 ring-neutral-200 md:grid-cols-[1.05fr_1fr]"
      >
        <div className="relative flex flex-col justify-between bg-gradient-to-br from-red-700 via-red-600 to-red-500 px-8 py-10 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-200">{t("home.hero.tagline")}</p>
            <h1 className="mt-4 max-w-lg text-4xl font-extrabold leading-tight">{t("home.hero.title")}</h1>
            <p className="mt-6 max-w-md text-base text-red-100">{t("home.hero.description")}</p>
          </div>
          <div className="mt-10 grid gap-4 text-sm text-red-100">
            <p className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white" /> {t("home.hero.points.access")}
            </p>
            <p className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white" /> {t("home.hero.points.verified")}
            </p>
            <p className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white" /> {t("home.hero.points.logistics")}
            </p>
          </div>
        </div>
        <div className="px-8 py-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">{t("home.search.badge")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">{t("home.search.title")}</h2>
          <form onSubmit={handleSearchSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium text-neutral-600">
                {t("home.search.queryLabel")}
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("home.search.queryPlaceholder")}
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="yearFrom" className="text-sm font-medium text-neutral-600">
                  {t("home.search.yearFrom")}
                </label>
                <input
                  id="yearFrom"
                  type="number"
                  value={yearFrom}
                  onChange={(event) => setYearFrom(event.target.value)}
                  min={1990}
                  max={new Date().getFullYear()}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="yearTo" className="text-sm font-medium text-neutral-600">
                  {t("home.search.yearTo")}
                </label>
                <input
                  id="yearTo"
                  type="number"
                  value={yearTo}
                  onChange={(event) => setYearTo(event.target.value)}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="provider" className="text-sm font-medium text-neutral-600">
                  {t("home.search.provider")}
                </label>
                <select
                  id="provider"
                  value={provider}
                  onChange={(event) => setProvider(event.target.value as InsuranceProviderKey | "")}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                >
                  <option value="">{t("home.search.providerAny")}</option>
                  {providerOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-500"
              >
                {t("home.search.submit")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setYearFrom("2008");
                  setYearTo("2024");
                  setSort("endingAsc");
                  setProvider("");
                }}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-neutral-500 transition hover:text-neutral-800"
              >
                {t("home.search.reset")}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="aukcje-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="aukcje-heading" className="text-3xl font-semibold text-neutral-900">
              {t("home.listings.heading")}
            </h2>
            <p className="text-sm text-neutral-500">{t("home.listings.subheading")}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm">
              <span>{t("home.listings.countLabel")}</span>
              <span className="text-neutral-900">{filteredCars.length}</span>
            </div>
            <label className="flex items-center gap-3 text-sm text-neutral-500">
              <span className="font-medium text-neutral-700">{t("home.listings.sortLabel")}</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              >
                <option value="endingAsc">{t("home.listings.sort.endingAsc")}</option>
                <option value="endingDesc">{t("home.listings.sort.endingDesc")}</option>
                <option value="newest">{t("home.listings.sort.newest")}</option>
              </select>
            </label>
          </div>
        </div>

        {statusMessageKey && (
          <p className="rounded-3xl bg-amber-50 px-6 py-4 text-sm font-medium text-amber-700 shadow-sm">{t(statusMessageKey)}</p>
        )}
        {loading && !usingSampleData && (
          <p className="rounded-3xl bg-white px-6 py-10 text-center text-sm text-neutral-500 shadow-sm">{t("home.listings.loading")}</p>
        )}
        {errorKey && !loading && (
          <p className="rounded-3xl bg-red-50 px-6 py-4 text-sm font-medium text-red-700 shadow-sm">{t(errorKey)}</p>
        )}
        {!loading && !errorKey && filteredCars.length === 0 && (
          <p className="rounded-3xl bg-white px-6 py-10 text-center text-sm text-neutral-500 shadow-sm">
            {t("home.listings.empty")}
          </p>
        )}
        <div className="grid gap-6">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

    </div>
  );
}
