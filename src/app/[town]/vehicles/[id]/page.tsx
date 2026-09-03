import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getTownBySlug, getVehicleById } from "@/lib/queries";
import { whatsappBookingLink } from "@/lib/whatsapp";
import { getPricingRows } from "@/lib/pricing";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { toJsonLdScript } from "@/lib/json-ld";
import type { Metadata } from "next";

const PLACEHOLDER_IMAGE = { bike: "🏍️", car: "🚗" } as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string; id: string }>;
}): Promise<Metadata> {
  const { town: townSlug, id } = await params;
  const [town, vehicle] = await Promise.all([getTownBySlug(townSlug), getVehicleById(id)]);

  if (!town || !vehicle) {
    return { title: `Vehicle not found | ${SITE_NAME}` };
  }

  const title = `${vehicle.make} ${vehicle.model} rental in ${town.name} | ${SITE_NAME}`;
  const description = `Rent the ${vehicle.make} ${vehicle.model} in ${town.name} from ₹${vehicle.price_per_day}/day. Doorstep delivery, pay at pickup.`;
  const imageUrl = vehicle.photos[0] ? `${SITE_URL}${vehicle.photos[0]}` : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${townSlug}/vehicles/${id}` },
    openGraph: {
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

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

  const locale = await getLocale();
  const t = getDictionary(locale).vehicleDetail;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${vehicle.make} ${vehicle.model}`,
    image: vehicle.photos[0] ? `${SITE_URL}${vehicle.photos[0]}` : undefined,
    description: `${vehicle.type === "bike" ? "Bike" : "Car"} rental in ${town.name}`,
    offers: {
      "@type": "Offer",
      price: vehicle.price_per_day,
      priceCurrency: "INR",
      availability:
        vehicle.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/${townSlug}/vehicles/${vehicle.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(productJsonLd) }}
      />
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2">
      {vehicle.photos.length > 0 ? (
        <VehicleGallery photos={vehicle.photos} alt={`${vehicle.make} ${vehicle.model}`} />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] text-8xl shadow-soft dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]">
          <span aria-hidden>{PLACEHOLDER_IMAGE[vehicle.type]}</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <span className="mb-1 inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            {vehicle.type} · {town.name}
          </span>
          <h1 className="font-display text-3xl font-bold">
            {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-ink-faint">{vehicle.year}</p>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-extrabold">₹{vehicle.price_per_day}</span>
          <span className="text-ink-faint">{t.perDay}</span>
        </div>

        {vehicle.price_tiers.length > 0 && (
          <div className="rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft">
            <h2 className="mb-3 text-sm font-display font-semibold">{t.longerYouRent}</h2>
            <table className="w-full text-sm">
              <tbody>
                {getPricingRows(vehicle, t.daysWord).map((row) => (
                  <tr key={row.label} className="border-t border-hairline first:border-t-0">
                    <td className="py-2 text-ink-soft">{row.label}</td>
                    <td className="py-2 text-right font-semibold">
                      ₹{row.price_per_day}
                      {t.perDay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:p-6">
          <h2 className="mb-4 font-display font-semibold">{t.requestThisBooking}</h2>
          <BookingForm
            vehicleId={vehicle.id}
            townSlug={townSlug}
            pricePerDay={vehicle.price_per_day}
            priceTiers={vehicle.price_tiers}
            locale={locale}
          />
          <Link
            href="/about#policy"
            className="mt-3 block text-center text-xs text-ink-faint hover:text-[var(--color-brand-700)] hover:underline dark:hover:text-[var(--color-brand-400)]"
          >
            {t.policyLink}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-faint">{t.or}</span>
          <WhatsAppButton
            href={whatsappBookingLink(vehicle, town.name, locale)}
            label={t.bookViaWhatsapp}
          />
        </div>
      </div>
    </div>
    </>
  );
}
