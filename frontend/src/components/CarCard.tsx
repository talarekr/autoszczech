import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCountdown } from "../hooks/useCountdown";
import type { Car } from "../lib/types";

const numberFormatter = new Intl.NumberFormat("pl-PL");

interface Props {
  car: Car;
}

export default function CarCard({ car }: Props) {
  const { t } = useTranslation();
  const countdown = useCountdown(car.auctionEnd);
  const image = car.images?.[0]?.url;
  const offerCount = car._count?.offers ?? car.offers?.length ?? 0;

  return (
    <Link
      to={`/cars/${car.id}`}
      className="group grid grid-cols-1 gap-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 transition hover:border-yellow-400/60 hover:bg-neutral-900 md:grid-cols-[260px_1fr_auto]"
    >
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        {image ? (
          <img
            src={image}
            alt={`${car.make} ${car.model}`}
            className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center text-sm text-neutral-500">{t("listing.noImage")}</div>
        )}
        {countdown && !countdown.expired && (
          <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-yellow-200">
            {t("listing.endsIn", { time: countdown.label })}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1 text-xs text-neutral-400">
            <span className="text-neutral-500">#{car.externalId ?? car.id}</span>
            {car.location && <span className="text-neutral-300">• {car.location}</span>}
          </div>
          <h3 className="text-2xl font-semibold text-white">
            {car.make} {car.model}
          </h3>
          <p className="text-sm text-neutral-400">
            {t("listing.meta", {
              year: car.year,
              mileage: numberFormatter.format(car.mileage),
            })}
          </p>
          {car.description && (
            <p className="text-sm text-neutral-400">
              {car.description.length > 140 ? `${car.description.slice(0, 137)}…` : car.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <span className="rounded-full border border-neutral-800 bg-neutral-950 px-3 py-1">
            {offerCount ? t("listing.offersCount", { count: offerCount }) : t("listing.noOffers")}
          </span>
          {countdown?.expired && (
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-red-200">
              {t("listing.finished")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-between text-right">
        <div className="space-y-2">
          <span className="text-sm uppercase tracking-[0.3em] text-neutral-400">{t("listing.priceLabel")}</span>
          <div className="text-3xl font-semibold text-yellow-400">{numberFormatter.format(car.price)} zł</div>
          {countdown && !countdown.expired && (
            <div className="text-xs font-medium text-neutral-400">
              {t("listing.endsAt", { date: new Date(car.auctionEnd as string).toLocaleString() })}
            </div>
          )}
        </div>
        <span className="mt-4 inline-flex items-center justify-end gap-2 text-sm font-semibold text-yellow-300 transition group-hover:translate-x-1">
          {t("listing.viewDetails")}
          <span aria-hidden className="text-base">→</span>
        </span>
      </div>
    </Link>
  );
}
