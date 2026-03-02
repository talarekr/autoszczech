import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import CarCard from "../components/CarCard";
import { sampleCars } from "../data/sampleCars";
import { useInventory } from "../contexts/InventoryContext";
import { getApiUrl } from "../lib/api";
import { getHomeListingsCache, setHomeListingsCache } from "../lib/homeListingsCache";
import {
  InsuranceProviderKey,
  orderedInsuranceProviders,
} from "../lib/lookups";
import { Car } from "../types/car";

type SortOption = "endingAsc" | "endingDesc" | "newest";

type MessageKey = string | null;

type CarsListResponse = {
  offset: number;
  limit: number;
  total: number;
  cars: Car[];
};

type CarsCountResponse = {
  count: number;
};

const FIRST_BATCH_SIZE = 50;
const BACKGROUND_BATCH_SIZE = 150;

const parseSortOption = (value: string | null): SortOption => {
  if (value === "endingAsc" || value === "endingDesc" || value === "newest") {
    return value;
  }
  return "endingAsc";
};

const parseProviderOption = (value: string | null): InsuranceProviderKey | "" => {
  if (!value) return "";
  return orderedInsuranceProviders.includes(value as InsuranceProviderKey)
    ? (value as InsuranceProviderKey)
    : "";
};

const dedupeCars = (cars: Car[]) => {
  const byId = new Map<number, Car>();
  cars.forEach((car) => {
    byId.set(car.id, car);
  });
  return Array.from(byId.values());
};

export default function Home() {
  const { cars, replaceBaseCars } = useInventory();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<MessageKey>(null);
  const [statusMessageKey, setStatusMessageKey] = useState<MessageKey>(null);
  const [usingSampleData, setUsingSampleData] = useState<boolean>(
    () => cars.length === 0 || cars.every((car) => (car.source ?? "").toLowerCase() === "sample")
  );
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("q") ?? "");
  const [yearFrom, setYearFrom] = useState(() => searchParams.get("yearFrom") ?? "");
  const [yearTo, setYearTo] = useState(() => searchParams.get("yearTo") ?? "");
  const [sort, setSort] = useState<SortOption>(() => parseSortOption(searchParams.get("sort")));
  const [provider, setProvider] = useState<InsuranceProviderKey | "">(() => parseProviderOption(searchParams.get("provider")));
  const [totalCount, setTotalCount] = useState<number>(cars.length);
  const [loadedCount, setLoadedCount] = useState<number>(cars.length);
  const requestVersionRef = useRef(0);
  const restoredScrollForKeyRef = useRef<string | null>(null);
  const { t } = useTranslation();

  const providerOptions = useMemo(
    () => orderedInsuranceProviders.map((key) => ({ key, label: t(`home.search.providers.${key}`) })),
    [t]
  );

  const nextSearchParams = useMemo(() => {
    const next = new URLSearchParams();

    if (searchTerm.trim()) next.set("q", searchTerm.trim());
    if (yearFrom.trim()) next.set("yearFrom", yearFrom.trim());
    if (yearTo.trim()) next.set("yearTo", yearTo.trim());
    if (sort !== "endingAsc") next.set("sort", sort);
    if (provider) next.set("provider", provider);

    return next;
  }, [provider, searchTerm, sort, yearFrom, yearTo]);

  const queryKey = useMemo(() => nextSearchParams.toString() || "__default__", [nextSearchParams]);

  useEffect(() => {
    if (nextSearchParams.toString() === searchParams.toString()) return;
    setSearchParams(nextSearchParams, { replace: true });
  }, [nextSearchParams, searchParams, setSearchParams]);

  useEffect(() => {
    const cacheEntry = getHomeListingsCache(queryKey);
    if (!cacheEntry) return;

    setTotalCount(cacheEntry.totalCount);
    setLoadedCount(cacheEntry.loadedCount);
    replaceBaseCars(cacheEntry.cars, "api");
    setUsingSampleData(false);

    if (restoredScrollForKeyRef.current !== queryKey) {
      restoredScrollForKeyRef.current = queryKey;
      window.requestAnimationFrame(() => window.scrollTo({ top: cacheEntry.scrollY, behavior: "auto" }));
    }
  }, [queryKey, replaceBaseCars]);

  useEffect(() => {
    requestVersionRef.current += 1;
    const requestVersion = requestVersionRef.current;
    const controller = new AbortController();
    const cached = getHomeListingsCache(queryKey);

    const params = {
      q: searchTerm.trim() || undefined,
      yearFrom: yearFrom.trim() || undefined,
      yearTo: yearTo.trim() || undefined,
      provider: provider || undefined,
      sort,
    };

    const updateCache = (nextCars: Car[], nextTotal: number, scrollY = window.scrollY) => {
      setHomeListingsCache(queryKey, {
        cars: nextCars,
        totalCount: nextTotal,
        loadedCount: nextCars.length,
        isComplete: nextCars.length >= nextTotal,
        scrollY,
      });
    };

    const load = async () => {
      try {
        setErrorKey(null);
        setStatusMessageKey(null);

        let firstCars = cached?.cars ?? [];
        let count = cached?.totalCount ?? 0;

        if (!cached || cached.cars.length === 0) {
          setLoading(true);
          const apiUrl = await getApiUrl();
          const [countResponse, firstBatchResponse] = await Promise.all([
            axios.get<CarsCountResponse>(`${apiUrl}/api/cars/count`, { params, signal: controller.signal }),
            axios.get<CarsListResponse>(`${apiUrl}/api/cars`, {
              params: { ...params, offset: 0, limit: FIRST_BATCH_SIZE },
              signal: controller.signal,
            }),
          ]);

          if (requestVersion !== requestVersionRef.current) return;

          count = Number(countResponse.data?.count ?? 0);
          firstCars = Array.isArray(firstBatchResponse.data?.cars) ? firstBatchResponse.data.cars : [];
          replaceBaseCars(firstCars, "api");
          setTotalCount(count);
          setLoadedCount(firstCars.length);
          setUsingSampleData(false);
          updateCache(firstCars, count);
          setLoading(false);
        } else {
          setTotalCount(count);
          setLoadedCount(firstCars.length);
          replaceBaseCars(firstCars, "api");
          setUsingSampleData(false);
        }

        if (firstCars.length >= count) {
          setIsBackgroundLoading(false);
          return;
        }

        setIsBackgroundLoading(true);
        let mergedCars = [...firstCars];
        let offset = mergedCars.length;
        const apiUrl = await getApiUrl();

        while (offset < count && requestVersion === requestVersionRef.current) {
          const response = await axios.get<CarsListResponse>(`${apiUrl}/api/cars`, {
            params: { ...params, offset, limit: BACKGROUND_BATCH_SIZE },
            signal: controller.signal,
          });

          if (requestVersion !== requestVersionRef.current) {
            return;
          }

          const nextBatch = Array.isArray(response.data?.cars) ? response.data.cars : [];
          if (nextBatch.length === 0) {
            break;
          }

          mergedCars = dedupeCars([...mergedCars, ...nextBatch]);
          offset = mergedCars.length;

          replaceBaseCars(mergedCars, "api");
          setLoadedCount(mergedCars.length);
          updateCache(mergedCars, count);

          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        setIsBackgroundLoading(false);
      } catch {
        if (requestVersion !== requestVersionRef.current) return;

        const fallbackAvailable = sampleCars.length > 0 || cars.length > 0;
        if (cars.length === 0 && sampleCars.length > 0) {
          replaceBaseCars(sampleCars, "sample");
          setTotalCount(sampleCars.length);
          setLoadedCount(sampleCars.length);
        }

        setErrorKey(fallbackAvailable ? null : "home.listings.error");
        setStatusMessageKey("home.listings.demoMode");
        setUsingSampleData(true);
        setLoading(false);
        setIsBackgroundLoading(false);
      }
    };

    void load();

    return () => {
      controller.abort();
      const current = getHomeListingsCache(queryKey);
      if (current) {
        setHomeListingsCache(queryKey, { ...current, scrollY: window.scrollY });
      }
    };
  }, [cars.length, provider, queryKey, replaceBaseCars, searchTerm, sort, yearFrom, yearTo]);

  const filteredCars = cars;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">AutoSzczech</p>
            <h1 className="text-4xl font-semibold text-neutral-900 md:text-5xl">{t("home.hero.title")}</h1>
            <p className="max-w-2xl text-base leading-relaxed text-neutral-600">{t("home.hero.subtitle")}</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-neutral-50 p-4 md:p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="search" className="text-sm font-medium text-neutral-600">
                  {t("home.search.query")}
                </label>
                <input
                  id="search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t("home.search.placeholder")}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
              </div>
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
                  setYearFrom("");
                  setYearTo("");
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
              <span className="text-neutral-900">{totalCount}</span>
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

        {isBackgroundLoading && !loading && (
          <p className="rounded-3xl bg-blue-50 px-6 py-4 text-sm font-medium text-blue-700 shadow-sm">
            Ładowanie kolejnych ofert… ({loadedCount}/{totalCount})
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
