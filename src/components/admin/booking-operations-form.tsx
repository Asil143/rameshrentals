"use client";

import { useState, useTransition } from "react";
import { updateBookingOperations } from "@/app/actions";
import type { Booking } from "@/types/database";

export function BookingOperationsForm({ booking }: { booking: Booking }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const input = "rounded-lg border border-hairline bg-[var(--color-surface)] px-2 py-2 text-xs";
  return <details className="mt-3"><summary className="cursor-pointer text-xs font-semibold text-[var(--color-brand-700)]">Payment & inspection details</summary>
    <form action={(data) => startTransition(async () => { const result = await updateBookingOperations(data); setMessage(result.ok ? "Operations updated." : result.error); })} className="mt-3 grid gap-2 rounded-xl bg-[var(--color-surface)] p-3 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="booking_id" value={booking.id} />
      <label className="grid gap-1 text-xs">Payment<select name="payment_status" defaultValue={booking.payment_status} className={input}><option value="unpaid">Unpaid</option><option value="part_paid">Part paid</option><option value="paid">Paid</option><option value="refunded">Refunded</option></select></label>
      <label className="grid gap-1 text-xs">Deposit<select name="deposit_status" defaultValue={booking.deposit_status} className={input}><option value="not_collected">Not collected</option><option value="held">Held</option><option value="partially_refunded">Part refunded</option><option value="refunded">Refunded</option><option value="forfeited">Forfeited</option></select></label>
      <label className="grid gap-1 text-xs">Inspection<select name="inspection_stage" className={input}><option value="">No inspection</option><option value="handover">Handover</option><option value="return">Return</option></select></label>
      <label className="grid gap-1 text-xs">Odometer<input name="odometer_km" type="number" min="0" className={input} /></label>
      <label className="grid gap-1 text-xs">Fuel<select name="fuel_level" className={input}><option value="">Not recorded</option><option value="empty">Empty</option><option value="quarter">Quarter</option><option value="half">Half</option><option value="three_quarters">Three quarters</option><option value="full">Full</option><option value="electric">Electric</option></select></label>
      <label className="grid gap-1 text-xs sm:col-span-2">Inspection notes<input name="inspection_notes" maxLength={1000} className={input} /></label>
      <button disabled={pending} className="self-end rounded-lg bg-[var(--color-brand-700)] px-3 py-2 text-xs font-semibold text-white">{pending ? "Saving…" : "Save"}</button>
      {message && <span role="status" className="text-xs text-ink-faint sm:col-span-full">{message}</span>}
    </form>
  </details>;
}
