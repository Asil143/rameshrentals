import Form from "next/form";
import Link from "next/link";
import { BookingSummaryCard } from "@/components/booking-summary";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { lookupBooking } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";

const inputClass =
  "rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-normal text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20";

export default async function BookingStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; phone?: string }>;
}) {
  const { reference = "", phone = "" } = await searchParams;
  const booking = reference && phone ? await lookupBooking(reference, phone) : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold">Check booking status</h1>
      <p className="mt-2 text-ink-soft">Enter the reference from your confirmation and the phone number you booked with.</p>

      <Form action="/booking-status" className="mt-6 grid gap-3 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
          Booking reference
          <input name="reference" defaultValue={reference} placeholder="RR-XXXXXXXXXX" required autoCapitalize="characters" className={`${inputClass} uppercase placeholder:normal-case`} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-soft">
          Phone number
          <input name="phone" defaultValue={phone} placeholder="10-digit mobile number" required type="tel" inputMode="numeric" pattern="\d{10}" maxLength={10} className={inputClass} />
        </label>
        <button className="rounded-xl bg-[var(--color-brand-800)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-600)]">Check</button>
      </Form>

      {reference && phone && !booking && (
        <div role="alert" className="mt-6 rounded-2xl border border-hairline bg-surface-raised p-5 text-sm">
          <p className="font-semibold">No booking matched those details.</p>
          <p className="mt-1 text-ink-soft">Check the reference (it starts with RR-) and use the same phone number you booked with.</p>
          <WhatsAppButton href={whatsappGeneralLink()} label="Ask us on WhatsApp" className="mt-4" />
        </div>
      )}

      {booking && (
        <section className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">{booking.reference}</p>
          <BookingSummaryCard booking={booking} />
          {booking.payment_link && (
            <a href={booking.payment_link} className="mt-5 flex justify-center rounded-xl bg-[var(--color-accent-400)] px-5 py-3 font-semibold text-[var(--color-brand-900)]">
              Pay advance online
            </a>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <WhatsAppButton href={whatsappGeneralLink(booking.town_name)} label="Message us on WhatsApp" className="justify-center" />
            <Link href={`/${booking.town_slug}/vehicles`} className="flex items-center justify-center px-5 py-3 text-sm font-semibold text-ink-soft hover:underline">
              Browse more vehicles
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
