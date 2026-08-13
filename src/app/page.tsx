import Link from "next/link";
import { VehicleCard } from "@/components/vehicle-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getTownBySlug, getVehiclesForTown } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { DEFAULT_TOWN_SLUG, SITE_NAME, TOWNS } from "@/lib/constants";

const FEATURES = [
  {
    title: "Doorstep delivery",
    body: "We drop the bike or car at your home, hostel, or hotel — no need to travel to a pickup point.",
  },
  {
    title: "Pay at pickup",
    body: "Book online, pay the deposit and rent in cash or UPI when you collect the vehicle.",
  },
  {
    title: "Book on WhatsApp",
    body: "Prefer to talk it through? Message us directly and we'll confirm your booking there.",
  },
  {
    title: "Local, verified vehicles",
    body: "Every vehicle is checked and verified in your own town before it's listed.",
  },
];

export default async function Home() {
  const town = await getTownBySlug(DEFAULT_TOWN_SLUG);
  const vehicles = town ? await getVehiclesForTown(town.id) : [];

  return (
    <div>
      <section className="border-b border-black/10 bg-emerald-50 dark:border-white/10 dark:bg-emerald-950/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Bike &amp; car rentals, now in your own town
          </h1>
          <p className="mx-auto max-w-2xl text-black/70 dark:text-white/70">
            {SITE_NAME} brings organized vehicle rentals to{" "}
            {TOWNS.map((t) => t.name).join(", ")} — no more depending on the
            city for a bike or car.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
              className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Browse vehicles in {town?.name ?? "Addanki"}
            </Link>
            <WhatsAppButton href={whatsappGeneralLink(town?.name)} />
          </div>
        </div>
      </section>

      {vehicles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">Available now in {town?.name}</h2>
            <Link
              href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
              className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {vehicles.slice(0, 8).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={DEFAULT_TOWN_SLUG} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-xl font-bold">Why {SITE_NAME}?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-black/10 p-5 dark:border-white/10"
            >
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-black/60 dark:text-white/60">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-xl font-bold">Where we operate</h2>
        <div className="flex flex-wrap gap-3">
          {TOWNS.map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}/vehicles`}
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium hover:border-emerald-600 hover:text-emerald-700 dark:border-white/10 dark:hover:text-emerald-400"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
