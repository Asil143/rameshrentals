import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getTownBySlug, getVehicleById } from "@/lib/queries";
import { whatsappBookingLink } from "@/lib/whatsapp";

const PLACEHOLDER_IMAGE = { bike: "🏍️", car: "🚗" } as const;

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ town: string; id: string }>;
}) {
  const { town: townSlug, id } = await params;

  const [town, vehicle] = await Promise.all([
    getTownBySlug(townSlug),
    getVehicleById(id),
  ]);

  if (!town || !vehicle || vehicle.town_id !== town.id) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-emerald-50 text-8xl dark:bg-emerald-950/40">
        {vehicle.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.photos[0]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <span aria-hidden>{PLACEHOLDER_IMAGE[vehicle.type]}</span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            {vehicle.type} · {town.name}
          </span>
          <h1 className="text-2xl font-bold">
            {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-black/60 dark:text-white/60">{vehicle.year}</p>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold">₹{vehicle.price_per_day}</span>
          <span className="text-black/60 dark:text-white/60">/ day</span>
        </div>

        <div className="rounded-xl border border-black/10 p-5 dark:border-white/10">
          <h2 className="mb-3 font-semibold">Request this booking</h2>
          <BookingForm vehicleId={vehicle.id} townSlug={townSlug} />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-black/50 dark:text-white/50">or</span>
          <WhatsAppButton href={whatsappBookingLink(vehicle, town.name)} />
        </div>
      </div>
    </div>
  );
}
