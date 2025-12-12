import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../contexts/AuthContext";
import { useInventory } from "../contexts/InventoryContext";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFirstRegistration,
  formatMileage,
} from "../lib/format";
import { getApiUrl } from "../lib/api";
import { Car, CarOffer } from "../types/car";

const statusTone: Record<string, string> = {
  leading: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  outbid: "bg-amber-100 text-amber-700 ring-amber-200",
  awaiting: "bg-sky-100 text-sky-700 ring-sky-200",
};

const deliveryTone: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  inTransit: "bg-sky-100 text-sky-700 ring-sky-200",
  scheduled: "bg-neutral-200 text-neutral-700 ring-neutral-300",
};

interface UserOffer extends CarOffer {
  message?: string | null;
  car: Car & { offers?: CarOffer[] };
}

type ClientHistoryEntry = {
  car: Car;
  image: string | null;
  slug: string;
  lastBidAmount: number;
  lastBidAt: string;
  status: "leading" | "outbid" | "awaiting";
  totalBids: number;
};

type ClientWinEntry = {
  car: Car;
  image: string | null;
  slug: string;
  finalPrice: number;
  wonAt: string;
  deliveryStatus: "scheduled" | "inTransit" | "delivered";
};

export default function ClientPanel() {
  const { t } = useTranslation();
  const { isLoggedIn, userEmail, token } = useAuth();
  const { findCarByIdentifier } = useInventory();

  const [history, setHistory] = useState<ClientHistoryEntry[]>([]);
  const [wins] = useState<ClientWinEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!isLoggedIn || !token) {
        setHistory([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const apiUrl = await getApiUrl();
        const response = await axios.get<UserOffer[]>(`${apiUrl}/offers/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!isMounted) return;

        const grouped = new Map<number, { car: Car; offers: UserOffer[] }>();

        response.data.forEach((offer) => {
          const car = findCarByIdentifier(offer.car.id) ?? offer.car;
          const existing = grouped.get(car.id) ?? { car, offers: [] };
          existing.offers.push(offer);
          grouped.set(car.id, existing);
        });

        const entries: ClientHistoryEntry[] = Array.from(grouped.values()).map(({ car, offers }) => {
          const sortedUserOffers = [...offers].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const last = sortedUserOffers[0];
          const totalBids = sortedUserOffers.length;

          return {
            car,
            image: car.images?.[0]?.url ?? null,
            slug: `/offer/${car.id}`,
            lastBidAmount: last.amount,
            lastBidAt: last.createdAt,
            totalBids,
            status: "awaiting",
          };
        });

        setHistory(entries);
      } catch (err) {
        console.error("Nie udało się pobrać historii ofert klienta", err);
        if (!isMounted) return;
        setError(t("clientPanel.history.loadError"));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [findCarByIdentifier, isLoggedIn, t, token]);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-neutral-200 bg-white p-10 shadow-lg">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-red-500">
            {t("clientPanel.unauthorized.badge")}
          </p>
          <h1 className="text-3xl font-bold text-neutral-900">{t("clientPanel.unauthorized.title")}</h1>
          <p className="text-neutral-600">{t("clientPanel.unauthorized.description")}</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-6 py-3 font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
          >
            {t("clientPanel.unauthorized.login")}
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3 font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            {t("clientPanel.unauthorized.register")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-red-500">
          {t("clientPanel.badge")}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-neutral-900">{t("clientPanel.title")}</h1>
          {userEmail ? (
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-600 shadow">
              {t("clientPanel.loggedInAs", { email: userEmail })}
            </span>
          ) : null}
        </div>
        <p className="max-w-3xl text-neutral-600">{t("clientPanel.subtitle")}</p>
      </header>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">{t("clientPanel.history.heading")}</h2>
            <p className="text-neutral-600">{t("clientPanel.history.description")}</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <span aria-hidden>←</span>
            {t("clientPanel.history.backToAuctions")}
          </Link>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
            {t("clientPanel.history.loading")}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">{error}</div>
        ) : history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
            {t("clientPanel.history.empty")}
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry) => {
              const tone = statusTone[entry.status] ?? "bg-neutral-200 text-neutral-700 ring-neutral-300";
              return (
                <article
                  key={`${entry.car.id}-history`}
                  className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-red-100 hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 p-6 md:flex-row">
                    <div className="h-40 overflow-hidden rounded-xl md:w-56">
                      {entry.image ? (
                        <img
                          src={entry.image}
                          alt={`${entry.car.make} ${entry.car.model}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                          {t("carCard.noImage")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold text-neutral-900">
                            {entry.car.make} {entry.car.model}
                          </h3>
                          <p className="text-sm font-medium uppercase tracking-[0.3em] text-neutral-400">
                            ID: {entry.car.displayId ?? entry.car.id}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone}`}>
                          {t(`clientPanel.status.${entry.status}`)}
                        </span>
                      </div>
                      <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("clientPanel.fields.lastBid")}</p>
                          <p>{formatCurrency(entry.lastBidAmount)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("clientPanel.fields.lastBidDate")}</p>
                          <p>{formatDateTime(entry.lastBidAt)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("clientPanel.fields.totalBids")}</p>
                          <p>{t("clientPanel.fields.totalBidsValue", { count: entry.totalBids })}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("carCard.productionYear")}</p>
                          <p>{entry.car.year}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("carCard.fuel")}</p>
                          <p>{entry.car.fuelType ?? "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("carCard.transmission")}</p>
                          <p>{entry.car.transmission ?? "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("clientPanel.fields.firstRegistration")}</p>
                          <p>{formatFirstRegistration(entry.car.firstRegistrationDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("clientPanel.fields.mileage")}</p>
                          <p>{formatMileage(entry.car.mileage)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-neutral-900">{t("carCard.auctionEndDate")}</p>
                          <p>{formatDate(entry.car.auctionEnd)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={entry.slug}
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          {t("clientPanel.actions.viewOffer")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-neutral-900">{t("clientPanel.wins.heading")}</h2>
          <p className="text-neutral-600">{t("clientPanel.wins.description")}</p>
        </div>
        {wins.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
            {t("clientPanel.wins.empty")}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {wins.map((entry) => {
              const tone = deliveryTone[entry.deliveryStatus] ?? "bg-neutral-200 text-neutral-700 ring-neutral-300";
              return (
                <article
                  key={`${entry.car.id}-win`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-red-100 hover:shadow-md"
                >
                  <div className="h-48 w-full overflow-hidden">
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt={`${entry.car.make} ${entry.car.model}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                        {t("carCard.noImage")}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-900">
                          {entry.car.make} {entry.car.model}
                        </h3>
                          <p className="text-sm font-medium uppercase tracking-[0.3em] text-neutral-400">
                            ID: {entry.car.displayId ?? entry.car.id}
                          </p>
                      </div>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone}`}>
                        {t(`clientPanel.deliveryStatus.${entry.deliveryStatus}`)}
                      </span>
                    </div>
                    <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="font-semibold text-neutral-900">{t("clientPanel.fields.finalPrice")}</p>
                        <p>{formatCurrency(entry.finalPrice)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-neutral-900">{t("clientPanel.fields.wonAt")}</p>
                        <p>{formatDateTime(entry.wonAt)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={entry.slug}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        {t("clientPanel.actions.viewOffer")}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
