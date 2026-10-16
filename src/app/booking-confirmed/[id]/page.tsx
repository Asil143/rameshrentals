import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingSummaryCard } from "@/components/booking-summary";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getBookingSummary } from "@/lib/queries";
import { whatsappGeneralLink } from "@/lib/whatsapp";

const NEXT_STEPS = [
  { title: "We confirm with you", body: "We call or WhatsApp you within a few hours to confirm the vehicle and handover time." },
  { title: "Bring your documents", body: "A valid driving licence and a photo ID (Aadhaar, PAN or passport)." },
  { title: "Pay at handover", body: "Rent plus the refundable deposit, in cash or UPI. The deposit comes back when you return the vehicle." },
];

export default async function BookingConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = /^[0-9a-f-]{36}$/i.test(id) ? await getBookingSummary({ p_booking_id: id }) : null;
  if (!booking) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-500)] text-2xl text-white shadow-brand" aria-hidden>
          ✓
        </span>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Booking request received</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-soft">
          Nothing to pay yet. Save your reference — you&apos;ll need it with your phone number to check the status.
        </p>
        <p className="mt-5 inline-flex flex-col items-center rounded-2xl border border-dashed border-[var(--color-brand-500)]/40 bg-[var(--color-brand-500)]/6 px-6 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Your reference</span>
          <span className="font-display select-all text-2xl font-bold tracking-wide text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]">{booking.reference}</span>
        </p>
      </div>

      <BookingSummaryCard booking={booking} />

      {booking.payment_link && (
        <a href={booking.payment_link} className="mt-5 flex justify-center rounded-xl bg-[var(--color-accent-400)] px-5 py-3 font-semibold text-[var(--color-brand-900)]">
          Pay advance online
        </a>
      )}

      <section className="mt-10">
        <h2 className="font-display mb-4 text-xl font-bold">What happens next</h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {NEXT_STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-hairline bg-surface-raised p-4">
              <span className="font-display text-sm font-bold text-[var(--color-brand-600)]">0{index + 1}</span>
              <h3 className="font-display mt-1 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <WhatsAppButton href={whatsappGeneralLink(booking.town_name)} label="Questions? WhatsApp us" className="justify-center" />
        <Link
          href={`/booking-status?reference=${booking.reference}`}
          className="flex items-center justify-center rounded-full border border-hairline px-5 py-3 text-sm font-semibold"
        >
          Check status later
        </Link>
        <Link href={`/${booking.town_slug}/vehicles`} className="flex items-center justify-center px-5 py-3 text-sm font-semibold text-ink-soft hover:underline">
          Browse more vehicles
        </Link>
      </div>
    </div>
  );
}
