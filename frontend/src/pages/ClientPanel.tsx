import axios from "axios";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { Car, CarOffer, Favorite, WinnerStatus } from "../types/car";

const statusTone: Record<string, string> = {
  leading: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  outbid: "bg-amber-100 text-amber-700 ring-amber-200",
  awaiting: "bg-sky-100 text-sky-700 ring-sky-200",
};

const winnerTone: Partial<Record<WinnerStatus, string>> = {
  WON: "bg-amber-900 text-amber-50 ring-amber-200",
  AWARDED: "bg-emerald-600 text-white ring-emerald-300",
};

type Section = "offers" | "favorites" | "settings";
type OffersFilter = "ongoing" | "won" | "all";

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
  winnerStatus?: WinnerStatus | null;
};

type UserProfile = {
  id: number;
  email: string;
  role: string;
  createdAt?: string;
};

const isAuctionActive = (car: Car) => {
  const now = Date.now();
  const start = car.auctionStart ? new Date(car.auctionStart).getTime() : null;
  const end = car.auctionEnd ? new Date(car.auctionEnd).getTime() : null;

  const hasStarted = !start || start <= now;
  const notEnded = !end || end > now;

  return hasStarted && notEnded;
};

export default function ClientPanel() {
  const { t } = useTranslation();
  const { isLoggedIn, userEmail, token, updateSession } = useAuth();
  const { findCarByIdentifier } = useInventory();

  const [section, setSection] = useState<Section>("offers");
  const [offersFilter, setOffersFilter] = useState<OffersFilter>("ongoing");
  const [history, setHistory] = useState<ClientHistoryEntry[]>([]);
  const [wins, setWins] = useState<ClientWinEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    email: userEmail ?? "",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (!isLoggedIn || !token) {
        setHistory([]);
        setWins([]);
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
            status: isAuctionActive(car) ? "leading" : "awaiting",
          };
        });

          const winning: ClientWinEntry[] = [];
          grouped.forEach(({ car, offers }) => {
            const winningOffer = offers.find((offer) => offer.winnerStatus || offer.isWinner);
            if (!winningOffer) return;

            winning.push({
              car,
              image: car.images?.[0]?.url ?? null,
              slug: `/offer/${car.id}`,
              finalPrice: winningOffer.amount,
              wonAt: winningOffer.createdAt,
              winnerStatus: winningOffer.winnerStatus ?? (winningOffer.isWinner ? "WON" : null),
            });
          });

        setHistory(entries);
        setWins(winning);
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

    const fetchFavorites = async () => {
      if (!isLoggedIn || !token) {
        setFavorites([]);
        return;
      }

      setFavoritesLoading(true);
      setFavoritesError(null);

      try {
        const apiUrl = await getApiUrl();
        const response = await axios.get<Favorite[]>(`${apiUrl}/favorites/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted) return;
        setFavorites(response.data);
      } catch (err) {
        console.error("Nie udało się pobrać ulubionych", err);
        if (!isMounted) return;
        setFavoritesError(t("clientPanel.favorites.error"));
      } finally {
        if (isMounted) setFavoritesLoading(false);
      }
    };

    const fetchProfile = async () => {
      if (!isLoggedIn || !token) {
        setProfile(null);
        return;
      }
      setProfileLoading(true);
      setProfileError(null);
      try {
        const apiUrl = await getApiUrl();
        const response = await axios.get<UserProfile>(`${apiUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!isMounted) return;
        setProfile(response.data);
        setProfileForm((prev) => ({ ...prev, email: response.data.email }));
      } catch (err) {
        console.error("Nie udało się pobrać profilu użytkownika", err);
        if (!isMounted) return;
        setProfileError(t("clientPanel.settings.error"));
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };

    fetchHistory();
    fetchFavorites();
    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [findCarByIdentifier, isLoggedIn, t, token]);

  const handleRemoveFavorite = async (carId: number) => {
    if (!token) return;
    setFavoritesLoading(true);
    try {
      const apiUrl = await getApiUrl();
      await axios.delete(`${apiUrl}/favorites/${carId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites((prev) => prev.filter((favorite) => favorite.carId !== carId));
    } catch (err) {
      console.error("Nie udało się usunąć ulubionego pojazdu", err);
      setFavoritesError(t("clientPanel.favorites.error"));
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setProfileError(null);
    setProfileSuccess(null);

    if (profileForm.password && profileForm.password !== profileForm.confirm) {
      setProfileError(t("clientPanel.settings.passwordMismatch"));
      return;
    }

    const payload: { email?: string; password?: string } = {};

    if (profileForm.email && profileForm.email !== profile?.email) {
      payload.email = profileForm.email.trim();
    }

    if (profileForm.password) {
      payload.password = profileForm.password;
    }

    if (Object.keys(payload).length === 0) {
      setProfileSuccess(t("clientPanel.settings.nothingToUpdate"));
      return;
    }

    try {
      const apiUrl = await getApiUrl();
      const response = await axios.put<UserProfile & { token?: string }>(`${apiUrl}/api/auth/me`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile({ id: response.data.id, email: response.data.email, role: response.data.role });
      setProfileSuccess(t("clientPanel.settings.success"));
      setProfileForm((prev) => ({ ...prev, password: "", confirm: "" }));

      if (response.data.token) {
        updateSession({ token: response.data.token, email: response.data.email });
      } else {
        updateSession({ email: response.data.email });
      }
    } catch (err) {
      console.error("Nie udało się zaktualizować profilu", err);
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setProfileError(t("clientPanel.settings.duplicateEmail"));
      } else if (axios.isAxiosError(err) && err.response?.data?.error) {
        setProfileError(err.response.data.error);
      } else {
        setProfileError(t("clientPanel.settings.error"));
      }
    }
  };

  const sections = useMemo(
    () => [
      { id: "offers" as Section, label: t("clientPanel.tabs.offers") },
      { id: "favorites" as Section, label: t("clientPanel.tabs.favorites") },
      { id: "settings" as Section, label: t("clientPanel.tabs.settings") },
    ],
    [t]
  );

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

  const activeHistory = history.filter((entry) => isAuctionActive(entry.car));
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.lastBidAt).getTime() - new Date(a.lastBidAt).getTime()),
    [history]
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-red-500">{t("clientPanel.badge")}</p>
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

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-100 bg-neutral-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-500">{t("clientPanel.tabsLabel")}</p>
            <h2 className="text-xl font-semibold text-neutral-900">{t("clientPanel.tabsHeading")}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.map((item) => {
              const isActive = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-red-200 bg-red-50 text-red-700 shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {section === "offers" && (
            <section className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-neutral-900">{t("clientPanel.offers.title")}</h2>
                  <p className="text-neutral-600">{t("clientPanel.offers.description")}</p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <span aria-hidden>←</span>
                  {t("clientPanel.history.backToAuctions")}
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 rounded-full bg-neutral-100 p-1 text-sm font-semibold text-neutral-700">
                <button
                  type="button"
                  onClick={() => setOffersFilter("ongoing")}
                  className={`rounded-full px-4 py-2 transition ${
                    offersFilter === "ongoing"
                      ? "bg-white text-red-700 shadow-sm"
                      : "text-neutral-700 hover:text-red-700"
                  }`}
                >
                  {t("clientPanel.offers.filters.ongoing")}
                </button>
                <button
                  type="button"
                  onClick={() => setOffersFilter("won")}
                  className={`rounded-full px-4 py-2 transition ${
                    offersFilter === "won" ? "bg-white text-red-700 shadow-sm" : "text-neutral-700 hover:text-red-700"
                  }`}
                >
                  {t("clientPanel.offers.filters.won")}
                </button>
                <button
                  type="button"
                  onClick={() => setOffersFilter("all")}
                  className={`rounded-full px-4 py-2 transition ${
                    offersFilter === "all" ? "bg-white text-red-700 shadow-sm" : "text-neutral-700 hover:text-red-700"
                  }`}
                >
                  {t("clientPanel.offers.filters.all")}
                </button>
              </div>

              {offersFilter === "ongoing" ? (
                loading ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                    {t("clientPanel.history.loading")}
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">{error}</div>
                ) : activeHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                    {t("clientPanel.offers.emptyActive")}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {activeHistory.map((entry) => {
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
                                {entry.status !== "leading" ? (
                                  <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone}`}
                                  >
                                    {t(`clientPanel.status.${entry.status}`)}
                                  </span>
                                ) : null}
                              </div>
                              <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                  <p className="font-semibold text-neutral-900">{t("clientPanel.fields.lastBid")}</p>
                                  <p className="font-bold text-neutral-900">{formatCurrency(entry.lastBidAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold text-neutral-900">{t("carCard.productionYear")}</p>
                                  <p>{entry.car.year}</p>
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
                )
              ) : offersFilter === "all" ? (
                loading ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                    {t("clientPanel.history.loading")}
                  </div>
                ) : error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">{error}</div>
                ) : sortedHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                    {t("clientPanel.offers.emptyAll")}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedHistory.map((entry) => {
                      const tone = statusTone[entry.status] ?? "bg-neutral-200 text-neutral-700 ring-neutral-300";
                      const isActive = isAuctionActive(entry.car);
                      return (
                        <article
                          key={`${entry.car.id}-history-all`}
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
                                {!isActive ? (
                                  <span
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tone}`}
                                  >
                                    {t(`clientPanel.status.${entry.status}`)}
                                  </span>
                                ) : null}
                              </div>
                              <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                  <p className="font-semibold text-neutral-900">{t("clientPanel.fields.lastBid")}</p>
                                  <p className="font-bold text-neutral-900">{formatCurrency(entry.lastBidAmount)}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold text-neutral-900">{t("carCard.productionYear")}</p>
                                  <p>{entry.car.year}</p>
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
                )
              ) : wins.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                  {t("clientPanel.offers.emptyWon")}
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {wins.map((entry) => {
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
                            <div className="flex flex-wrap gap-2">
                              {entry.winnerStatus ? (
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${
                                    winnerTone[entry.winnerStatus] ?? "bg-amber-100 text-amber-800 ring-amber-200"
                                  }`}
                                >
                                  {t(`clientPanel.winnerStatus.${entry.winnerStatus}`)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <div className="grid gap-4 text-sm text-neutral-600 sm:grid-cols-2">
                            <div className="space-y-1">
                              <p className="font-semibold text-neutral-900">{t("clientPanel.fields.finalPrice")}</p>
                              <p className="font-bold text-neutral-900">{formatCurrency(entry.finalPrice)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="font-semibold text-neutral-900">{t("clientPanel.fields.wonAt")}</p>
                              <p>{formatDateTime(entry.wonAt)}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Link
                              to={`${entry.slug}?archived=1`}
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
          )}

          {section === "favorites" && (
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-neutral-900">{t("clientPanel.favorites.heading")}</h2>
                <p className="text-neutral-600">{t("clientPanel.favorites.description")}</p>
              </div>
              {favoritesLoading ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
                  {t("clientPanel.favorites.loading")}
                </div>
              ) : favoritesError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">{favoritesError}</div>
              ) : favorites.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                  {t("clientPanel.favorites.empty")}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((favorite) => {
                    const car = favorite.car;
                    const image = car.images?.[0]?.url ?? null;
                    return (
                      <article
                        key={favorite.id}
                        className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-red-100 hover:shadow-md"
                      >
                        <div className="h-44 w-full overflow-hidden bg-neutral-50">
                          {image ? (
                            <img src={image} alt={`${car.make} ${car.model}`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-neutral-400">
                              {t("carCard.noImage")}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col gap-4 p-5">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-neutral-900">
                              {car.make} {car.model}
                            </h3>
                            <p className="text-sm font-medium uppercase tracking-[0.3em] text-neutral-400">
                              ID: {car.displayId ?? car.id}
                            </p>
                            <p className="text-sm text-neutral-600">
                              {t("clientPanel.favorites.location", { location: car.location || "—" })}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Link
                              to={`/offer/${car.id}`}
                              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              {t("clientPanel.favorites.view")}
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(car.id)}
                              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                              disabled={favoritesLoading}
                            >
                              {t("clientPanel.favorites.remove")}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {section === "settings" && (
            <section className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-neutral-900">{t("clientPanel.settings.heading")}</h2>
                <p className="text-neutral-600">{t("clientPanel.settings.description")}</p>
              </div>
              <form
                className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                onSubmit={handleProfileSubmit}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-semibold text-neutral-900">
                    {t("clientPanel.settings.emailLabel")}
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base font-normal text-neutral-800 shadow-inner focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                      required
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-900">
                    {t("clientPanel.settings.passwordLabel")}
                    <input
                      type="password"
                      value={profileForm.password}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, password: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base font-normal text-neutral-800 shadow-inner focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                      placeholder="••••••••"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-semibold text-neutral-900">
                    {t("clientPanel.settings.confirmPasswordLabel")}
                    <input
                      type="password"
                      value={profileForm.confirm}
                      onChange={(event) => setProfileForm((prev) => ({ ...prev, confirm: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base font-normal text-neutral-800 shadow-inner focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                      placeholder="••••••••"
                    />
                  </label>
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                    {t("clientPanel.settings.helper")}
                    <br />
                    {profile?.createdAt ? (
                      <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500">
                        {t("clientPanel.settings.memberSince", { date: formatDate(profile.createdAt) })}
                      </span>
                    ) : null}
                  </div>
                </div>

                {profileError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</div>
                ) : null}
                {profileSuccess ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {profileSuccess}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                    disabled={profileLoading}
                  >
                    {profileLoading ? t("clientPanel.settings.saving") : t("clientPanel.settings.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm({ email: profile?.email ?? userEmail ?? "", password: "", confirm: "" });
                      setProfileError(null);
                      setProfileSuccess(null);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 px-5 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    {t("clientPanel.settings.reset")}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
