"use client";

import { useState, useTransition } from "react";
import { addTestimonial } from "@/app/actions";
import type { Town } from "@/types/database";

export function TestimonialForm({ towns }: { towns: Town[] }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const input = "rounded-xl border border-hairline bg-[var(--color-surface)] px-3.5 py-2.5 text-sm";

  return (
    <form action={(data) => startTransition(async () => { const result = await addTestimonial(data); setMessage(result.ok ? "Testimonial added." : result.error); })} className="grid gap-3 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft sm:grid-cols-2 lg:grid-cols-5">
      <label className="grid gap-1 text-sm font-medium">Customer<input name="customer_name" required className={input} /></label>
      <label className="grid gap-1 text-sm font-medium">Town<select name="town_id" className={input}><option value="">General</option>{towns.map((town) => <option key={town.id} value={town.id}>{town.name}</option>)}</select></label>
      <label className="grid gap-1 text-sm font-medium">Rating<input name="rating" type="number" min="1" max="5" defaultValue="5" className={input} /></label>
      <label className="grid gap-1 text-sm font-medium sm:col-span-2">Quote<input name="quote" required minLength={10} maxLength={400} className={input} /></label>
      <button disabled={pending} className="rounded-xl bg-[var(--color-brand-800)] px-4 py-2.5 text-sm font-semibold text-white lg:col-start-5">{pending ? "Saving..." : "Add review"}</button>
      {message && <p className="text-sm text-ink-soft sm:col-span-full">{message}</p>}
    </form>
  );
}
