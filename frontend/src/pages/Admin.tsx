import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { sampleCars } from "../data/sampleCars";
import { formatCurrency, formatDateTime, formatMileage } from "../lib/format";
import { useAuth } from "../contexts/AuthContext";
import { useInventory, type CarUpsertInput, type ImportSummary } from "../contexts/InventoryContext";
import { parseInsuranceOffers } from "@shared/importers/insurance";
import { getApiUrl } from "../lib/api";
import type { Car } from "../types/car";

type AuctionStatus = "active" | "planned" | "finished";
type FilterStatus = "all" | AuctionStatus;

type PendingUserType = "buyer" | "supplier";
type TicketPriority = "high" | "medium" | "low";
type TicketStatus = "new" | "inProgress" | "closed";

interface AuctionSummary {
  id: string;
  carId: number;
  vehicle: string;
  provider: string;
  status: AuctionStatus;
  startDate?: string;
  endDate?: string;
  highestBid?: number;
  bids: number;
  watchers: number;
  interestedBuyers: number;
}

interface PendingUser {
  id: number;
  name: string;
  email: string;
  submittedAt: string;
  company?: string;
  type: PendingUserType;
}

interface SupportTicket {
  id: number;
  subject: string;
  customer: string;
  createdAt: string;
  priority: TicketPriority;
  status: TicketStatus;
}

interface ActivityItem {
  id: number;
  label: string;
  timestamp: string;
  actor: string;
}

interface TaskItem {
  id: number;
  label: string;
  dueDate: string;
  owner: string;
  completed: boolean;
}

const computeSeedFromCar = (car: Car) => {
  const key = `${car.displayId ?? ""}-${car.id}`;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 100000;
  }
  return hash + (car.id % 97);
};

const deriveAuctionSummary = (car: Car): AuctionSummary => {
  const now = Date.now();
  const start = car.auctionStart ? new Date(car.auctionStart).getTime() : null;
  const end = car.auctionEnd ? new Date(car.auctionEnd).getTime() : null;

  let status: AuctionStatus = "planned";
  if (end && end < now) {
    status = "finished";
  } else if (start && start > now) {
    status = "planned";
  } else if (!start || start <= now) {
    status = "active";
  }

  const seed = computeSeedFromCar(car);
  const baseBidCount = car.offers?.length ?? 0;
  const bids = status === "planned" ? baseBidCount : baseBidCount + (seed % 7);
  const watchers = 40 + (seed % 90);
  const interested = Math.max(5, Math.round(watchers * 0.2));
  const highestBid = car.offers && car.offers.length > 0 ? car.offers[0]?.amount : undefined;

  return {
    id: car.displayId ?? `CAR-${car.id}`,
    carId: car.id,
    vehicle: `${car.make} ${car.model}`.trim(),
    provider: car.provider ?? "Partner",
    status,
    startDate: car.auctionStart ?? undefined,
    endDate: car.auctionEnd ?? undefined,
    highestBid: highestBid ?? undefined,
    bids,
    watchers,
    interestedBuyers: interested,
  };
};

const pendingUsers: PendingUser[] = [
  {
    id: 341,
    name: "Anna Nowak",
    email: "anna.nowak@example.com",
    submittedAt: "2025-11-07T14:10:00Z",
    company: "Nowak Auto Import",
    type: "supplier",
  },
  {
    id: 342,
    name: "Marek Zieliński",
    email: "marek.zielinski@example.com",
    submittedAt: "2025-11-07T12:05:00Z",
    type: "buyer",
  },
  {
    id: 343,
    name: "Sofia Schneider",
    email: "sofia.schneider@partner-ag.ch",
    submittedAt: "2025-11-06T17:45:00Z",
    company: "Partner AG",
    type: "supplier",
  },
];

const supportTickets: SupportTicket[] = [
  {
    id: 981,
    subject: "Problem z płatnością zabezpieczenia",
    customer: "Karol B.",
    createdAt: "2025-11-08T09:25:00Z",
    priority: "high",
    status: "inProgress",
  },
  {
    id: 982,
    subject: "Prośba o dodanie nowej lokalizacji",
    customer: "Swiss Mobility",
    createdAt: "2025-11-07T15:10:00Z",
    priority: "medium",
    status: "new",
  },
  {
    id: 983,
    subject: "Aktualizacja danych firmy",
    customer: "Helvetia Leasing",
    createdAt: "2025-11-07T10:40:00Z",
    priority: "low",
    status: "inProgress",
  },
];

const activities: ActivityItem[] = [
  {
    id: 1,
    label: "Zakończono aukcję A-230141 – Skoda Octavia",
    timestamp: "2025-11-08T08:00:00Z",
    actor: "system",
  },
  {
    id: 2,
    label: "Dodano nowy pojazd: Volkswagen Transporter T6.1",
    timestamp: "2025-11-07T18:20:00Z",
    actor: "BCP Logistics",
  },
  {
    id: 3,
    label: "Zweryfikowano konto partnera Partner AG",
    timestamp: "2025-11-07T16:05:00Z",
    actor: "Anna Admin",
  },
  {
    id: 4,
    label: "Kupujący Marek Zieliński złożył depozyt zabezpieczający",
    timestamp: "2025-11-07T11:45:00Z",
    actor: "system",
  },
];

const adminTasks: TaskItem[] = [
  {
    id: 1,
    label: "Przygotować eksport CSV zakończonych aukcji z listopada",
    dueDate: "2025-11-10",
    owner: "Kasia",
    completed: false,
  },
  {
    id: 2,
    label: "Zaktualizować stawki transportu dla tras Polska → Czechy",
    dueDate: "2025-11-11",
    owner: "Michał",
    completed: false,
  },
  {
    id: 3,
    label: "Przygotować kampanię mailingową o nowych aukcjach EV",
    dueDate: "2025-11-12",
    owner: "Joanna",
    completed: true,
  },
];

const filterStatuses: FilterStatus[] = ["all", "active", "planned", "finished"];

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("active");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();
  const { cars, registerImportedCars, replaceBaseCars } = useInventory();
  const { token, userRole, isLoggedIn } = useAuth();
  const isAdmin = isLoggedIn && userRole === "ADMIN";
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState<number>(() => Date.now());
  const [imageBaseUrl, setImageBaseUrl] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const auctionSummaries = useMemo(() => {
    const dataset = cars.length > 0 ? cars : sampleCars;
    return dataset.map(deriveAuctionSummary);
  }, [cars]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setImportFiles(files);
  };

  const handleImportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (importing) return;

    if (!isAdmin) {
      setImportErrors(["admin.integrator.errors.authRequired"]);
      setImportSummary(null);
      return;
    }

    if (importFiles.length === 0) {
      setImportErrors(["admin.integrator.errors.noFiles"]);
      setImportSummary(null);
      return;
    }

    setImporting(true);
    try {
      const aggregated: CarUpsertInput[] = [];
      const rawPayloads: unknown[] = [];
      const errorKeys: string[] = [];
      for (const file of importFiles) {
        try {
          const raw = await file.text();
          const payload = JSON.parse(raw);
          rawPayloads.push(payload);
          const { cars: parsedCars, errors } = parseInsuranceOffers(payload, {
            imageBaseUrl: imageBaseUrl.trim() || undefined,
          });
          aggregated.push(...(parsedCars.map((car) => ({ ...car })) as CarUpsertInput[]));
          errorKeys.push(...errors);
        } catch (error) {
          errorKeys.push("admin.integrator.errors.parseFailed");
        }
      }

      if (aggregated.length === 0 && errorKeys.length === 0) {
        errorKeys.push("admin.integrator.errors.noOffers");
      }

      let summary: ImportSummary | null = null;

      if (aggregated.length > 0) {
        try {
          const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
          const apiUrl = await getApiUrl();
          const response = await axios.post(
            `${apiUrl}/api/cars/import`,
            {
              payloads: rawPayloads,
              imageBaseUrl: imageBaseUrl.trim() || undefined,
            },
            { headers }
          );

          const apiSummary = response.data?.summary;
          const apiCars = response.data?.cars;

          if (Array.isArray(apiCars)) {
            replaceBaseCars(apiCars, "api");
          } else {
            summary = registerImportedCars(aggregated);
          }

          if (apiSummary) {
            summary = {
              added: Number(apiSummary.added) || 0,
              updated: Number(apiSummary.updated) || 0,
              skipped: Number(apiSummary.skipped) || 0,
              total: Number(apiSummary.total) || aggregated.length,
            };
            if (Array.isArray(apiSummary.errors)) {
              errorKeys.push(...apiSummary.errors);
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            errorKeys.push("admin.integrator.errors.authRequired");
          } else {
            errorKeys.push("admin.integrator.errors.uploadFailed");
          }
          summary = registerImportedCars(aggregated);
        }
      }

      const uniqueErrors = Array.from(new Set(errorKeys));

      setImportSummary(summary);
      setImportErrors(uniqueErrors);
      setImportFiles([]);
      setFileInputKey(Date.now());
    } finally {
      setImporting(false);
    }
  };

  const providerOptions = useMemo(() => {
    const providers = Array.from(new Set(auctionSummaries.map((item) => item.provider)));
    return ["all", ...providers];
  }, [auctionSummaries]);

  const filteredAuctions = useMemo(() => {
    return auctionSummaries.filter((auction) => {
      if (statusFilter !== "all" && auction.status !== statusFilter) return false;
      if (providerFilter !== "all" && auction.provider !== providerFilter) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          auction.vehicle.toLowerCase().includes(query) ||
          auction.id.toLowerCase().includes(query) ||
          auction.provider.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [auctionSummaries, statusFilter, providerFilter, searchTerm]);

  const metrics = useMemo(() => {
    if (auctionSummaries.length === 0) {
      return {
        activeCount: 0,
        plannedCount: 0,
        finishedCount: 0,
        plannedWatchers: 0,
        finishedSales: 0,
        totalBids: 0,
        totalInterested: 0,
        averageWatchers: 0,
      };
    }

    const activeAuctions = auctionSummaries.filter((auction) => auction.status === "active");
    const plannedAuctions = auctionSummaries.filter((auction) => auction.status === "planned");
    const finishedAuctions = auctionSummaries.filter((auction) => auction.status === "finished");

    const totalBids = auctionSummaries.reduce((sum, auction) => sum + auction.bids, 0);
    const totalInterested = auctionSummaries.reduce((sum, auction) => sum + auction.interestedBuyers, 0);
    const averageWatchers = Math.round(
      auctionSummaries.reduce((sum, auction) => sum + auction.watchers, 0) / auctionSummaries.length
    );
    const plannedWatchers = plannedAuctions.reduce((sum, auction) => sum + auction.watchers, 0);
    const finishedSales = finishedAuctions.reduce((sum, auction) => sum + (auction.highestBid ?? 0), 0);

    return {
      activeCount: activeAuctions.length,
      plannedCount: plannedAuctions.length,
      finishedCount: finishedAuctions.length,
      plannedWatchers,
      finishedSales,
      totalBids,
      totalInterested,
      averageWatchers,
    };
  }, [auctionSummaries]);

  const providerPerformance = useMemo(() => {
    const grouped = new Map<string, { auctions: number; totalBids: number; highestBid: number }>();
    for (const auction of auctionSummaries) {
      if (!grouped.has(auction.provider)) {
        grouped.set(auction.provider, { auctions: 0, totalBids: 0, highestBid: 0 });
      }
      const current = grouped.get(auction.provider)!;
      current.auctions += 1;
      current.totalBids += auction.bids;
      current.highestBid = Math.max(current.highestBid, auction.highestBid ?? 0);
    }

    return Array.from(grouped.entries()).map(([provider, stats]) => ({
      provider,
      auctions: stats.auctions,
      totalBids: stats.totalBids,
      recordPrice: stats.highestBid,
    }));
  }, [auctionSummaries]);

  const verificationCounts = {
    suppliers: pendingUsers.filter((user) => user.type === "supplier").length,
    buyers: pendingUsers.filter((user) => user.type === "buyer").length,
  };

  const vehicles = useMemo(() => {
    return cars.map((car) => ({
      id: car.id,
      name: `${car.make} ${car.model}`,
      mileage: car.mileage,
      provider: car.provider ?? "AutoSzczech",
      fuelType: car.fuelType,
      transmission: car.transmission,
      price: car.price,
      status:
        auctionSummaries.find((auction) => auction.carId === car.id)?.status ??
        (car.auctionEnd ? "active" : "planned"),
    }));
  }, [cars, auctionSummaries]);

  const selectedFileNames = useMemo(() => importFiles.map((file) => file.name), [importFiles]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">{t("admin.badge")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-900">{t("admin.title")}</h1>
          <p className="text-sm text-neutral-500">{t("admin.description")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value)}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            {providerOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? t("admin.filters.providerAll") : option}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-sm">
            {filterStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest transition ${
                  statusFilter === status ? "bg-red-600 text-white" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {status === "all" ? t("common.auctionStatus.all") : t(`common.auctionStatus.${status}`)}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder={t("admin.filters.searchPlaceholder") ?? ""}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 sm:w-64"
          />
        </div>
      </header>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-neutral-900">{t("admin.integrator.title")}</h2>
            <p className="text-sm text-neutral-500">{t("admin.integrator.description")}</p>
          </div>
          {importSummary ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-600">
              {t("admin.integrator.summary.total", { count: importSummary.total })}
            </span>
          ) : null}
        </div>

        <form onSubmit={handleImportSubmit} className="mt-6 space-y-5">
          {!isAdmin && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t("admin.integrator.authHint")}
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="integrator-files" className="text-sm font-medium text-neutral-700">
              {t("admin.integrator.fileLabel")}
            </label>
            <input
              key={fileInputKey}
              id="integrator-files"
              name="integrator-files"
              type="file"
              accept=".json,application/json"
              multiple
              onChange={handleFileChange}
              disabled={importing || !isAdmin}
              className="w-full cursor-pointer rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm text-neutral-700 transition hover:border-red-300 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
            />
            {selectedFileNames.length > 0 ? (
              <ul className="space-y-1 text-xs text-neutral-500">
                {selectedFileNames.map((name) => (
                  <li key={name} className="truncate">
                    {name}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="integrator-base-url" className="text-sm font-medium text-neutral-700">
              {t("admin.integrator.baseUrlLabel")}
            </label>
            <input
              id="integrator-base-url"
              name="integrator-base-url"
              type="url"
              value={imageBaseUrl}
              onChange={(event) => setImageBaseUrl(event.target.value)}
              disabled={importing || !isAdmin}
              placeholder="https://cdn.example.com/offers"
              className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
            />
            <p className="text-xs text-neutral-400">{t("admin.integrator.baseUrlHelp")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={importing || !isAdmin}
              className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition ${
                importing || !isAdmin ? "bg-neutral-400" : "bg-red-600 hover:bg-red-500"
              }`}
            >
              {importing ? t("admin.integrator.importing") : t("admin.integrator.importButton")}
            </button>
            {importSummary ? (
              <div className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                {t("admin.integrator.summary.preview", {
                  added: importSummary.added,
                  updated: importSummary.updated,
                  skipped: importSummary.skipped,
                })}
              </div>
            ) : null}
          </div>
        </form>

        {importSummary ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            <p className="text-sm font-semibold text-neutral-800">{t("admin.integrator.summary.title")}</p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {t("admin.integrator.summary.addedLabel")}
                </dt>
                <dd className="text-lg font-semibold text-neutral-900">{importSummary.added}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {t("admin.integrator.summary.updatedLabel")}
                </dt>
                <dd className="text-lg font-semibold text-neutral-900">{importSummary.updated}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {t("admin.integrator.summary.skippedLabel")}
                </dt>
                <dd className="text-lg font-semibold text-neutral-900">{importSummary.skipped}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {t("admin.integrator.summary.totalLabel")}
                </dt>
                <dd className="text-lg font-semibold text-neutral-900">{importSummary.total}</dd>
              </div>
            </dl>
          </div>
        ) : null}

        {importErrors.length > 0 ? (
          <div className="mt-6 space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">{t("admin.integrator.errors.title")}</p>
            <ul className="list-disc space-y-1 pl-5">
              {importErrors.map((errorKey) => (
                <li key={errorKey}>{t(errorKey)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title={t("admin.metrics.active.title")}
          value={metrics.activeCount}
          helper={t("admin.metrics.active.helper")}
          tone="positive"
        />
        <MetricCard
          title={t("admin.metrics.planned.title")}
          value={metrics.plannedCount}
          helper={t("admin.metrics.planned.helper", { watchers: metrics.plannedWatchers })}
          tone="neutral"
        />
        <MetricCard
          title={t("admin.metrics.finished.title")}
          value={metrics.finishedCount}
          helper={t("admin.metrics.finished.helper", { value: formatCurrency(metrics.finishedSales) })}
          tone="neutral"
        />
        <MetricCard
          title={t("admin.metrics.engagement.title")}
          value={metrics.totalBids}
          helper={t("admin.metrics.engagement.helper", { interested: metrics.totalInterested })}
          tone="positive"
        />
        <MetricCard
          title={t("admin.metrics.watchers.title")}
          value={metrics.averageWatchers}
          helper={t("admin.metrics.watchers.helper")}
          tone="neutral"
        />
      </section>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">{t("admin.tables.auctions.title")}</h2>
            <span className="text-sm text-neutral-500">{t("admin.tables.auctions.countLabel", { count: filteredAuctions.length })}</span>
          </div>
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.auction")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.partner")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.status")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.start")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.end")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.bids")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.highestBid")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.auctions.headers.watchers")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredAuctions.map((auction) => (
                  <tr key={auction.id} className="hover:bg-neutral-50/80">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900">{auction.vehicle}</div>
                      <div className="text-xs text-neutral-500">ID: {auction.id}</div>
                    </td>
                    <td className="px-5 py-4 text-neutral-700">{auction.provider}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                          auction.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : auction.status === "planned"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {t(`common.auctionStatus.${auction.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">{formatDateTime(auction.startDate, { dateStyle: "short" })}</td>
                    <td className="px-5 py-4 text-neutral-600">{formatDateTime(auction.endDate, { dateStyle: "short" })}</td>
                    <td className="px-5 py-4 text-neutral-700">{auction.bids}</td>
                    <td className="px-5 py-4 text-neutral-900">{formatCurrency(auction.highestBid)}</td>
                    <td className="px-5 py-4 text-neutral-700">{auction.watchers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">{t("admin.verification.title")}</h3>
            <p className="mt-3 text-3xl font-semibold text-neutral-900">{t("admin.verification.submissions", { count: pendingUsers.length })}</p>
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              {t("admin.verification.summary", {
                suppliers: verificationCounts.suppliers,
                buyers: verificationCounts.buyers,
              })}
            </p>
            <ul className="mt-5 space-y-4 text-sm">
              {pendingUsers.map((user) => (
                <li key={user.id} className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <div className="flex items-center justify-between text-neutral-700">
                    <span className="font-semibold">{user.name}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                      {t(`common.userType.${user.type}`)}
                    </span>
                  </div>
                  {user.company && <p className="text-xs text-neutral-500">{user.company}</p>}
                  <p className="text-xs text-neutral-500">{user.email}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {t("admin.verification.submittedAt")} {formatDateTime(user.submittedAt, { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">{t("admin.support.title")}</h3>
            <ul className="mt-4 space-y-4 text-sm">
              {supportTickets.map((ticket) => (
                <li key={ticket.id} className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">#{ticket.id}</span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-widest ${
                        ticket.priority === "high"
                          ? "text-red-600"
                          : ticket.priority === "medium"
                          ? "text-amber-600"
                          : "text-neutral-500"
                      }`}
                    >
                      {t(`common.ticketPriority.${ticket.priority}`)}
                    </span>
                  </div>
                  <p className="mt-1 font-medium text-neutral-700">{ticket.subject}</p>
                  <p className="text-xs text-neutral-500">{ticket.customer}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {t("admin.support.status")} {t(`common.ticketStatus.${ticket.status}`)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">{t("admin.tables.vehicles.title")}</h2>
            <span className="text-sm text-neutral-500">{t("admin.tables.vehicles.countLabel", { count: vehicles.length })}</span>
          </div>
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.vehicles.headers.vehicle")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.vehicles.headers.parameters")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.vehicles.headers.provider")}</th>
                  <th className="px-5 py-4 text-left font-semibold">{t("admin.tables.vehicles.headers.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-neutral-50/80">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-neutral-900">{vehicle.name}</div>
                      <div className="text-xs text-neutral-500">ID: {vehicle.id}</div>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      <p>{formatMileage(vehicle.mileage)}</p>
                      <p className="text-xs text-neutral-500">
                        {vehicle.fuelType} · {vehicle.transmission}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-neutral-700">{vehicle.provider}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                          vehicle.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : vehicle.status === "planned"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-neutral-200 text-neutral-600"
                        }`}
                      >
                        {t(`common.auctionStatus.${vehicle.status}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">{t("admin.activity.title")}</h3>
            <ul className="mt-4 space-y-4 text-sm">
              {activities.map((activity) => (
                <li key={activity.id} className="border-l-2 border-red-200 pl-3">
                  <p className="font-medium text-neutral-800">{activity.label}</p>
                  <p className="text-xs text-neutral-500">{formatDateTime(activity.timestamp, { dateStyle: "short", timeStyle: "short" })}</p>
                  <p className="text-xs text-neutral-400">{activity.actor}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">{t("admin.tasks.title")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {adminTasks.map((task) => (
                <li key={task.id} className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <input type="checkbox" checked={task.completed} readOnly className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500" />
                  <div>
                    <p className="font-medium text-neutral-800">{task.label}</p>
                    <p className="text-xs text-neutral-500">
                      {t("admin.tasks.due")} {formatDateTime(task.dueDate, { dateStyle: "medium" })}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {t("admin.tasks.owner")} {task.owner}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">{t("admin.partners.title")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {providerPerformance.map((provider) => (
                <li key={provider.provider} className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <p className="font-semibold text-neutral-800">{provider.provider}</p>
                  <p className="text-xs text-neutral-500">
                    {t("admin.partners.summary", { auctions: provider.auctions, bids: provider.totalBids })}
                  </p>
                  <p className="text-xs text-neutral-400">{t("admin.partners.record")}: {formatCurrency(provider.recordPrice)}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  helper: string;
  tone: "positive" | "neutral";
}

function MetricCard({ title, value, helper, tone }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-neutral-200 bg-white px-5 py-6 shadow-sm ring-1 ring-transparent transition hover:-translate-y-1 hover:shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-neutral-900">{value}</p>
      <p className={`mt-2 text-xs font-medium uppercase tracking-widest ${tone === "positive" ? "text-emerald-600" : "text-neutral-500"}`}>
        {helper}
      </p>
    </article>
  );
}
