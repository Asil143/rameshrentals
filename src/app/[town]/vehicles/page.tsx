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
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold">{town.name} — coming soon</h1>
        <p className="mb-6 text-black/60 dark:text-white/60">
          We&apos;re not live in {town.name} yet, but we&apos;re expanding fast.
          Message us on WhatsApp and we&apos;ll notify you the moment vehicles are
          available.
        </p>
        <div className="flex justify-center">
          <WhatsAppButton href={whatsappGeneralLink(town.name)} label={`Notify me for ${town.name}`} />
        </div>
      </div>
    );
  }

  const vehicles = await getVehiclesForTown(town.id, vehicleType);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vehicles in {town.name}</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {vehicles.length} available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TownSelector currentSlug={townSlug} />
        </div>
      </div>

      <div className="mb-6">
        <VehicleTypeToggle townSlug={townSlug} current={vehicleType ?? "all"} />
      </div>

      {vehicles.length === 0 ? (
        <p className="py-12 text-center text-black/60 dark:text-white/60">
          No vehicles available right now. Check back soon or message us on
          WhatsApp.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={townSlug} />
          ))}
        </div>
      )}
    </div>
  );
}
