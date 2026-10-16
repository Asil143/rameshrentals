import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/components/review-form";
import { getReviewBookingInfo } from "@/lib/queries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = { robots: { index: false } };

/** Private review link sent to a customer on WhatsApp after their trip. */
export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const info = /^[0-9a-f-]{36}$/i.test(id) ? await getReviewBookingInfo(id) : null;
  if (!info) notFound();
  const locale = await getLocale();
  const u = getDictionary(locale).ui;
  const vehicle = `${info.vehicle_make} ${info.vehicle_model}`;

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">{u.reviewPageTitle(vehicle)}</h1>
      <p className="mb-6 mt-2 text-ink-soft">{u.reviewIntro}</p>
      {info.already_reviewed ? (
        <p className="rounded-2xl bg-[var(--color-brand-500)]/10 p-5 font-semibold">{u.reviewAlready}</p>
      ) : !info.eligible ? (
        <p className="rounded-2xl border border-hairline bg-surface-raised p-5 text-ink-soft">{u.reviewNotYet}</p>
      ) : (
        <ReviewForm bookingId={id} locale={locale} />
      )}
    </div>
  );
}
