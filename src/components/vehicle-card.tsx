import Link from "next/link";
import type { Vehicle } from "@/types/database";

const PLACEHOLDER_IMAGE: Record<Vehicle["type"], string> = {
  bike: "🏍️",
  car: "🚗",
};

export function VehicleCard({
  vehicle,
  townSlug,
}: {
  vehicle: Vehicle;
  townSlug: string;
}) {
  return (
    <Link
      href={`/${townSlug}/vehicles/${vehicle.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition hover:shadow-md dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-emerald-50 text-6xl dark:bg-emerald-950/40">
        {vehicle.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.photos[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{PLACEHOLDER_IMAGE[vehicle.type]}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {vehicle.type}
        </span>
        <h3 className="font-semibold">
          {vehicle.make} {vehicle.model}
        </h3>
        <p className="text-sm text-black/60 dark:text-white/60">{vehicle.year}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold">₹{vehicle.price_per_day}</span>
          <span className="text-sm text-black/60 dark:text-white/60">/ day</span>
        </div>
        {vehicle.price_tiers.length > 0 && (
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Cheaper for longer rentals
          </span>
        )}
      </div>
    </Link>
  );
}
