import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { API_URL } from "../lib/api";
import { useCountdown } from "../hooks/useCountdown";
import type { Car, Offer } from "../lib/types";
import { useAuth } from "../context/AuthContext";

const numberFormatter = new Intl.NumberFormat("pl-PL");

export default function CarDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user, token, openAuthModal } = useAuth();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    axios
      .get<Car>(`${API_URL}/api/cars/${id}`)
      .then((response) => {
        if (!mounted) return;
        setCar(response.data);
        setSelectedImage(response.data.images?.[0]?.url ?? null);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError(t("errors.loadCar"));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, t]);

  const countdown = useCountdown(car?.auctionEnd ?? null);

  const specs = useMemo(() => {
    if (!car?.specs) return [] as { label: string; value: string }[];
    const entries: { label: string; value: string }[] = [];
    const mapping: Record<string, string> = {
      vin: t("details.specsLabels.vin"),
      bodyType: t("details.specsLabels.bodyType"),
      fuelType: t("details.specsLabels.fuel"),
      power: t("details.specsLabels.power"),
      transmission: t("details.specsLabels.transmission"),
      engine: t("details.specsLabels.engine"),
      drivetrain: t("details.specsLabels.drivetrain"),
      color: t("details.specsLabels.color"),
      registration: t("details.specsLabels.registration"),
    };

    for (const [key, value] of Object.entries(car.specs)) {
      if (value == null) continue;
      const label = mapping[key] ?? key;
      entries.push({ label, value: String(value) });
    }
    return entries;
  }, [car?.specs, t]);

  const submitOffer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!car) return;
    if (!user || !token) {
      openAuthModal("login");
      return;
    }
    setOfferError(null);
    setOfferSuccess(false);
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setOfferError(t("details.offerInvalid"));
      return;
    }
    try {
      const response = await axios.post<Offer>(
        `${API_URL}/api/offers`,
        { carId: car.id, amount: parsed, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOfferSuccess(true);
      setAmount("");
      setMessage("");
      setCar((previous) =>
        previous
          ? {
              ...previous,
              offers: [response.data, ...(previous.offers ?? [])],
              _count: { offers: (previous._count?.offers ?? previous.offers?.length ?? 0) + 1 },
            }
          : previous
      );
    } catch (err: any) {
      const message = err?.response?.data?.error ?? t("details.offerError");
      setOfferError(message);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-neutral-400">{t("details.loading")}</div>;
  }

  if (error || !car) {
    return (
      <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-10 text-center text-sm text-red-200">
        {error ?? t("details.notFound")}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-yellow-300 hover:text-yellow-200">
        ← {t("details.back")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
              {selectedImage ? (
                <img src={selectedImage} alt={car.model} className="h-[420px] w-full object-cover" />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-sm text-neutral-500">{t("listing.noImage")}</div>
              )}
              {countdown && !countdown.expired && (
                <div className="absolute left-5 top-5 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-yellow-200">
                  {t("details.countdown", { time: countdown.label })}
                </div>
              )}
            </div>
            {car.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {car.images.map((image) => (
                  <button
                    key={image.id ?? image.url}
                    type="button"
                    onClick={() => setSelectedImage(image.url)}
                    className={`overflow-hidden rounded-2xl border ${
                      selectedImage === image.url ? "border-yellow-400" : "border-neutral-800"
                    }`}
                  >
                    <img src={image.url} alt="miniatura" className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">{t("details.descriptionHeading")}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-300">
              {car.description ?? t("details.descriptionFallback")}
            </p>
          </div>

          {specs.length > 0 && (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
              <h2 className="text-xl font-semibold text-white">{t("details.specsHeading")}</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div key={`${spec.label}-${spec.value}`} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                    <dt className="text-xs uppercase tracking-[0.3em] text-neutral-500">{spec.label}</dt>
                    <dd className="mt-1 text-sm text-white">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">{t("details.auctionId")}</span>
                <div className="text-lg font-semibold text-white">#{car.externalId ?? car.id}</div>
              </div>
              {countdown && (
                <div className={`rounded-full px-3 py-2 text-xs font-semibold ${countdown.expired ? "bg-red-500/20 text-red-200" : "bg-yellow-400/10 text-yellow-200"}`}>
                  {countdown.expired ? t("details.ended") : t("details.ends", { time: countdown.label })}
                </div>
              )}
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-500">{t("details.priceLabel")}</span>
              <div className="text-3xl font-semibold text-yellow-400">{numberFormatter.format(car.price)} zł</div>
            </div>
            <div className="grid gap-2 text-sm text-neutral-300">
              <div>
                <span className="font-semibold text-white">{t("details.location")}: </span>
                {car.location ?? t("details.locationUnknown")}
              </div>
              {car.auctionEnd && (
                <div>
                  <span className="font-semibold text-white">{t("details.endsAt")}: </span>
                  {new Date(car.auctionEnd).toLocaleString()}
                </div>
              )}
            </div>
            <p className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-sm text-yellow-100">
              {t("details.alert")}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">{t("details.contactHeading")}</h2>
            <p className="mt-3 text-sm text-neutral-300">{t("details.contactInfo")}</p>
            <div className="mt-4 space-y-2 text-sm text-neutral-300">
              <div>📞 +41 78 123 45 67</div>
              <div>✉️ kontakt@autoszczech.pl</div>
              <div>📍 Berno / Warszawa</div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">{t("details.offerTitle")}</h2>
            {offerSuccess && (
              <div className="mb-4 rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                {t("details.offerSuccess")}
              </div>
            )}
            {offerError && (
              <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{offerError}</div>
            )}
            <form className="space-y-4" onSubmit={submitOffer}>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-neutral-500" htmlFor="offer-amount">
                  {t("details.offerAmount")}
                </label>
                <input
                  id="offer-amount"
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setOfferSuccess(false);
                  }}
                  placeholder="50000"
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-neutral-500" htmlFor="offer-message">
                  {t("details.offerMessage")}
                </label>
                <textarea
                  id="offer-message"
                  rows={3}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setOfferSuccess(false);
                  }}
                  placeholder={t("details.offerMessagePlaceholder")}
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-yellow-300"
              >
                {user ? t("details.offerSubmit") : t("details.offerLoginCta")}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t("details.offersHeading")}</h2>
              <span className="rounded-full border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs text-neutral-400">
                {t("details.offerCount", { count: car._count?.offers ?? car.offers?.length ?? 0 })}
              </span>
            </div>
            {car.offers && car.offers.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {car.offers.map((offer) => (
                  <li key={offer.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                    <div className="flex items-center justify-between text-sm text-neutral-300">
                      <span className="font-semibold text-white">{offer.user?.email ?? t("details.anonymous")}</span>
                      <span>{new Date(offer.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-lg font-semibold text-yellow-300">{numberFormatter.format(offer.amount)} zł</div>
                    {offer.message && <p className="mt-2 text-sm text-neutral-300">“{offer.message}”</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-sm text-neutral-400">
                {t("details.noOffers")}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
