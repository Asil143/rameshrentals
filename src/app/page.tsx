import Link from "next/link";
import { VehicleCard } from "@/components/vehicle-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getTownBySlug, getVehiclesForTown } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import { DEFAULT_TOWN_SLUG, SITE_NAME, SITE_URL, TOWNS, WHATSAPP_NUMBER } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { toJsonLdScript } from "@/lib/json-ld";

const FEATURE_ICONS = [
  <path
    key="delivery"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 12.75V18a1.5 1.5 0 0 0 1.5 1.5h1.128M16.5 19.5h-9m9 0a1.5 1.5 0 1 0 3 0m-3 0a1.5 1.5 0 1 1 3 0m-9-15h6a1.5 1.5 0 0 1 1.5 1.5v9.75m-9-11.25L3 7.5m6.75-3v11.25M3 7.5v6.75a1.5 1.5 0 0 0 1.5 1.5H6m11.25-8.25H21l-3.75 4.5H19.5v3.75m-9-9.75h5.25"
  />,
  <path
    key="wallet"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M2.25 8.25h19.5M2.25 9v10.5A1.5 1.5 0 0 0 3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V9M2.25 9V6.75A1.5 1.5 0 0 1 3.75 5.25h16.5a1.5 1.5 0 0 1 1.5 1.5V9M6 15h4.5"
  />,
  <path
    key="chat"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M8.25 10.875c0 .621.504 1.125 1.125 1.125h.375m4.5-1.125c0 .621-.504 1.125-1.125 1.125h-.375m0 0v1.5m0-1.5h-3m6.75-6H5.625c-.621 0-1.125.504-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h.375v3l3.9-3h9.6c.621 0 1.125-.504 1.125-1.125v-9.75c0-.621-.504-1.125-1.125-1.125Z"
  />,
  <path
    key="shield"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="m9 12.75 1.5 1.5 3.75-3.75M21 12c0 5.25-3.75 8.25-9 9.75C6.75 20.25 3 17.25 3 12V6.108c0-.87.62-1.62 1.475-1.786a48.57 48.57 0 0 1 15.05 0c.855.166 1.475.916 1.475 1.786V12Z"
  />,
];

export default async function Home() {
  const town = await getTownBySlug(DEFAULT_TOWN_SLUG);
  const vehicles = town ? await getVehiclesForTown(town.id) : [];
  const activeTownCount = TOWNS.length;

  const locale = await getLocale();
  const t = getDictionary(locale).home;
  const townName = town?.name ?? "Addanki";
  const townList = TOWNS.map((tn) => tn.name).join(", ");

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: `+${WHATSAPP_NUMBER}`,
    areaServed: TOWNS.map((tn) => ({ "@type": "City", name: tn.name })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(localBusinessJsonLd) }}
      />
      <section className="relative overflow-hidden mesh-hero text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-20 text-center sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
            {t.badge(townName)}
          </span>
          <h1 className="font-display max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
            {t.heroLine1}{" "}
            <span className="bg-gradient-to-r from-[var(--color-accent-300)] to-[var(--color-accent-500)] bg-clip-text text-transparent">
              {t.heroLine2}
            </span>
          </h1>
          <p className="max-w-2xl text-balance text-base text-white/75 sm:text-lg">
            {t.subtitle(SITE_NAME, townList)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
              className="rounded-full bg-white px-6 py-3.5 font-semibold text-[var(--color-brand-800)] shadow-lift transition-all hover:brightness-95 active:scale-[0.98]"
            >
              {t.browseCta(townName)}
            </Link>
            <WhatsAppButton
              href={whatsappGeneralLink(town?.name, locale)}
              label={t.bookViaWhatsapp}
              className="shadow-lift hover:brightness-105 active:scale-[0.98]"
            />
          </div>

          <dl className="mt-8 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-8">
            <div>
              <dt className="sr-only">{t.statTowns}</dt>
              <dd className="font-display text-2xl font-bold sm:text-3xl">{activeTownCount}</dd>
              <dd className="text-xs text-white/60 sm:text-sm">{t.statTowns}</dd>
            </div>
            <div>
              <dt className="sr-only">{t.statVehicles}</dt>
              <dd className="font-display text-2xl font-bold sm:text-3xl">{vehicles.length}+</dd>
              <dd className="text-xs text-white/60 sm:text-sm">{t.statVehicles}</dd>
            </div>
            <div>
              <dt className="sr-only">{t.statPayAtPickup}</dt>
              <dd className="font-display text-2xl font-bold sm:text-3xl">₹0</dd>
              <dd className="text-xs text-white/60 sm:text-sm">{t.statPayAtPickup}</dd>
            </div>
          </dl>
        </div>
      </section>

      {vehicles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
                {t.readyToRide}
              </p>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {t.availableNow(townName)}
              </h2>
            </div>
            <Link
              href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
              className="hidden shrink-0 text-sm font-semibold text-[var(--color-brand-700)] hover:underline sm:block dark:text-[var(--color-brand-400)]"
            >
              {t.viewAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {vehicles.slice(0, 8).map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} townSlug={DEFAULT_TOWN_SLUG} locale={locale} />
            ))}
          </div>
          <Link
            href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
            className="mt-6 block text-center text-sm font-semibold text-[var(--color-brand-700)] hover:underline sm:hidden dark:text-[var(--color-brand-400)]"
          >
            {t.viewAllVehicles}
          </Link>
        </section>
      )}

      <section className="border-y border-hairline bg-surface-raised">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            {t.whyChooseUs}
          </p>
          <h2 className="font-display mb-8 text-2xl font-bold sm:text-3xl">{t.whySiteName(SITE_NAME)}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.map((feature, i) => (
              <div
                key={feature.title}
                className="card-hover rounded-2xl border border-hairline bg-[var(--color-surface)] p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white shadow-soft">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    {FEATURE_ICONS[i]}
                  </svg>
                </div>
                <h3 className="mb-1.5 font-display font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
          {t.coverage}
        </p>
        <h2 className="font-display mb-6 text-2xl font-bold sm:text-3xl">{t.whereWeOperate}</h2>
        <div className="flex flex-wrap gap-3">
          {TOWNS.map((tn) => (
            <Link
              key={tn.slug}
              href={`/${tn.slug}/vehicles`}
              className="group flex items-center gap-2 rounded-full border border-hairline bg-surface-raised px-5 py-2.5 text-sm font-medium shadow-soft transition-all hover:-translate-y-0.5 hover:border-[var(--color-brand-500)] hover:shadow-lift"
            >
              {tn.name}
              <span className="text-ink-faint transition-colors group-hover:text-[var(--color-brand-600)]">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
