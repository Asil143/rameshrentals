"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cancelOwnBooking, rescheduleOwnBooking } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import type { BookingStatus } from "@/types/database";
import type { UiText } from "@/lib/i18n/ui";

export function BookingControls({ bookingId, status, u }: { bookingId: string; status: BookingStatus; u: UiText }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const changeable = status === "pending" || status === "confirmed";

  async function upload(file: File | null) {
    if (!file) return;
    setMessage(u.uploading);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const { error } = await createClient().storage.from("rental-documents").upload(`${bookingId}/${Date.now()}-${safeName}`, file);
    setMessage(error ? u.uploadFailed : u.uploaded);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
      <Link href={`/bookings/${bookingId}/invoice`} className="rounded-lg border border-hairline px-3 py-2 text-xs font-semibold">{u.invoice}</Link>
      {changeable && <details className="relative"><summary className="cursor-pointer list-none rounded-lg border border-hairline px-3 py-2 text-xs font-semibold">{u.changeDates}</summary><form action={(formData) => startTransition(async () => { const result = await rescheduleOwnBooking(bookingId, String(formData.get("start")), String(formData.get("end"))); setMessage(result.ok ? u.datesUpdated : result.error); })} className="absolute right-0 z-10 mt-2 grid w-64 gap-2 rounded-xl border border-hairline bg-surface-raised p-3 shadow-lift"><input name="start" type="date" required className="rounded-lg border border-hairline bg-[var(--color-surface)] p-2 text-xs" /><input name="end" type="date" required className="rounded-lg border border-hairline bg-[var(--color-surface)] p-2 text-xs" /><button disabled={pending} className="rounded-lg bg-[var(--color-brand-700)] p-2 text-xs font-semibold text-white">{u.saveDates}</button></form></details>}
      {changeable && <button disabled={pending} onClick={() => startTransition(async () => { const result = await cancelOwnBooking(bookingId); setMessage(result.ok ? u.bookingCancelledShort : result.error); })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">{u.cancel}</button>}
      <label className="cursor-pointer rounded-lg border border-hairline px-3 py-2 text-xs font-semibold">{u.uploadDocument}<input type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" onChange={(event) => void upload(event.target.files?.[0] ?? null)} /></label>
      {message && <span role="status" className="w-full text-xs text-ink-faint">{message}</span>}
    </div>
  );
}
