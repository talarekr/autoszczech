import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { useAuth } from "../contexts/AuthContext";
import { useCountdown } from "../hooks/useCountdown";
import { getApiUrl } from "../lib/api";
import { useInventory } from "../contexts/InventoryContext";
import {
  fuelTranslationKey,
  normalizeFuelType,
  normalizeTransmission,
  transmissionTranslationKey,
} from "../lib/lookups";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFirstRegistration,
  formatMileage,
  formatYear,
} from "../lib/format";
import { Car, CarImage, CarOffer } from "../types/car";

const normalizeImageUrls = (images?: CarImage[], apiBase?: string): CarImage[] => {
  if (!images || images.length === 0) {
    return [];
  }

  const base = apiBase?.replace(/\/+$/, "") ?? "";

  return images
    .map((image) => {
      const raw = image?.url?.trim();
      if (!raw) return null;

      if (/^https?:\/\//i.test(raw)) {
        return { ...image, url: raw };
      }

      if (!base) {
        return { ...image, url: raw };
      }

      const normalized = `${base}/${raw.replace(/^\/+/, "")}`;

      return { ...image, url: normalized };
    })
    .filter((image): image is CarImage => Boolean(image?.url));
};

type FeedbackMessage = {
  type: "success" | "error";
  key: string;
  values?: Record<string, string>;
};

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [statusMessageKey, setStatusMessageKey] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [offerFeedback, setOfferFeedback] = useState<FeedbackMessage | null>(null);
  const [offerSubmitting, setOfferSubmitting] = useState<boolean>(false);
  const { isLoggedIn, token } = useAuth();
  const { findCarByIdentifier } = useInventory();
  const { t } = useTranslation();

  const isAuctionActive = (end?: string | null) => {
    if (!end) return true;
    const value = new Date(end).getTime();
    return Number.isFinite(value) ? value > Date.now() : true;
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setErrorKey(null);
    setStatusMessageKey(null);
    setOfferFeedback(null);

    const numericId = Number(id);

    (async () => {
      let apiUrl: string | null = null;
      try {
        apiUrl = await getApiUrl();
        const response = await axios.get<Car>(`${apiUrl}/api/cars/${id}`);
        if (cancelled) return;
        const images = normalizeImageUrls(response.data.images, apiUrl);
        const nextCar = { ...response.data, images };
        if (!isAuctionActive(nextCar.auctionEnd)) {
          setCar(null);
          setActiveImage(null);
          setErrorKey("carDetails.notFound");
          return;
        }
        setCar(nextCar);
        setActiveImage(images[0]?.url ?? null);
        setErrorKey(null);
        setStatusMessageKey(null);
      } catch (error) {
        if (cancelled) return;
        const fallbackCar = id ? findCarByIdentifier(id) : undefined;
        if (fallbackCar) {
          const images = normalizeImageUrls(fallbackCar.images, apiUrl ?? undefined);
          if (isAuctionActive(fallbackCar.auctionEnd)) {
            setCar({ ...fallbackCar, images });
            setActiveImage(images[0]?.url ?? null);
            setStatusMessageKey(fallbackCar.source === "api" ? null : "carDetails.demoMode");
            setErrorKey(null);
          } else {
            setCar(null);
            setActiveImage(null);
            setErrorKey("carDetails.notFound");
          }
        } else if (Number.isFinite(numericId)) {
          const fallbackNumeric = findCarByIdentifier(numericId);
          if (fallbackNumeric) {
            const images = normalizeImageUrls(fallbackNumeric.images, apiUrl ?? undefined);
            if (isAuctionActive(fallbackNumeric.auctionEnd)) {
              setCar({ ...fallbackNumeric, images });
              setActiveImage(images[0]?.url ?? null);
              setStatusMessageKey(fallbackNumeric.source === "api" ? null : "carDetails.demoMode");
              setErrorKey(null);
              return;
            }
            setErrorKey("carDetails.notFound");
            return;
          }
          setErrorKey("carDetails.fetchError");
        } else {
          setErrorKey("carDetails.fetchError");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const countdown = useCountdown(car?.auctionEnd ?? undefined);
  useEffect(() => {
    setOfferAmount("");
  }, [car?.id]);

  const handleOfferSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!car) return;

    const normalized = offerAmount.replace(/\s/g, "");
    const numeric = Number(normalized);

    if (!Number.isFinite(numeric) || numeric <= 0) {
      setOfferFeedback({ type: "error", key: "carDetails.offerForm.invalidAmount" });
      return;
    }

    if (!token) {
      setOfferFeedback({ type: "error", key: "carDetails.offerForm.notLoggedIn" });
      return;
    }

    setOfferSubmitting(true);
    setOfferFeedback(null);

    try {
      const apiUrl = await getApiUrl();
      const response = await axios.post<(CarOffer & { carId: number; message?: string })>(
        `${apiUrl}/offers`,
        {
          carId: car.id,
          displayId: car.displayId,
          amount: numeric,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdOffer = response.data;

      setCar((previous) => {
        if (!previous) return previous;
        const offers = [...(previous.offers ?? []), createdOffer].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return { ...previous, offers };
      });

      setOfferFeedback({
        type: "success",
        key: "carDetails.offerForm.success",
        values: { amount: formatCurrency(numeric) },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setOfferFeedback({ type: "error", key: "carDetails.offerForm.unauthorized" });
          return;
        }

        const serverMessage = typeof error.response?.data?.error === "string" ? error.response.data.error : null;
        if (serverMessage) {
          setOfferFeedback({
            type: "error",
            key: "carDetails.offerForm.serverErrorDetails",
            values: { message: serverMessage },
          });
          return;
        }
      }

      setOfferFeedback({ type: "error", key: "carDetails.offerForm.serverError" });
    } finally {
      setOfferSubmitting(false);
    }
  };

  if (loading) {
    return <p className="rounded-3xl bg-white px-6 py-8 text-center text-sm text-neutral-500 shadow-sm">{t("carDetails.loading")}</p>;
  }

  if (errorKey || !car) {
    return (
      <div className="space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-red-600">
          {t("carDetails.returnToList")}
        </Link>
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-sm font-medium text-red-700 shadow-sm">
          {errorKey ? t(errorKey) : t("carDetails.notFound")}
        </p>
      </div>
    );
  }

  const normalizedFuel = normalizeFuelType(car.fuelType);
  const normalizedTransmission = normalizeTransmission(car.transmission);
  const fuelLabel = normalizedFuel ? t(fuelTranslationKey(normalizedFuel)) : car.fuelType ?? "—";
  const transmissionLabel = normalizedTransmission
    ? t(transmissionTranslationKey(normalizedTransmission))
    : car.transmission ?? "—";

  return (
    <div className="space-y-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-500">
        {t("carDetails.back")}
      </Link>

      {statusMessageKey && (
        <p className="rounded-3xl bg-amber-50 px-6 py-4 text-sm font-medium text-amber-700 shadow-sm">{t(statusMessageKey)}</p>
      )}

      <section className="card space-y-10">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            ID: {car.displayId ?? car.id}
          </p>
          <h1 className="text-4xl font-semibold text-neutral-900">
            {car.make} {car.model}
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] lg:items-start">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl bg-neutral-100">
              {activeImage ? (
                <img src={activeImage} alt={`${car.make} ${car.model}`} className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center text-sm text-neutral-400">{t("carDetails.noImage")}</div>
              )}
            </div>
            {car.images && car.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {car.images.map((image) => (
                  <button
                    key={image.id ?? image.url}
                    type="button"
                    onClick={() => setActiveImage(image.url)}
                    className={`h-24 w-32 flex-shrink-0 overflow-hidden rounded-2xl border ${
                      activeImage === image.url ? "border-red-500 ring-2 ring-red-200" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={t("carDetails.galleryAlt") || ""}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <aside className="flex flex-col gap-6 self-stretch lg:h-full lg:justify-between">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">{t("carDetails.vehicleInfo")}</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <InfoLine label={t("carDetails.info.mileage")} value={formatMileage(car.mileage)} />
                <InfoLine
                  label={t("carDetails.info.firstRegistration")}
                  value={formatFirstRegistration(car.firstRegistrationDate)}
                />
                <InfoLine label={t("carDetails.info.productionYear")} value={formatYear(car.year)} />
                <InfoLine label={t("carDetails.info.fuel")} value={fuelLabel} />
                <InfoLine label={t("carDetails.info.transmission")} value={transmissionLabel} />
              </dl>
            </div>
            <div className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm lg:h-full lg:justify-between">
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">{t("carDetails.countdown.title")}</p>
                <p className="mt-2 text-base font-semibold text-red-700">
                  {car.auctionEnd ? formatDateTime(car.auctionEnd) : t("carDetails.countdown.noDate")}
                </p>
                <p className={`text-lg font-bold ${countdown.ended ? "text-red-300" : "text-red-600"}`}>{countdown.long}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">{t("carDetails.offerForm.title")}</h2>
                {isLoggedIn ? (
                  <form onSubmit={handleOfferSubmit} className="mt-4 space-y-5">
                    <label className="space-y-2 text-sm font-medium text-neutral-600">
                      {t("carDetails.offerForm.amountLabel")}
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(event) => {
                          setOfferAmount(event.target.value);
                          if (offerFeedback) setOfferFeedback(null);
                        }}
                        min={0}
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 shadow-inner focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={offerSubmitting}
                      className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-400"
                    >
                      {offerSubmitting ? t("carDetails.offerForm.submitting") : t("carDetails.offerForm.submit")}
                    </button>
                    {offerFeedback && (
                      <p
                        className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                          offerFeedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {t(offerFeedback.key, offerFeedback.values)}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="mt-4 space-y-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-lg">🔒</span>
                      <div className="space-y-1">
                        <p className="font-semibold">{t("carDetails.loginRequired.title")}</p>
                        <p>
                          {t("carDetails.loginRequired.message")} {" "}
                          <Link to="/login" className="font-semibold text-red-600 underline underline-offset-4">
                            {t("carDetails.loginRequired.loginLink")}
                          </Link>{" "}
                          {t("carDetails.loginRequired.afterLoginLink")} {" "}
                          <Link to="/register" className="font-semibold text-red-600 underline underline-offset-4">
                            {t("carDetails.loginRequired.registerLink")}
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="card space-y-6">
        <h2 className="text-2xl font-semibold text-neutral-900">{t("carDetails.description.title")}</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
          {car.description || t("carDetails.description.fallback")}
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SpecItem label={t("carDetails.specs.vin")} value={car.vin ?? "—"} />
          <SpecItem label={t("carDetails.specs.registrationNumber")} value={car.registrationNumber ?? "—"} />
          <SpecItem label={t("carDetails.specs.firstRegistration")} value={formatDate(car.firstRegistrationDate)} />
          <SpecItem label={t("carDetails.specs.startDate")} value={formatDateTime(car.auctionStart)} />
          <SpecItem label={t("carDetails.specs.endDate")} value={formatDateTime(car.auctionEnd)} />
        </div>
      </section>
    </div>
  );
}

interface InfoLineProps {
  label: string;
  value: string;
}

function InfoLine({ label, value }: InfoLineProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{label}</span>
      <span className="text-base font-semibold text-neutral-800">{value}</span>
    </div>
  );
}

interface SpecItemProps {
  label: string;
  value: string;
}

function SpecItem({ label, value }: SpecItemProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-neutral-800">{value}</p>
    </div>
  );
}
