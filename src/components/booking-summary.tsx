import type { BookingSummary } from "@/types/database";
import type { UiText } from "@/lib/i18n/ui";
import { formatRupees } from "@/lib/pricing";
import { formatDayDate, formatTime } from "@/lib/format";

const STEPS = ["pending", "confirmed", "ready", "picked_up", "returned", "completed"] as const;

export function BookingProgress({ status, u }: { status: BookingSummary["status"]; u: UiText }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
        {u.bookingCancelled}
      </p>
    );
  }
  const current = STEPS.findIndex((step) => step === status);
  return (
    <div>
      <p className="mb-2 text-sm sm:hidden">
        <span className="font-semibold">{STEPS[current] && u.progress[STEPS[current]]}</span>
        <span className="text-ink-faint"> · {u.stepOf(current + 1, STEPS.length)}</span>
      </p>
      <ol className="grid grid-cols-6 gap-1" aria-label="Booking progress">
        {STEPS.map((step, index) => {
          const done = index <= current;
          return (
            <li key={step} className="flex flex-col gap-1.5" aria-current={index === current ? "step" : undefined}>
              <span className={`h-1.5 rounded-full ${done ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-border-strong)]"}`} />
              <span className={`max-sm:sr-only text-xs leading-tight ${index === current ? "font-semibold text-[var(--color-ink)]" : done ? "text-ink-soft" : "text-ink-faint"}`}>
                {u.progress[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function BookingSummaryCard({ booking, u }: { booking: BookingSummary; u: UiText }) {
  const rows = [
    { label: u.vehicle, value: `${booking.vehicle_make} ${booking.vehicle_model}` },
    { label: u.town, value: booking.town_name },
    {
      label: u.pickup,
      value: `${formatDayDate(booking.start_date, u.dateLocale)}${booking.pickup_time ? ` · ${formatTime(booking.pickup_time, u.dateLocale)}` : ""}`,
      hint: booking.fulfillment_method === "doorstep_delivery" ? u.deliveredToYou : u.atOurLocation,
    },
    {
      label: u.return,
      value: `${formatDayDate(booking.end_date, u.dateLocale)}${booking.return_time ? ` · ${formatTime(booking.return_time, u.dateLocale)}` : ""}`,
      hint: booking.return_method === "doorstep_collection" ? u.collectedFromYou : u.atOurLocation,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-soft">
      <div className="border-b border-hairline p-5 sm:p-6">
        <BookingProgress status={booking.status} u={u} />
      </div>
      <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2 sm:p-6">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-ink-faint">{row.label}</dt>
            <dd className="font-semibold">{row.value}</dd>
            {row.hint && <dd className="text-xs text-ink-soft">{row.hint}</dd>}
          </div>
        ))}
      </dl>
      <dl className="grid grid-cols-2 gap-4 bg-[var(--color-brand-500)]/6 p-5 sm:p-6">
        <div>
          <dt className="text-xs text-ink-faint">{u.estimatedRent}</dt>
          <dd className="font-display text-2xl font-bold">{formatRupees(booking.estimated_total ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">{u.refundableDeposit}</dt>
          <dd className="font-display text-2xl font-bold">{formatRupees(booking.deposit_amount)}</dd>
        </div>
        <p className="col-span-2 text-xs text-ink-soft">
          {u.payment}: <span className="font-semibold">{u.paymentStatus[booking.payment_status]}</span>
          {booking.advance_amount > 0 && <> · {u.advanceDue(formatRupees(booking.advance_amount))}</>}
        </p>
      </dl>
    </div>
  );
}
