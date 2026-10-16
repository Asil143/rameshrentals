import Link from "next/link";
import Image from "next/image";
import type { Vehicle } from "@/types/database";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";
import { formatRupees, getBookingDays, getEstimatedTotal } from "@/lib/pricing";

const PLACEHOLDER_IMAGE: Record<Vehicle["type"], string> = {
  bike: "🏍️",
  car: "🚗",
};

export function VehicleCard({
  vehicle,
  townSlug,
  locale = "en",
  eager = false,
  dates,
  rating,
}: {
  vehicle: Vehicle;
  townSlug: string;
  locale?: Locale;
  /** Load the photo immediately — for the first cards on screen. */
  eager?: boolean;
  /** Chosen pickup/return dates: show the trip total and carry the dates to the vehicle page. */
  dates?: { start: string; end: string } | null;
  rating?: { average: number; review_count: number };
}) {
  const t = getDictionary(locale).vehicleCard;
  const days = dates ? getBookingDays(dates.start, dates.end) : 0;
  const href = `/${townSlug}/vehicles/${vehicle.id}${dates ? `?start_date=${dates.start}&end_date=${dates.end}` : ""}`;
  const u = getDictionary(locale).ui;

  return (
    <Link
      href={href}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-soft"
    >
      <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] text-6xl dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]">
        {vehicle.photos[0] ? (
          <Image
            src={vehicle.photos[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden>{PLACEHOLDER_IMAGE[vehicle.type]}</span>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {u.vehicleType[vehicle.type]}
        </span>
        {rating && (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[var(--color-brand-800)] px-2 py-0.5 text-[11px] font-semibold text-white">
            ★ {rating.average.toFixed(1)} <span className="font-normal text-white/75">({rating.review_count})</span>
          </span>
        )}
        <span className="absolute right-2.5 top-2.5 hidden rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold sm:inline text-[var(--color-brand-800)]">{u.available}</span>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3 sm:gap-1 sm:p-4">
        <h3 className="font-display text-sm font-semibold leading-snug sm:text-base">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-xs text-ink-faint sm:text-sm">{vehicle.year}</p>
        <div className="mt-2 hidden flex-wrap gap-1.5 text-[11px] font-medium text-ink-soft sm:flex">
          <span className="rounded-md bg-[var(--color-brand-500)]/8 px-2 py-1">{u.deliveryOrPickup}</span>
          <span className="rounded-md bg-[var(--color-brand-500)]/8 px-2 py-1">{u.deposit(formatRupees(vehicle.type === "bike" ? 1000 : 5000))}</span>
          {vehicle.fuel_type && <span className="rounded-md bg-[var(--color-brand-500)]/8 px-2 py-1 capitalize">{vehicle.fuel_type}</span>}
          {vehicle.transmission && <span className="rounded-md bg-[var(--color-brand-500)]/8 px-2 py-1 capitalize">{vehicle.transmission}</span>}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-base font-bold sm:text-lg">{formatRupees(vehicle.price_per_day)}</span>
          <span className="text-sm text-ink-faint">{t.perDay}</span>
        </div>
        {dates && days > 0 && (
          <span className="mt-1 w-fit rounded-md bg-[var(--color-brand-500)]/10 px-2 py-1 text-[11px] font-semibold text-[var(--color-brand-800)] sm:text-xs dark:text-[var(--color-brand-100)]">
            {u.totalForDays(formatRupees(getEstimatedTotal(vehicle, dates.start, dates.end)), days)}
          </span>
        )}
        {vehicle.price_tiers.length > 0 && (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[var(--color-accent-400)]/15 px-2 py-0.5 text-[10px] font-semibold sm:text-[11px] text-[var(--color-accent-600)]">
            {t.cheaperLongTerm}
          </span>
        )}
        <span aria-hidden className="flex-1" />
        <span className="mt-3 flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-brand-800)] px-3 py-2 text-xs font-semibold sm:text-sm text-white transition-colors group-hover:bg-[var(--color-brand-600)]">{u.viewDetails}</span>
      </div>
    </Link>
  );
}
