import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/lib/constants";
import { PrintButton } from "@/components/print-button";
import { formatRupees } from "@/lib/pricing";
import { formatLongDate, formatTime } from "@/lib/format";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, vehicles(make, model, registration_no, type, towns(name, pickup_address))")
    .eq("id", id)
    .single();
  if (!booking) notFound();

  const rental = Math.max(0, Number(booking.estimated_total ?? 0) - Number(booking.delivery_fee) - Number(booking.collection_fee) - Number(booking.extras_total));
  const lines = [
    { label: "Rental", amount: rental },
    { label: "Doorstep delivery", amount: Number(booking.delivery_fee) },
    { label: "Return collection", amount: Number(booking.collection_fee) },
    { label: "Extras", amount: Number(booking.extras_total) },
  ].filter((line, index) => index === 0 || line.amount > 0);
  const contactPhone = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 7)} ${WHATSAPP_NUMBER.slice(7)}`;
  const town = booking.vehicles?.towns;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 print:max-w-none print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-hairline bg-surface-raised p-6 shadow-soft sm:p-10 print:rounded-none print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-hairline pb-6">
          <div>
            <p className="font-display text-xl font-bold">{SITE_NAME}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {town?.pickup_address || town?.name}
              <br />
              {contactPhone} · {SITE_URL.replace("https://", "")}
            </p>
          </div>
          <div className="text-right">
            <h1 className="font-display text-2xl font-bold">Rental summary</h1>
            <p className="mt-1 text-sm text-ink-soft">{booking.reference}</p>
            <p className="text-sm text-ink-soft">Issued {formatLongDate(booking.created_at.slice(0, 10))}</p>
          </div>
        </header>

        <div className="grid gap-6 border-b border-hairline py-6 sm:grid-cols-2">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Customer</h2>
            <p className="mt-1.5 font-semibold">{booking.customer_name}</p>
            <p className="text-sm text-ink-soft">+91 {booking.customer_phone}</p>
            {booking.delivery_address && <p className="mt-1 text-sm text-ink-soft">{booking.delivery_address}</p>}
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Vehicle</h2>
            <p className="mt-1.5 font-semibold">{booking.vehicles?.make} {booking.vehicles?.model}</p>
            <p className="text-sm text-ink-soft">{booking.vehicles?.registration_no}</p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Pickup</h2>
            <p className="mt-1.5 font-semibold">{formatLongDate(booking.start_date)}{booking.pickup_time && `, ${formatTime(booking.pickup_time)}`}</p>
            <p className="text-sm text-ink-soft">{booking.fulfillment_method === "doorstep_delivery" ? "Delivered to customer" : "At our location"}</p>
          </section>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Return</h2>
            <p className="mt-1.5 font-semibold">{formatLongDate(booking.end_date)}{booking.return_time && `, ${formatTime(booking.return_time)}`}</p>
            <p className="text-sm text-ink-soft">{booking.return_method === "doorstep_collection" ? "Collected from customer" : "At our location"}</p>
          </section>
        </div>

        <dl className="space-y-2.5 py-6">
          {lines.map((line) => (
            <div key={line.label} className="flex justify-between">
              <dt className="text-ink-soft">{line.label}</dt>
              <dd>{formatRupees(line.amount)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-hairline pt-3 text-lg font-bold">
            <dt>Rental total</dt>
            <dd>{formatRupees(booking.estimated_total ?? 0)}</dd>
          </div>
          <div className="flex justify-between text-sm text-ink-soft">
            <dt>Refundable deposit (returned after the vehicle is checked)</dt>
            <dd>{formatRupees(booking.deposit_amount)}</dd>
          </div>
          <div className="flex justify-between text-sm text-ink-soft">
            <dt>Payment status</dt>
            <dd className="capitalize">{booking.payment_status.replaceAll("_", " ")}</dd>
          </div>
        </dl>

        <p className="border-t border-hairline pt-6 text-xs leading-relaxed text-ink-faint">
          This summary accompanies the booking and is not a tax invoice until payment is recorded. The customer agrees to
          the published rental, damage, fuel and cancellation policies at {SITE_URL.replace("https://", "")}/about.
        </p>
      </div>
    </article>
  );
}
