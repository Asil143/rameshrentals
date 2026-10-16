import QRCode from "qrcode";
import type { BookingSummary, Town } from "@/types/database";
import type { UiText } from "@/lib/i18n/ui";
import { formatRupees } from "@/lib/pricing";
import { upiPaymentUri } from "@/lib/upi";

/**
 * How a customer pays the advance the admin asked for: a UPI QR / app link when
 * the town has a UPI ID, otherwise the admin's payment link, otherwise nothing.
 */
export async function AdvancePayment({ booking, town, u }: { booking: BookingSummary; town: Town | null; u: UiText }) {
  const amount = Number(booking.advance_amount);
  if (!(amount > 0) || booking.payment_status !== "unpaid") return null;

  if (town?.upi_id) {
    const uri = upiPaymentUri({ upiId: town.upi_id, payee: town.upi_payee_name || "Ramesh Rentals", amount, note: booking.reference });
    const qr = await QRCode.toString(uri, { type: "svg", margin: 1, width: 180, color: { dark: "#0b2c21", light: "#ffffff" } });

    return (
      <section className="mt-5 grid items-center gap-5 rounded-2xl border border-[var(--color-accent-400)]/50 bg-[var(--color-accent-400)]/10 p-5 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto w-44 overflow-hidden rounded-xl bg-white p-1.5 sm:mx-0" role="img" aria-label={u.upiTitle(formatRupees(amount))} dangerouslySetInnerHTML={{ __html: qr }} />
        <div>
          <h2 className="font-display text-lg font-bold">{u.upiTitle(formatRupees(amount))}</h2>
          <a href={uri} className="mt-3 inline-flex rounded-xl bg-[var(--color-brand-700)] px-5 py-3 font-semibold text-white sm:hidden">
            {u.upiOpenApp}
          </a>
          <p className="mt-3 text-sm text-ink-soft">{u.upiScan}</p>
          <p className="mt-1 text-sm font-semibold">{u.upiId(town.upi_id)}</p>
          <p className="mt-2 text-xs text-ink-faint">{u.upiNote(booking.reference)}</p>
        </div>
      </section>
    );
  }

  if (booking.payment_link) {
    return (
      <a href={booking.payment_link} className="mt-5 flex justify-center rounded-xl bg-[var(--color-accent-400)] px-5 py-3 font-semibold text-[var(--color-brand-900)]">
        {u.payAdvance}
      </a>
    );
  }
  return null;
}
