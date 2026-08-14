import { notFound } from "next/navigation";
import { TownSelector } from "@/components/town-selector";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleTypeToggle } from "@/components/vehicle-type-toggle";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getTownBySlug, getVehiclesForTown } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import type { VehicleType } from "@/types/database";

export default async function VehiclesPage({
  params,
  searchParams,
}: {
  params: Promise<{ town: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { town: townSlug } = await params;
  const { type } = await searchParams;

  const town = await getTownBySlug(townSlug);
  if (!town) {
    notFound();
  }

  const vehicleType = type === "bike" || type === "car" ? (type as VehicleType) : undefined;

  if (!town.active) {
    return (
      <div className="mesh-hero flex flex-1 items-center justify-center px-4 py-24 text-white">
        <div className="mx-auto max-w-lg text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
            Coming soon
          </span>
          <h1 className="font-display mb-3 text-3xl font-bold">{town.name}</h1>
          <p className="mb-7 text-white/75">
            We&apos;re not live in {town.name} yet, but we&apos;re expanding fast.
            Message us on WhatsApp and we&apos;ll notify you the moment vehicles are
            available.
          </p>
          <div className="flex justify-center">
            <WhatsAppButton href={whatsappGeneralLink(town.name)} label={`Notify me for ${town.name}`} className="shadow-lift" />
          </div>
        </div>
      </div>
    );
  }

  const vehicles = await getVehiclesForTown(town.id, vehicleType);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            {vehicles.length} available
          </p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Vehicles in {town.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <TownSelector currentSlug={townSlug} />
        </div>
      </div>

      <div className="mb-8">
        <VehicleTypeToggle townSlug={townSlug} current={vehicleType ?? "all"} />
      </div>

      {vehicles.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">
          No vehicles available right now. Check back soon or message us on
          WhatsApp.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={townSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
