import { FormEvent, useEffect, useRef, useState } from "react";
import type React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { useAuth } from "../contexts/AuthContext";
import { useCountdown } from "../hooks/useCountdown";
import { getApiUrl } from "../lib/api";
import { useInventory } from "../contexts/InventoryContext";
import {
  formatCurrency,
  formatDateTime,
  formatFirstRegistration,
  formatMileage,
  formatYear,
} from "../lib/format";
import type { DescriptionEntry } from "@shared/importers/insurance";

import { Car, CarImage, CarOffer, Favorite } from "../types/car";

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
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<boolean>(false);
  const [favoriteFeedback, setFavoriteFeedback] = useState<FeedbackMessage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [translationTarget, setTranslationTarget] = useState<string>("pl");
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [translatedDescriptionDetails, setTranslatedDescriptionDetails] = useState<DescriptionEntry[] | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationErrorKey, setTranslationErrorKey] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [lightboxTouchStartX, setLightboxTouchStartX] = useState<number | null>(null);
  const { isLoggedIn, token } = useAuth();
  const { findCarByIdentifier } = useInventory();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const swipeHandledRef = useRef(false);
  const lightboxSwipeHandledRef = useRef(false);

  const allowArchived = searchParams.get("archived") === "1";

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
        if (!allowArchived && !isAuctionActive(nextCar.auctionEnd)) {
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
          if (allowArchived || isAuctionActive(fallbackCar.auctionEnd)) {
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
            if (allowArchived || isAuctionActive(fallbackNumeric.auctionEnd)) {
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
  }, [allowArchived, id]);

  const countdown = useCountdown(car?.auctionEnd ?? undefined);
  useEffect(() => {
    setOfferAmount("");
    setFavoriteId(null);
    setFavoriteFeedback(null);
    setTranslatedDescription(null);
    setTranslatedDescriptionDetails(null);
    setTranslationErrorKey(null);
    setTranslationLoading(false);
    setTranslationTarget(i18n.language || "pl");
  }, [car?.id]);

  useEffect(() => {
    const loadFavorite = async () => {
      if (!car?.id || !isLoggedIn || !token) {
        setFavoriteId(null);
        return;
      }

      setFavoriteLoading(true);
      try {
        const apiUrl = await getApiUrl();
        const response = await axios.get<Favorite[]>(`${apiUrl}/favorites/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const match = response.data.find((entry) => entry.carId === car.id);
        setFavoriteId(match?.id ?? null);
      } catch (error) {
        console.error("Nie udało się pobrać listy ulubionych", error);
        setFavoriteFeedback({ type: "error", key: "carDetails.favorites.loadError" });
      } finally {
        setFavoriteLoading(false);
      }
    };

    loadFavorite();
  }, [car?.id, isLoggedIn, token]);

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

  const handleToggleFavorite = async () => {
    if (!car) return;

    if (!isLoggedIn || !token) {
      setFavoriteFeedback({ type: "error", key: "carDetails.favorites.loginRequired" });
      return;
    }

    setFavoriteLoading(true);
    setFavoriteFeedback(null);

    try {
      const apiUrl = await getApiUrl();
      if (favoriteId) {
        await axios.delete(`${apiUrl}/favorites/${car.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteId(null);
        setFavoriteFeedback({ type: "success", key: "carDetails.favorites.removed" });
      } else {
        const response = await axios.post<Favorite>(
          `${apiUrl}/favorites`,
          { carId: car.id, displayId: car.displayId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoriteId(response.data?.id ?? null);
        setFavoriteFeedback({ type: "success", key: "carDetails.favorites.added" });
      }
    } catch (error) {
      console.error("Nie udało się zaktualizować ulubionych", error);
      setFavoriteFeedback({ type: "error", key: "carDetails.favorites.error" });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleOpenLightbox = () => {
    if (activeImage) {
      setLightboxOpen(true);
    }
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrevImage = () => {
    if (!car?.images?.length || !activeImage) return;

    const currentIndex = car.images.findIndex((image) => image.url === activeImage);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + car.images.length) % car.images.length;
    setActiveImage(car.images[prevIndex].url);
  };

  const handleNextImage = () => {
    if (!car?.images?.length || !activeImage) return;

    const currentIndex = car.images.findIndex((image) => image.url === activeImage);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % car.images.length;
    setActiveImage(car.images[nextIndex].url);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const startX = event.touches?.[0]?.clientX;
    if (typeof startX === "number") {
      setTouchStartX(startX);
      swipeHandledRef.current = false;
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX === null) return;

    const endX = event.changedTouches?.[0]?.clientX;
    if (typeof endX !== "number") return;

    const deltaX = endX - touchStartX;

    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
      swipeHandledRef.current = true;
    }

    setTouchStartX(null);
  };

  const handleLightboxTouchStart = (event: React.TouchEvent) => {
    const startX = event.touches?.[0]?.clientX;
    if (typeof startX === "number") {
      setLightboxTouchStartX(startX);
      lightboxSwipeHandledRef.current = false;
    }
  };

  const handleLightboxTouchEnd = (event: React.TouchEvent) => {
    if (lightboxTouchStartX === null) return;

    const endX = event.changedTouches?.[0]?.clientX;
    if (typeof endX !== "number") return;

    const deltaX = endX - lightboxTouchStartX;

    if (Math.abs(deltaX) > 30) {
      if (deltaX > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
      lightboxSwipeHandledRef.current = true;
    }

    setLightboxTouchStartX(null);
  };

  const handleImageClick = () => {
    if (swipeHandledRef.current) {
      swipeHandledRef.current = false;
      return;
    }
    handleOpenLightbox();
  };

  const translatorOptions = [
    { value: "pl", label: t("common.languages.pl") },
    { value: "en", label: t("common.languages.en") },
    { value: "de", label: t("common.languages.de") },
  ];

  const handleTranslateDescription = async () => {
    const target = translationTarget || i18n.language || "pl";
    const description = car?.description?.trim();
    const descriptionDetails = car?.descriptionDetails || [];

    if (!description && descriptionDetails.length === 0) return;

    if (target === "de") {
      setTranslatedDescription(description ?? null);
      setTranslatedDescriptionDetails(descriptionDetails);
      setTranslationErrorKey(null);
      return;
    }

    setTranslationLoading(true);
    setTranslationErrorKey(null);

    try {
      const response = await axios.get(
        "https://translate.googleapis.com/translate_a/single",
        {
          params: {
            client: "gtx",
            sl: "de",
            tl: target,
            dt: "t",
            q: [description, ...descriptionDetails.flatMap((entry) => [entry.label, entry.value])].filter(Boolean).join(
              "\n|||\n"
            ),
          },
        }
      );

      const segments = Array.isArray(response.data?.[0])
        ? response.data[0].map((entry: unknown) => (Array.isArray(entry) ? entry[0] : null)).filter(Boolean)
        : null;

      if (!segments || segments.length === 0) {
        throw new Error("translate-missing");
      }

      const translatedCombined = segments.join("").trim();
      const translatedParts = translatedCombined
        .split(/\s*\|\|\|\s*/g)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      let index = 0;
      const translatedTable: DescriptionEntry[] = [];

      if (description) {
        setTranslatedDescription(translatedParts[index]?.trim() || description);
        index += 1;
      } else {
        setTranslatedDescription(null);
      }

      descriptionDetails.forEach((entry) => {
        const translatedLabel = translatedParts[index]?.trim() || entry.label;
        const translatedValue = translatedParts[index + 1]?.trim() || entry.value;
        translatedTable.push({ label: translatedLabel, value: translatedValue });
        index += 2;
      });

      setTranslatedDescriptionDetails(translatedTable.length ? translatedTable : null);
    } catch (error) {
      console.error("Nie udało się przetłumaczyć opisu pojazdu", error);
      setTranslationErrorKey("carDetails.description.translator.error");
    } finally {
      setTranslationLoading(false);
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

  const locationLabel = car.location || "—";
  const providerLabel = car.provider || "—";

  return (
    <div className="space-y-12">
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

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] lg:items-start">
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-3xl bg-neutral-100">
              {car.images && car.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white shadow-md transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label={t("carDetails.lightbox.previous") || ""}
                  >
                    <span aria-hidden>‹</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white shadow-md transition hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label={t("carDetails.lightbox.next") || ""}
                  >
                    <span aria-hidden>›</span>
                  </button>
                </>
              )}
              {activeImage ? (
                <button
                  type="button"
                  onClick={handleImageClick}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="group relative block w-full focus:outline-none focus:ring-4 focus:ring-red-200"
                  aria-label={t("carDetails.lightbox.open") || ""}
                >
                  <img
                    src={activeImage}
                    alt={`${car.make} ${car.model}`}
                    className="aspect-[16/9] w-full object-cover transition duration-200 group-hover:scale-[1.01]"
                  />
                  <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-neutral-900/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow">
                    {t("carDetails.lightbox.open")}
                  </span>
                </button>
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
            {lightboxOpen && activeImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                role="dialog"
                aria-modal="true"
                aria-label={t("carDetails.lightbox.open") || undefined}
                onClick={handleCloseLightbox}
              >
                <div className="relative w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={handleCloseLightbox}
                    className="absolute -right-2 -top-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 shadow hover:bg-white"
                    aria-label={t("carDetails.lightbox.close") || ""}
                  >
                    {t("carDetails.lightbox.close")}
                  </button>
                  <div className="flex items-center gap-4">
                    {car.images && car.images.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl text-neutral-900 shadow transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-red-200"
                        aria-label={t("carDetails.lightbox.previous") || ""}
                      >
                        <span aria-hidden>‹</span>
                        <span className="sr-only">{t("carDetails.lightbox.previous")}</span>
                      </button>
                    )}
                    <div
                      className="flex-1"
                      onTouchStart={handleLightboxTouchStart}
                      onTouchEnd={handleLightboxTouchEnd}
                    >
                      <img
                        src={activeImage}
                        alt={`${car.make} ${car.model}`}
                        className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl"
                      />
                    </div>
                    {car.images && car.images.length > 1 && (
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl text-neutral-900 shadow transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-red-200"
                        aria-label={t("carDetails.lightbox.next") || ""}
                      >
                        <span aria-hidden>›</span>
                        <span className="sr-only">{t("carDetails.lightbox.next")}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <aside className="flex flex-col gap-6 self-stretch lg:h-full lg:justify-between">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">{t("carDetails.vehicleInfo")}</h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoLine label={t("carDetails.info.mileage")} value={formatMileage(car.mileage)} />
                <InfoLine
                  label={t("carDetails.info.firstRegistration")}
                  value={formatFirstRegistration(car.firstRegistrationDate)}
                />
                <InfoLine label={t("carDetails.info.productionYear")} value={formatYear(car.year)} />
                <InfoLine label={t("carDetails.info.location")} value={locationLabel} />
                <InfoLine label={t("carDetails.info.provider")} value={providerLabel} />
              </dl>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{t("carDetails.favorites.title")}</h3>
                  <p className="text-sm text-neutral-600">{t("carDetails.favorites.subtitle")}</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
                >
                  {favoriteLoading
                    ? t("carDetails.favorites.loading")
                    : favoriteId
                    ? t("carDetails.favorites.removeButton")
                    : t("carDetails.favorites.addButton")}
                </button>
              </div>
              {favoriteFeedback && (
                <p
                  className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                    favoriteFeedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {t(favoriteFeedback.key)}
                </p>
              )}
              {!isLoggedIn && !favoriteFeedback && (
                <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {t("carDetails.favorites.loginHint")} {" "}
                  <Link to="/login" className="font-semibold text-red-600 underline underline-offset-4">
                    {t("carDetails.favorites.loginLink")}
                  </Link>
                  .
                </p>
              )}
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
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-neutral-800">{t("carDetails.description.translator.label")}</p>
            <p className="text-xs text-neutral-500">{t("carDetails.description.translator.helper")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="description-language">
              {t("carDetails.description.translator.selectLabel")}
            </label>
            <select
              id="description-language"
              value={translationTarget}
              onChange={(event) => setTranslationTarget(event.target.value)}
              className="min-w-[160px] rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              {translatorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleTranslateDescription}
              disabled={translationLoading}
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {translationLoading
                ? t("carDetails.description.translator.loading")
                : t("carDetails.description.translator.action")}
            </button>
          </div>
        </div>
        {translationErrorKey && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {t(translationErrorKey)}
          </p>
        )}
        {car?.descriptionDetails?.length ? (
          <div className="overflow-hidden rounded-2xl border border-neutral-200">
            <dl className="divide-y divide-neutral-200">
              {(translatedDescriptionDetails || car.descriptionDetails).map((entry, index) => (
                <div
                  key={`${entry.label}-${index}`}
                  className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[220px_1fr]"
                >
                  <dt className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{entry.label}</dt>
                  <dd className="text-sm leading-relaxed text-neutral-700">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
        <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
          {translatedDescription?.trim() || car?.description || t("carDetails.description.fallback")}
        </p>
        <p className="text-xs text-neutral-400">{t("carDetails.description.translator.attribution")}</p>
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
