import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/constants";
import { PrintButton } from "@/components/print-button";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase.from("bookings").select("*, vehicles(make, model, registration_no, type)").eq("id", id).single();
  if (!booking) notFound();
  const rental = Math.max(0, Number(booking.estimated_total ?? 0) - Number(booking.delivery_fee) - Number(booking.collection_fee) - Number(booking.extras_total));
  return <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--color-brand-600)]">{SITE_NAME}</p><h1 className="font-display text-3xl font-bold">Rental summary</h1><p className="text-ink-faint">Reference {booking.reference}</p></div><PrintButton /></div>
    <div className="mt-10 grid gap-6 rounded-2xl border border-hairline bg-surface-raised p-6 sm:grid-cols-2">
      <section><h2 className="font-display font-semibold">Customer</h2><p className="mt-2">{booking.customer_name}<br />{booking.customer_phone}</p></section>
      <section><h2 className="font-display font-semibold">Vehicle</h2><p className="mt-2">{booking.vehicles?.make} {booking.vehicles?.model}<br />{booking.vehicles?.registration_no}</p></section>
      <section><h2 className="font-display font-semibold">Schedule</h2><p className="mt-2">{booking.start_date} at {booking.pickup_time}<br />to {booking.end_date} at {booking.return_time}</p></section>
      <section><h2 className="font-display font-semibold">Handover</h2><p className="mt-2 capitalize">{booking.fulfillment_method.replaceAll("_", " ")}<br />{booking.delivery_address}</p></section>
    </div>
    <dl className="mt-6 space-y-2 rounded-2xl border border-hairline p-6"><div className="flex justify-between"><dt>Rental</dt><dd>₹{rental.toLocaleString("en-IN")}</dd></div><div className="flex justify-between"><dt>Delivery</dt><dd>₹{Number(booking.delivery_fee).toLocaleString("en-IN")}</dd></div><div className="flex justify-between"><dt>Return collection</dt><dd>₹{Number(booking.collection_fee).toLocaleString("en-IN")}</dd></div><div className="flex justify-between"><dt>Extras</dt><dd>₹{Number(booking.extras_total).toLocaleString("en-IN")}</dd></div><div className="flex justify-between border-t border-hairline pt-3 font-bold"><dt>Rental total</dt><dd>₹{Number(booking.estimated_total ?? 0).toLocaleString("en-IN")}</dd></div><div className="flex justify-between text-ink-soft"><dt>Refundable deposit</dt><dd>₹{Number(booking.deposit_amount).toLocaleString("en-IN")}</dd></div></dl>
    <p className="mt-8 text-sm leading-relaxed text-ink-soft">This summary accompanies the booking and is not a tax invoice until payment is recorded. The customer agrees to the published rental, damage, fuel and cancellation policies.</p>
  </article>;
}
