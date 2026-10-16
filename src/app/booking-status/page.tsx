import Form from "next/form";
import Link from "next/link";
import { lookupBooking } from "@/lib/queries";

export default async function BookingStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; phone?: string }>;
}) {
  const { reference = "", phone = "" } = await searchParams;
  const booking = reference && phone ? await lookupBooking(reference, phone) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Check booking status</h1>
      <p className="mt-2 text-ink-soft">Use your booking reference and 10-digit phone number.</p>

      <Form action="/booking-status" className="mt-6 grid gap-3 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:grid-cols-[1fr_1fr_auto]">
        <input name="reference" defaultValue={reference} placeholder="RR-XXXXXXXXXX" className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm" />
        <input name="phone" defaultValue={phone} placeholder="Phone number" maxLength={10} className="rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm" />
        <button className="rounded-xl bg-[var(--color-brand-800)] px-5 py-2.5 text-sm font-semibold text-white">Check</button>
      </Form>

      {reference && phone && !booking && (
        <p className="mt-6 rounded-2xl border border-hairline bg-surface-raised p-5 text-sm text-ink-soft">No booking matched those details.</p>
      )}

      {booking && (
        <div className="mt-6 rounded-2xl border border-hairline bg-surface-raised p-6 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">{booking.reference}</p>
          <h2 className="font-display mt-1 text-2xl font-bold">{booking.vehicles?.make} {booking.vehicles?.model}</h2>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs text-ink-faint">Status</dt><dd className="font-semibold capitalize">{booking.status.replaceAll("_", " ")}</dd></div>
            <div><dt className="text-xs text-ink-faint">Payment</dt><dd className="font-semibold capitalize">{booking.payment_status.replaceAll("_", " ")}</dd></div>
            <div><dt className="text-xs text-ink-faint">Dates</dt><dd className="font-semibold">{booking.start_date} to {booking.end_date}</dd></div>
            <div><dt className="text-xs text-ink-faint">Estimated total</dt><dd className="font-semibold">₹{Number(booking.estimated_total ?? 0).toLocaleString("en-IN")}</dd></div>
          </dl>
          {booking.payment_link && <a href={booking.payment_link} className="mt-5 inline-flex rounded-xl bg-[var(--color-accent-400)] px-5 py-3 font-semibold text-[var(--color-brand-900)]">Pay advance</a>}
          <Link href={`/${booking.vehicles?.towns?.slug ?? "addanki"}/vehicles`} className="mt-5 block text-sm font-semibold text-[var(--color-brand-700)]">Browse more vehicles</Link>
        </div>
      )}
    </div>
  );
}
