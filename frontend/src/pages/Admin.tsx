import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../contexts/AuthContext";
import { getApiUrl } from "../lib/api";
import { formatCurrency, formatDateTime } from "../lib/format";
import type { Car, CarOffer, WinnerStatus } from "../types/car";
import type { AdminUser } from "../types/user";

type AdminOffer = CarOffer & { user?: { id: number; email: string } };
type AdminCar = Car & { offers: AdminOffer[] };

type WinnerButtonState = {
  carId: number;
  offerId: number;
  status: WinnerStatus;
};

const statusTone: Record<WinnerStatus, string> = {
  WON: "bg-amber-900 text-amber-50 ring-amber-200",
  AWARDED: "bg-emerald-600 text-white ring-emerald-300",
};

const insurersFallback = ["AXA", "ALLIANZ", "SCC", "BEST", "REST"];
type AdminSection = "AUCTIONS" | "CLIENTS";

export default function Admin() {
  const { t } = useTranslation();
  const { token, isLoggedIn, userRole } = useAuth();

  const [auctions, setAuctions] = useState<AdminCar[]>([]);
  const [availableInsurers, setAvailableInsurers] = useState<string[]>(insurersFallback);
  const [activeInsurer, setActiveInsurer] = useState<string>(insurersFallback[0]);
  const [activeSection, setActiveSection] = useState<AdminSection>("AUCTIONS");
  const [expandedAuction, setExpandedAuction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<WinnerButtonState | null>(null);
  const [dismissingId, setDismissingId] = useState<number | null>(null);
  const [latestOfferByInsurer, setLatestOfferByInsurer] = useState<Record<string, string>>({});
  const [insurerHasNew, setInsurerHasNew] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(() => Date.now());

  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<AdminUser[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<number | null>(null);

  const isAdmin = isLoggedIn && userRole === "ADMIN";

  const fetchAuctions = async (provider?: string, options?: { silent?: boolean }) => {
    if (!token || !isAdmin) {
      setError(t("admin.bids.authRequired"));
      setAuctions([]);
      return;
    }

    if (!options?.silent) setLoading(true);
    setError(null);

    try {
      const apiUrl = await getApiUrl();
      const response = await axios.get<{
        insurers?: string[];
        cars: AdminCar[];
        latestOffersByProvider?: Record<string, string>;
      }>(`${apiUrl}/api/admin/auctions`, {
        params: provider ? { provider } : undefined,
        headers: { Authorization: `Bearer ${token}` },
      });

      const insurers = response.data.insurers ?? availableInsurers;
      setAvailableInsurers(insurers);
      if (!provider && insurers.length > 0) {
        setActiveInsurer(insurers[0]);
      }

      const latestOffers = response.data.latestOffersByProvider ?? buildLatestOfferMap(response.data.cars ?? []);

      setLatestOfferByInsurer((prev) => {
        const isInitial = Object.keys(prev).length === 0;
        const next = { ...prev };
        const updates: Record<string, boolean> = {};

        insurers.forEach((insurer) => {
          if (next[insurer] === undefined) {
            next[insurer] = latestOffers[insurer] ?? prev[insurer];
          }
        });

        Object.entries(latestOffers).forEach(([providerKey, timestamp]) => {
          const previousTs = next[providerKey];
          if (!previousTs) {
            next[providerKey] = timestamp;
            if (!isInitial) updates[providerKey] = true;
            return;
          }

          const nextTs = new Date(timestamp).getTime();
          const storedTs = new Date(previousTs).getTime();
          if (Number.isFinite(nextTs) && Number.isFinite(storedTs) && nextTs > storedTs) {
            next[providerKey] = timestamp;
            if (!isInitial) updates[providerKey] = true;
          }
        });

        if (Object.keys(updates).length > 0 || isInitial) {
          setInsurerHasNew((prevNotifs) => {
            const merged = { ...prevNotifs };
            insurers.forEach((insurer) => {
              if (merged[insurer] === undefined) merged[insurer] = false;
            });
            Object.entries(updates).forEach(([providerKey, isNew]) => {
              merged[providerKey] = isNew || merged[providerKey] || false;
            });
            return merged;
          });
        }

        return next;
      });

      setAuctions(response.data.cars ?? []);
    } catch (err) {
      console.error("Nie udało się pobrać aukcji do panelu admina", err);
      setError(t("admin.bids.loadError"));
      setAuctions([]);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    if (!token || !isAdmin) {
      setClientsError(t("admin.clients.authRequired"));
      setPendingUsers([]);
      return;
    }

    setClientsLoading(true);
    setClientsError(null);

    try {
      const apiUrl = await getApiUrl();
      const response = await axios.get<{ users: AdminUser[] }>(`${apiUrl}/api/admin/users`, {
        params: { status: "PENDING" },
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingUsers(response.data.users ?? []);
    } catch (err) {
      console.error("Nie udało się pobrać użytkowników oczekujących", err);
      setClientsError(t("admin.clients.loadError"));
      setPendingUsers([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const buildUserDetails = (user: AdminUser) => {
    const entries: [string, unknown][] = [];

    const pushEntry = (key: string, value: unknown) => {
      if (value === undefined || value === null) return;
      if (typeof value === "string" && value.trim() === "") return;
      if (key.toLowerCase().includes("password")) return;
      entries.push([key, value]);
    };

    pushEntry("firstName", user.firstName);
    pushEntry("lastName", user.lastName);
    pushEntry("email", user.email);

    if (user.registrationForm && typeof user.registrationForm === "object") {
      Object.entries(user.registrationForm).forEach(([key, value]) => pushEntry(key, value));
    }

    return entries;
  };

  const formatLabel = (key: string) => {
    const spaced = key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  const formatValue = (value: unknown) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object" && value !== null) return JSON.stringify(value);
    return String(value);
  };

  const buildLatestOfferMap = (cars: AdminCar[]) => {
    const latest: Record<string, string> = {};
    cars.forEach((car) => {
      const provider = car.provider?.toUpperCase();
      if (!provider || !car.offers?.length) return;
      const createdAt = car.offers.reduce<string | null>((newest, offer) => {
        if (!offer.createdAt) return newest;
        if (!newest) return offer.createdAt;
        return new Date(offer.createdAt).getTime() > new Date(newest).getTime() ? offer.createdAt : newest;
      }, null);
      if (!createdAt) return;
      const currentTs = new Date(createdAt).getTime();
      const storedTs = latest[provider] ? new Date(latest[provider]).getTime() : 0;
      if (Number.isFinite(currentTs) && currentTs > storedTs) {
        latest[provider] = createdAt;
      }
    });
    return latest;
  };

  const acknowledgeInsurer = (provider: string) => {
    setInsurerHasNew((prev) => ({ ...prev, [provider]: false }));
  };

  const formatCountdown = (end?: string | null) => {
    if (!end) return { label: null, ended: false, urgent: false } as const;
    const target = new Date(end).getTime();
    if (!Number.isFinite(target)) return { label: null, ended: false, urgent: false } as const;

    const diff = target - now;
    if (diff <= 0) return { label: t("admin.bids.countdown.ended"), ended: true, urgent: false } as const;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [
      days > 0 ? `${days}d` : null,
      hours > 0 || days > 0 ? `${hours}h` : null,
      `${minutes}m`,
      days === 0 ? `${seconds}s` : null,
    ].filter(Boolean);

    return {
      label: parts.join(" "),
      ended: false,
      urgent: diff < 60_000,
    } as const;
  };

  const searchClients = async (term?: string) => {
    if (!token || !isAdmin) {
      setClientsError(t("admin.clients.authRequired"));
      return;
    }

    const query = (term ?? clientSearch).trim();
    if (!query) {
      setSearchedUsers([]);
      return;
    }

    setClientsLoading(true);
    setClientsError(null);

    try {
      const apiUrl = await getApiUrl();
      const response = await axios.get<{ users: AdminUser[] }>(`${apiUrl}/api/admin/users`, {
        params: { search: query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchedUsers(response.data.users ?? []);
    } catch (err) {
      console.error("Nie udało się wyszukać użytkowników", err);
      setClientsError(t("admin.clients.searchError"));
      setSearchedUsers([]);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeSection !== "AUCTIONS") return;
    fetchAuctions(activeInsurer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInsurer, token, isAdmin, activeSection]);

  useEffect(() => {
    if (activeSection !== "AUCTIONS") return undefined;
    const timer = window.setInterval(() => fetchAuctions(activeInsurer, { silent: true }), 20000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, activeInsurer, token, isAdmin]);

  useEffect(() => {
    if (activeSection !== "CLIENTS") return;
    fetchPendingUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, token, isAdmin]);

  const handleSetWinner = async (carId: number, offerId: number, status: WinnerStatus) => {
    if (!token || !isAdmin) return;
    setSaving({ carId, offerId, status });

    try {
      const apiUrl = await getApiUrl();
      const response = await axios.patch<CarOffer>(
        `${apiUrl}/api/offers/${offerId}/winner`,
        { winnerStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAuctions((prev) =>
        prev.map((auction) => {
          if (auction.id !== carId) return auction;
          return {
            ...auction,
            offers: auction.offers.map((offer) =>
              offer.id === offerId
                ? { ...offer, isWinner: true, winnerStatus: response.data.winnerStatus ?? status }
                : { ...offer, isWinner: false, winnerStatus: null }
            ),
          };
        })
      );
    } catch (err) {
      console.error("Nie udało się ustawić zwycięzcy", err);
      setError(t("admin.bids.saveError"));
    } finally {
      setSaving(null);
    }
  };

  const handleDismissAuction = async (carId: number) => {
    if (!token || !isAdmin) return;
    setDismissingId(carId);
    setError(null);

    try {
      const apiUrl = await getApiUrl();
      await axios.patch(
        `${apiUrl}/api/admin/auctions/${carId}/dismiss`,
        undefined,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAuctions((prev) => prev.filter((auction) => auction.id !== carId));
      if (expandedAuction === carId) {
        setExpandedAuction(null);
      }
    } catch (err) {
      console.error("Nie udało się oznaczyć aukcji jako nierozstrzygniętej", err);
      setError(t("admin.bids.saveError"));
    } finally {
      setDismissingId(null);
    }
  };

  const handleApproveUser = async (userId: number) => {
    if (!token || !isAdmin) return;
    setApprovingUserId(userId);
    setClientsError(null);

    try {
      const apiUrl = await getApiUrl();
      const response = await axios.patch<AdminUser>(`${apiUrl}/api/admin/users/${userId}/approve`, undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
      setSearchedUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, registrationStatus: response.data.registrationStatus } : user))
      );
    } catch (err) {
      console.error("Nie udało się zaakceptować użytkownika", err);
      setClientsError(t("admin.clients.approveError"));
    } finally {
      setApprovingUserId(null);
    }
  };

  const visibleAuctions = useMemo(() => {
    if (activeSection !== "AUCTIONS") return [] as AdminCar[];
    return auctions.filter((auction) => auction.offers && auction.offers.length > 0);
  }, [auctions, activeSection]);

  const selectedAuction =
    activeSection === "AUCTIONS" ? visibleAuctions.find((item) => item.id === expandedAuction) : undefined;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">{t("admin.bids.badge")}</p>
        <h1 className="text-3xl font-semibold text-neutral-900">{t("admin.bids.title")}</h1>
        <p className="text-neutral-600">{t("admin.bids.description")}</p>
      </header>

      <section className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
            {t("admin.bids.filters.insurers")}
          </p>
          <div className="flex flex-wrap gap-2">
            {availableInsurers.map((insurer) => (
              <button
                key={insurer}
                type="button"
                onClick={() => {
                  setActiveSection("AUCTIONS");
                  setActiveInsurer(insurer);
                  acknowledgeInsurer(insurer);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition ${
                  activeSection === "AUCTIONS" && insurer === activeInsurer
                    ? "bg-red-600 text-white ring-red-500"
                    : "bg-white text-neutral-700 ring-neutral-200 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span>{insurer}</span>
                  {insurerHasNew[insurer] ? (
                    <span
                      className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500"
                      aria-label={t("admin.bids.newOffers")}
                    />
                  ) : null}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setActiveSection("CLIENTS");
                setExpandedAuction(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ring-1 transition ${
                activeSection === "CLIENTS"
                  ? "bg-neutral-900 text-white ring-neutral-800"
                  : "bg-white text-neutral-700 ring-neutral-200 hover:bg-red-50 hover:text-red-700"
              }`}
            >
              {t("admin.clients.tab")}
            </button>
          </div>
          <button
            type="button"
            onClick={() =>
              activeSection === "AUCTIONS" ? fetchAuctions(activeInsurer) : fetchPendingUsers()
            }
            className="ml-auto inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
          >
            {t("admin.bids.actions.refresh")}
          </button>
        </div>

        {activeSection === "AUCTIONS" ? (
          <>
            {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {loading ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-600">
                {t("admin.bids.loading")}
              </div>
            ) : visibleAuctions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-neutral-600">
                {t("admin.bids.empty")}
              </div>
            ) : (
              <div className="space-y-4">
                {visibleAuctions.map((auction) => {
                  const highest = auction.offers[0];
                  const countdown = formatCountdown(auction.auctionEnd);
                  return (
                    <article
                      key={auction.id}
                      className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-red-100 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
                            {auction.provider ?? "—"}
                          </p>
                          <h2 className="text-xl font-semibold text-neutral-900">
                            {auction.make} {auction.model}
                          </h2>
                          <p className="text-sm text-neutral-600">ID: {auction.displayId ?? auction.id}</p>
                          {countdown.label ? (
                            <div
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ring-1 ${
                                countdown.ended
                                  ? "bg-neutral-100 text-neutral-600 ring-neutral-200"
                                  : countdown.urgent
                                  ? "bg-red-50 text-red-800 ring-red-200"
                                  : "bg-blue-50 text-blue-800 ring-blue-200"
                              }`}
                            >
                              <span>{t("admin.bids.countdown.label")}</span>
                              <span className="font-bold">{countdown.label}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700">
                          <div className="rounded-xl bg-neutral-50 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                              {t("admin.bids.labels.highest")}
                            </p>
                            <p className="font-semibold text-neutral-900">{formatCurrency(highest?.amount)}</p>
                          </div>
                          <div className="rounded-xl bg-neutral-50 px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                              {t("admin.bids.labels.offers")}
                            </p>
                            <p className="font-semibold text-neutral-900">{auction.offers.length}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDismissAuction(auction.id)}
                            disabled={dismissingId === auction.id}
                            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-100 disabled:opacity-70"
                          >
                            {t("admin.bids.actions.dismiss")}
                          </button>
                          <a
                            href={`/offer/${auction.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            {t("admin.bids.actions.viewAuction")}
                          </a>
                          <button
                            type="button"
                            onClick={() => setExpandedAuction(expandedAuction === auction.id ? null : auction.id)}
                            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            {expandedAuction === auction.id
                              ? t("admin.bids.actions.hideOffers")
                              : t("admin.bids.actions.showOffers")}
                          </button>
                        </div>
                      </div>
                      {expandedAuction === auction.id && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200">
                          <table className="min-w-full divide-y divide-neutral-200 text-sm">
                            <thead className="bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold">{t("admin.bids.table.bid")}</th>
                                <th className="px-4 py-3 text-left font-semibold">{t("admin.bids.table.user")}</th>
                                <th className="px-4 py-3 text-left font-semibold">{t("admin.bids.table.placed")}</th>
                                <th className="px-4 py-3 text-left font-semibold">{t("admin.bids.table.message")}</th>
                                <th className="px-4 py-3 text-left font-semibold">{t("admin.bids.table.actions")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {auction.offers.map((offer) => {
                                const activeTone = offer.winnerStatus ? statusTone[offer.winnerStatus] : null;
                                return (
                                  <tr key={offer.id} className="hover:bg-neutral-50/80">
                                    <td className="px-4 py-3 font-semibold text-neutral-900">{formatCurrency(offer.amount)}</td>
                                    <td className="px-4 py-3 text-neutral-700">{offer.user?.email ?? `ID: ${offer.userId}`}</td>
                                    <td className="px-4 py-3 text-neutral-600">{formatDateTime(offer.createdAt)}</td>
                                    <td className="px-4 py-3 text-neutral-600">{offer.message ?? "—"}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex flex-wrap items-center gap-2">
                                        {offer.winnerStatus ? (
                                          <span
                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ring-1 ${
                                              activeTone ?? "bg-amber-100 text-amber-800 ring-amber-200"
                                            }`}
                                          >
                                            {t(`admin.bids.status.${offer.winnerStatus}`)}
                                          </span>
                                        ) : null}
                                        <button
                                          type="button"
                                          onClick={() => handleSetWinner(auction.id, offer.id, "WON")}
                                          disabled={saving?.offerId === offer.id && saving.status === "WON"}
                                          className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-900 transition hover:border-amber-400 hover:bg-amber-100 disabled:opacity-70"
                                        >
                                          {t("admin.bids.status.WON")}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSetWinner(auction.id, offer.id, "AWARDED")}
                                          disabled={saving?.offerId === offer.id && saving.status === "AWARDED"}
                                          className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 disabled:opacity-70"
                                        >
                                          {t("admin.bids.status.AWARDED")}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {clientsError && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{clientsError}</div>}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                      {t("admin.clients.pendingBadge")}
                    </p>
                    <h3 className="text-lg font-semibold text-neutral-900">{t("admin.clients.pendingTitle")}</h3>
                    <p className="text-sm text-neutral-600">{t("admin.clients.pendingDescription")}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-800 ring-1 ring-neutral-200">
                    {pendingUsers.length}
                  </span>
                </div>
                {clientsLoading ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                    {t("admin.clients.loading")}
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-4 text-sm text-neutral-600">
                    {t("admin.clients.pendingEmpty")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map((user) => (
                      <article
                        key={user.id}
                        className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-neutral-900">
                              {[user.firstName, user.lastName].filter(Boolean).join(" ") || t("admin.clients.unknownName")}
                            </p>
                            <p className="text-sm text-neutral-700">{user.email}</p>
                            <p className="text-xs text-neutral-500">{formatDateTime(user.createdAt)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApproveUser(user.id)}
                            disabled={approvingUserId === user.id}
                            className="shrink-0 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
                          >
                            {approvingUserId === user.id
                              ? t("admin.clients.approving")
                              : t("admin.clients.approve")}
                          </button>
                        </div>
                        {buildUserDetails(user).length > 0 ? (
                          <dl className="grid gap-1 text-xs text-neutral-700 sm:grid-cols-2">
                            {buildUserDetails(user).map(([key, value]) => (
                              <div key={`${user.id}-${key}`} className="flex flex-col rounded-lg bg-neutral-50 px-3 py-2">
                                <dt className="font-semibold text-neutral-800">{formatLabel(key)}</dt>
                                <dd className="break-words text-neutral-700">{formatValue(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    {t("admin.clients.searchBadge")}
                  </p>
                  <h3 className="text-lg font-semibold text-neutral-900">{t("admin.clients.searchTitle")}</h3>
                  <p className="text-sm text-neutral-600">{t("admin.clients.searchDescription")}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="search"
                      value={clientSearch}
                      onChange={(event) => setClientSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          searchClients();
                        }
                      }}
                      placeholder={t("admin.clients.searchPlaceholder") ?? undefined}
                      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                    />
                    <button
                      type="button"
                      onClick={() => searchClients()}
                      className="shrink-0 rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-neutral-800"
                    >
                      {t("admin.clients.searchCta")}
                    </button>
                  </div>
                </div>

                {clientsLoading ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                    {t("admin.clients.searching")}
                  </div>
                ) : searchedUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                    {t("admin.clients.searchEmpty")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 shadow-sm"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold text-neutral-900">
                              {[user.firstName, user.lastName].filter(Boolean).join(" ") || t("admin.clients.unknownName")}
                            </p>
                            <p className="text-neutral-700">{user.email}</p>
                            <p className="text-xs text-neutral-500">{formatDateTime(user.createdAt)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {user.registrationStatus ? (
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ring-1 ${
                                user.registrationStatus === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                  : "bg-amber-100 text-amber-800 ring-amber-200"
                              }`}>
                                {t(`admin.clients.status.${user.registrationStatus}`)}
                              </span>
                            ) : null}
                            {user.registrationStatus !== "APPROVED" ? (
                              <button
                                type="button"
                                onClick={() => handleApproveUser(user.id)}
                                disabled={approvingUserId === user.id}
                                className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
                              >
                                {approvingUserId === user.id
                                  ? t("admin.clients.approving")
                                  : t("admin.clients.approve")}
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {buildUserDetails(user).length > 0 ? (
                          <dl className="grid gap-2 text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-3">
                            {buildUserDetails(user).map(([key, value]) => (
                              <div key={`${user.id}-${key}`} className="flex flex-col rounded-lg bg-white px-3 py-2 ring-1 ring-neutral-200">
                                <dt className="font-semibold text-neutral-900">{formatLabel(key)}</dt>
                                <dd className="break-words text-neutral-700">{formatValue(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {activeSection === "AUCTIONS" && selectedAuction && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-900">{t("admin.bids.details.title")}</h3>
          <p className="text-sm text-neutral-600">
            {t("admin.bids.details.subtitle", {
              vehicle: `${selectedAuction.make} ${selectedAuction.model}`.trim(),
              provider: selectedAuction.provider ?? "—",
            })}
          </p>
          <div className="mt-4 grid gap-3 text-sm text-neutral-700 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-2xl bg-neutral-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{t("admin.bids.labels.offers")}</p>
              <p className="text-lg font-semibold text-neutral-900">{selectedAuction.offers.length}</p>
            </div>
            <div className="rounded-2xl bg-neutral-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">{t("admin.bids.labels.highest")}</p>
              <p className="text-lg font-semibold text-neutral-900">{formatCurrency(selectedAuction.offers[0]?.amount)}</p>
            </div>
            <div className="rounded-2xl bg-neutral-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">ID</p>
              <p className="text-lg font-semibold text-neutral-900">{selectedAuction.displayId ?? selectedAuction.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
