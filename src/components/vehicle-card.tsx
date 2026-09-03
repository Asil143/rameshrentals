import Link from "next/link";
import Image from "next/image";
import type { Vehicle } from "@/types/database";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

const PLACEHOLDER_IMAGE: Record<Vehicle["type"], string> = {
  bike: "🏍️",
  car: "🚗",
};

export function VehicleCard({
  vehicle,
  townSlug,
  locale = "en",
}: {
  vehicle: Vehicle;
  townSlug: string;
  locale?: Locale;
}) {
  const t = getDictionary(locale).vehicleCard;

  return (
    <Link
      href={`/${townSlug}/vehicles/${vehicle.id}`}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-soft"
    >
      <div className="relative flex aspect-[16/11] items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] text-6xl dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]">
        {vehicle.photos[0] ? (
          <Image
            src={vehicle.photos[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden>{PLACEHOLDER_IMAGE[vehicle.type]}</span>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          {vehicle.type}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-brand-800)]">Available</span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display font-semibold leading-snug">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-ink-faint">{vehicle.year}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-medium text-ink-soft">
          <span className="rounded-md bg-[var(--color-brand-500)]/8 px-2 py-1">Delivery or pickup</span>
          <span className="rounded-md bg-[var(--color-brand-500)]/8 px-2 py-1">₹{vehicle.type === "bike" ? "1,000" : "5,000"} deposit</span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-lg font-bold">₹{vehicle.price_per_day}</span>
          <span className="text-sm text-ink-faint">{t.perDay}</span>
        </div>
        {vehicle.price_tiers.length > 0 && (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[var(--color-accent-400)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-accent-600)]">
            {t.cheaperLongTerm}
          </span>
        )}
        <span className="mt-3 flex min-h-10 items-center justify-center rounded-xl bg-[var(--color-brand-800)] px-3 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[var(--color-brand-600)]">View details</span>
      </div>
    </Link>
  );
}
