import type { BookingSummary } from "@/types/database";
import { formatRupees } from "@/lib/pricing";

const STEPS = [
  { status: "pending", label: "Requested" },
  { status: "confirmed", label: "Confirmed" },
  { status: "ready", label: "Ready" },
  { status: "picked_up", label: "Picked up" },
  { status: "returned", label: "Returned" },
  { status: "completed", label: "Completed" },
] as const;

function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(new Date(y, m - 1, d));
}

function formatTime(time: string | null) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, h, m));
}

export function BookingProgress({ status }: { status: BookingSummary["status"] }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
        This booking was cancelled.
      </p>
    );
  }
  const current = STEPS.findIndex((step) => step.status === status);
  return (
    <div>
      <p className="mb-2 text-sm sm:hidden">
        <span className="font-semibold">{STEPS[current]?.label}</span>
        <span className="text-ink-faint"> · Step {current + 1} of {STEPS.length}</span>
      </p>
      <ol className="grid grid-cols-6 gap-1" aria-label="Booking progress">
        {STEPS.map((step, index) => {
          const done = index <= current;
          return (
            <li key={step.status} className="flex flex-col gap-1.5" aria-current={index === current ? "step" : undefined}>
              <span className={`h-1.5 rounded-full ${done ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-border-strong)]"}`} />
              <span className={`max-sm:sr-only text-xs leading-tight ${index === current ? "font-semibold text-[var(--color-ink)]" : done ? "text-ink-soft" : "text-ink-faint"}`}>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function BookingSummaryCard({ booking }: { booking: BookingSummary }) {
  const rows = [
    { label: "Vehicle", value: `${booking.vehicle_make} ${booking.vehicle_model}` },
    { label: "Town", value: booking.town_name },
    {
      label: "Pickup",
      value: `${formatDate(booking.start_date)}${booking.pickup_time ? ` · ${formatTime(booking.pickup_time)}` : ""}`,
      hint: booking.fulfillment_method === "doorstep_delivery" ? "Delivered to your address" : "At our location",
    },
    {
      label: "Return",
      value: `${formatDate(booking.end_date)}${booking.return_time ? ` · ${formatTime(booking.return_time)}` : ""}`,
      hint: booking.return_method === "doorstep_collection" ? "Collected from your address" : "At our location",
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-soft">
      <div className="border-b border-hairline p-5 sm:p-6">
        <BookingProgress status={booking.status} />
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
          <dt className="text-xs text-ink-faint">Estimated rent</dt>
          <dd className="font-display text-2xl font-bold">{formatRupees(booking.estimated_total ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Refundable deposit</dt>
          <dd className="font-display text-2xl font-bold">{formatRupees(booking.deposit_amount)}</dd>
        </div>
        <p className="col-span-2 text-xs text-ink-soft">
          Payment: <span className="font-semibold capitalize">{booking.payment_status.replaceAll("_", " ")}</span>
          {booking.advance_amount > 0 && <> · Advance due {formatRupees(booking.advance_amount)}</>}
        </p>
      </dl>
    </div>
  );
}
