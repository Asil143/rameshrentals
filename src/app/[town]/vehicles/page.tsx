import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TownSelector } from "@/components/town-selector";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleTypeToggle } from "@/components/vehicle-type-toggle";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getAllTowns, getTownBySlug, getVehiclesForTown } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { SITE_NAME } from "@/lib/constants";
import type { VehicleType } from "@/types/database";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string }>;
}): Promise<Metadata> {
  const { town: townSlug } = await params;
  const town = await getTownBySlug(townSlug);
  const townName = town?.name ?? townSlug;

  return {
    title: `Bike & Car Rentals in ${townName} | ${SITE_NAME}`,
    description: `Rent bikes and cars in ${townName} — doorstep delivery, pay at pickup, book online or on WhatsApp.`,
    alternates: { canonical: `/${townSlug}/vehicles` },
  };
}

export default async function VehiclesPage({
  params,
  searchParams,
}: {
  params: Promise<{ town: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { town: townSlug } = await params;
  const { type } = await searchParams;

  const [town, towns] = await Promise.all([getTownBySlug(townSlug), getAllTowns()]);
  if (!town) {
    notFound();
  }

  const vehicleType = type === "bike" || type === "car" ? (type as VehicleType) : undefined;

  const locale = await getLocale();
  const t = getDictionary(locale).listing;

  if (!town.active) {
    return (
      <div className="mesh-hero flex flex-1 items-center justify-center px-4 py-24 text-white">
        <div className="mx-auto max-w-lg text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
            {t.comingSoon}
          </span>
          <h1 className="font-display mb-3 text-3xl font-bold">{town.name}</h1>
          <p className="mb-7 text-white/75">{t.comingSoonBody(town.name)}</p>
          <div className="flex justify-center">
            <WhatsAppButton
              href={whatsappGeneralLink(town.name, locale)}
              label={t.notifyMe(town.name)}
              className="shadow-lift"
            />
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
            {t.available(vehicles.length)}
          </p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{t.vehiclesIn(town.name)}</h1>
        </div>
        <div className="flex items-center gap-3">
          <TownSelector currentSlug={townSlug} towns={towns} />
        </div>
      </div>

      <div className="mb-8">
        <VehicleTypeToggle townSlug={townSlug} current={vehicleType ?? "all"} locale={locale} />
      </div>

      {vehicles.length === 0 ? (
        <p className="py-16 text-center text-ink-soft">{t.empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={townSlug} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
