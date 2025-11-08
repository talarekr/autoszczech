import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from "../lib/api";
import CarCard from "../components/CarCard";
import type { Car } from "../lib/types";

const sorters: Record<string, (a: Car, b: Car) => number> = {
  ending_soon: (a, b) => {
    const aTime = a.auctionEnd ? new Date(a.auctionEnd).getTime() : Infinity;
    const bTime = b.auctionEnd ? new Date(b.auctionEnd).getTime() : Infinity;
    return aTime - bTime;
  },
  newest: (a, b) => {
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreated - aCreated;
  },
  price_low: (a, b) => a.price - b.price,
  price_high: (a, b) => b.price - a.price,
};

export default function Home() {
  const { t } = useTranslation();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState<keyof typeof sorters>("ending_soon");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get<Car[]>(`${API_URL}/api/cars`)
      .then((response) => {
        if (!mounted) return;
        setCars(response.data);
      })
      .catch(() => {
        if (!mounted) return;
        setError(t("errors.loadCars"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [t]);

  const years = useMemo(() => {
    const values = Array.from(new Set(cars.map((car) => car.year))).sort((a, b) => b - a);
    return values;
  }, [cars]);

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    let dataset = cars;
    if (lowered) {
      dataset = dataset.filter((car) => {
        const haystack = `${car.make} ${car.model} ${car.location ?? ""} ${car.description ?? ""}`.toLowerCase();
        return haystack.includes(lowered);
      });
    }
    if (year) {
      dataset = dataset.filter((car) => car.year === Number(year));
    }

    const sorter = sorters[sort];
    return [...dataset].sort(sorter);
  }, [cars, query, year, sort]);

  return (
    <div className="space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 px-6 py-12 lg:grid-cols-2 lg:px-12">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-yellow-200">
              {t("hero.badge")}
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-xl text-base text-neutral-300 lg:text-lg">{t("hero.subtitle")}</p>
            <div className="flex flex-wrap gap-3 pt-2 text-sm text-neutral-400">
              <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-2">
                <span className="text-yellow-300">✓</span>
                {t("hero.bullet1")}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-2">
                <span className="text-yellow-300">✓</span>
                {t("hero.bullet2")}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-2">
                <span className="text-yellow-300">✓</span>
                {t("hero.bullet3")}
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-800 bg-neutral-950/60 p-6 shadow-2xl">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-neutral-300" htmlFor="search">
                  {t("search.placeholder")}
                </label>
                <div className="mt-1 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3">
                  <span className="text-neutral-500">🔍</span>
                  <input
                    id="search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("search.inputPlaceholder")}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300" htmlFor="year">
                  {t("search.year")}
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">{t("search.yearAny")}</option>
                  {years.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300" htmlFor="sort">
                  {t("search.sort")}
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as keyof typeof sorters)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="ending_soon">{t("sort.endingSoon")}</option>
                  <option value="newest">{t("sort.newest")}</option>
                  <option value="price_low">{t("sort.priceLow")}</option>
                  <option value="price_high">{t("sort.priceHigh")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">{t("listing.heading")}</h2>
            <p className="text-sm text-neutral-400">{t("listing.subheading", { count: filtered.length })}</p>
          </div>
        </div>

        {loading && <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 text-center text-neutral-400">{t("listing.loading")}</div>}
        {error && !loading && (
          <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-6 text-center text-sm text-red-200">{error}</div>
        )}

        {!loading && !filtered.length && (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-8 text-center text-sm text-neutral-400">
            {t("listing.empty")}
          </div>
        )}

        <div className="grid gap-4">
          {filtered.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>
    </div>
  );
}
