import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { Car, Offer } from "../lib/types";

export default function Admin() {
  const { t } = useTranslation();
  const { user, token, openAuthModal, logout } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") return;
    const fetchData = async () => {
      try {
        const [carsResponse, offersResponse] = await Promise.all([
          axios.get<Car[]>(`${API_URL}/api/cars`),
          axios.get<Offer[]>(`${API_URL}/api/offers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCars(carsResponse.data);
        setOffers(offersResponse.data);
      } catch {
        setImportError(t("admin.loadError"));
      }
    };
    fetchData();
  }, [token, user, t]);

  const handleImport = async (file: File) => {
    if (!token) return;
    try {
      setLoading(true);
      setImportError(null);
      setImportSummary(null);
      const text = await file.text();
      const payload = JSON.parse(text);
      const body = Array.isArray(payload) ? { cars: payload } : payload;
      const response = await axios.post<{ imported: number; errors?: { externalId?: string; error: string }[] }>(
        `${API_URL}/api/cars/import`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setImportSummary(t("admin.importSuccess", { count: response.data.imported }));
      if (response.data.errors && response.data.errors.length > 0) {
        const errorList = response.data.errors
          .map((item) => `${item.externalId ?? "?"}: ${item.error}`)
          .join("\n");
        setImportError(errorList);
      }
      const refreshed = await axios.get<Car[]>(`${API_URL}/api/cars`);
      setCars(refreshed.data);
    } catch (error: any) {
      const message = error?.response?.data?.error ?? error?.message ?? t("admin.importError");
      setImportError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900/70 p-10 text-center text-sm text-neutral-300">
        <h1 className="text-2xl font-semibold text-white">{t("admin.accessTitle")}</h1>
        <p className="mt-3 text-neutral-400">{t("admin.accessDescription")}</p>
        <button
          onClick={() => openAuthModal("login")}
          className="mt-6 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-yellow-300"
        >
          {t("admin.loginCta")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">{t("admin.title")}</h1>
          <p className="text-sm text-neutral-400">{t("admin.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <div className="rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2">{user.email}</div>
          <button onClick={logout} className="rounded-full border border-neutral-700 px-4 py-2 hover:border-yellow-400 hover:text-yellow-400">
            {t("admin.logout")}
          </button>
        </div>
      </div>

      <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
        <h2 className="text-lg font-semibold text-white">{t("admin.importTitle")}</h2>
        <p className="mt-2 text-sm text-neutral-400">{t("admin.importDescription")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm hover:border-yellow-400">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImport(file);
                event.target.value = "";
              }}
            />
            <span>{loading ? t("admin.importLoading") : t("admin.importButton")}</span>
          </label>
          <a
            href="https://autoszczech-api.onrender.com/sample-cars.json"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-yellow-300 hover:text-yellow-200"
          >
            {t("admin.sampleFile")}
          </a>
        </div>
        {importSummary && (
          <div className="mt-4 rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
            {importSummary}
          </div>
        )}
        {importError && (
          <pre className="mt-4 whitespace-pre-line rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {importError}
          </pre>
        )}
      </section>

      <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("admin.carsHeading")}</h2>
          <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs text-neutral-400">{cars.length}</span>
        </div>
        <div className="mt-4 grid gap-3">
          {cars.map((car) => (
            <div key={car.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-300">
                <div>
                  <div className="text-base font-semibold text-white">
                    {car.make} {car.model}
                  </div>
                  <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">#{car.externalId ?? car.id}</div>
                </div>
                <div className="text-sm text-yellow-200">{new Intl.NumberFormat("pl-PL").format(car.price)} zł</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("admin.offersHeading")}</h2>
          <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs text-neutral-400">{offers.length}</span>
        </div>
        <div className="mt-4 grid gap-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-white">{offer.user?.email ?? t("details.anonymous")}</div>
                <div className="text-xs text-neutral-400">{new Date(offer.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-lg font-semibold text-yellow-300">{new Intl.NumberFormat("pl-PL").format(offer.amount)} zł</div>
              {offer.message && <p className="mt-2 text-sm text-neutral-300">“{offer.message}”</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
