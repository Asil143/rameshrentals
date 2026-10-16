import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { whatsappGeneralLink } from "@/lib/whatsapp";

export default async function BookingConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, vehicles(make, model, type, towns(name, slug))")
    .eq("id", id)
    .maybeSingle();

  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-hairline bg-surface-raised p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">Booking request received</p>
        <h1 className="font-display mt-2 text-3xl font-bold">Reference {booking.reference}</h1>
        <p className="mt-2 text-ink-soft">We will confirm availability and handover details shortly. Keep this reference for status checks.</p>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline p-4"><dt className="text-xs text-ink-faint">Vehicle</dt><dd className="font-semibold">{booking.vehicles?.make} {booking.vehicles?.model}</dd></div>
          <div className="rounded-xl border border-hairline p-4"><dt className="text-xs text-ink-faint">Town</dt><dd className="font-semibold">{booking.vehicles?.towns?.name}</dd></div>
          <div className="rounded-xl border border-hairline p-4"><dt className="text-xs text-ink-faint">Dates</dt><dd className="font-semibold">{booking.start_date} to {booking.end_date}</dd></div>
          <div className="rounded-xl border border-hairline p-4"><dt className="text-xs text-ink-faint">Estimated total</dt><dd className="font-semibold">₹{Number(booking.estimated_total ?? 0).toLocaleString("en-IN")}</dd></div>
          <div className="rounded-xl border border-hairline p-4"><dt className="text-xs text-ink-faint">Refundable deposit</dt><dd className="font-semibold">₹{Number(booking.deposit_amount ?? 0).toLocaleString("en-IN")}</dd></div>
          <div className="rounded-xl border border-hairline p-4"><dt className="text-xs text-ink-faint">Status</dt><dd className="font-semibold capitalize">{booking.status.replaceAll("_", " ")}</dd></div>
        </dl>

        {booking.payment_link && (
          <a href={booking.payment_link} className="mt-5 inline-flex rounded-xl bg-[var(--color-accent-400)] px-5 py-3 font-semibold text-[var(--color-brand-900)]">Pay advance</a>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/booking-status" className="rounded-xl border border-hairline px-4 py-3 text-sm font-semibold">Check status later</Link>
          <WhatsAppButton href={whatsappGeneralLink(booking.vehicles?.towns?.name ?? undefined)} label="Message on WhatsApp" />
        </div>
      </div>
    </div>
  );
}
