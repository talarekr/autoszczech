import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCountdown } from "../hooks/useCountdown";
import { formatDate, formatFirstRegistration, formatMileage, formatYear } from "../lib/format";
import {
  fuelTranslationKey,
  normalizeFuelType,
  normalizeTransmission,
  transmissionTranslationKey,
} from "../lib/lookups";
import { Car } from "../types/car";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const countdown = useCountdown(car.auctionEnd ?? undefined);
  const thumbnail = car.images?.[0]?.url;
  const { t } = useTranslation();
  const detailUrl = `/offer/${car.id}`;
  const normalizedFuel = normalizeFuelType(car.fuelType);
  const normalizedTransmission = normalizeTransmission(car.transmission);
  const fuelLabel = normalizedFuel
    ? t(fuelTranslationKey(normalizedFuel))
    : car.fuelType ?? "—";
  const transmissionLabel = normalizedTransmission
    ? t(transmissionTranslationKey(normalizedTransmission))
    : car.transmission ?? "—";

  return (
    <article className="grid overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200 transition hover:-translate-y-1 hover:shadow-lg md:grid-cols-[minmax(0,320px),1fr]">
      <Link
        to={detailUrl}
        className="relative h-full w-full min-h-[220px] bg-neutral-100 md:min-h-[260px]"
        aria-label={t("carCard.viewDetails")}
      >
        <div className="relative h-full w-full">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`${car.make} ${car.model}`}
              className="aspect-[4/3] h-full w-full object-contain md:absolute md:inset-0 md:h-full"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-[4/3] h-full items-center justify-center text-sm text-neutral-400 md:absolute md:inset-0 md:h-full">
              {t("carCard.noImage")}
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-4 border-b border-neutral-200 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
              ID: {car.displayId ?? car.id}
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-neutral-900">
              {car.make} {car.model}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {car.provider && (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">{car.provider}</span>
            )}
            {car.location && (
              <span className="rounded-full bg-neutral-50 px-3 py-1 text-neutral-500">{car.location}</span>
            )}
          </div>
        </header>

        <section className="grid gap-6 text-sm text-neutral-600 md:grid-cols-3 md:gap-0 md:divide-x md:divide-neutral-200">
          <div className="flex flex-col gap-4 md:px-6 md:first:pl-0">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{t("carCard.firstRegistration")}</span>
              <span className="text-base font-semibold text-neutral-800">
                {formatFirstRegistration(car.firstRegistrationDate)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{t("carCard.mileage")}</span>
              <span className="text-base font-semibold text-neutral-800">{formatMileage(car.mileage)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:px-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{t("carCard.productionYear")}</span>
              <span className="text-base font-semibold text-neutral-800">{formatYear(car.year)}</span>
            </div>
            {car.transmission && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{t("carCard.transmission")}</span>
                <span className="text-base font-semibold text-neutral-800">{transmissionLabel}</span>
              </div>
            )}
            {car.fuelType && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{t("carCard.fuel")}</span>
                <span className="text-base font-semibold text-neutral-800">{fuelLabel}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 md:px-6 md:last:pr-0">
            {car.auctionEnd && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{t("carCard.auctionEndDate")}</span>
                <span className="text-base font-semibold text-neutral-800">{formatDate(car.auctionEnd)}</span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{t("carCard.auctionEndsIn")}</span>
              <span className={`text-base font-semibold ${countdown.ended ? "text-neutral-500" : "text-red-600"}`}>{countdown.long}</span>
            </div>
          </div>
        </section>

        <footer className="mt-auto flex flex-col gap-4 border-t border-neutral-200 pt-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {car.bodyType && (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">{car.bodyType}</span>
            )}
            {car.driveType && (
              <span className="rounded-full bg-neutral-50 px-3 py-1 text-neutral-500">{car.driveType}</span>
            )}
          </div>
          <Link
            to={`/offer/${car.id}`}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-sm transition hover:bg-red-500"
          >
            {t("carCard.viewDetails")}
          </Link>
        </footer>
      </div>
    </article>
  );
}
