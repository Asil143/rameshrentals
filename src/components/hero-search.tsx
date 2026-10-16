"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Town } from "@/types/database";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

const field =
  "h-12 w-full rounded-xl border border-white/20 bg-white px-3 text-sm font-semibold text-[var(--color-brand-900)] outline-none focus:ring-4 focus:ring-white/25";

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** Town + pickup/return dates → the town's vehicle list, filtered to vehicles free on those dates. */
export function HeroSearch({ towns, defaultSlug, locale }: { towns: Town[]; defaultSlug: string; locale: Locale }) {
  const u = getDictionary(locale).ui;
  const router = useRouter();
  const today = todayInIndia();
  const [slug, setSlug] = useState(defaultSlug);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (start && end && end < start) {
      setError(u.returnBeforePickup);
      return;
    }
    const params = new URLSearchParams();
    if (start && end) {
      params.set("start_date", start);
      params.set("end_date", end);
    }
    const query = params.toString();
    router.push(`/${slug}/vehicles${query ? `?${query}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="grid gap-2.5 sm:grid-cols-[1.1fr_1fr_1fr]">
      <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-white/65">
        {u.town}
        <select value={slug} onChange={(event) => setSlug(event.target.value)} className={field}>
          {towns.map((town) => (
            <option key={town.slug} value={town.slug}>
              {town.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-white/65">
        {u.pickupDate}
        <input
          type="date"
          min={today}
          value={start}
          onChange={(event) => {
            setStart(event.target.value);
            setError(null);
            if (end && event.target.value > end) setEnd(event.target.value);
          }}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-[.12em] text-white/65">
        {u.returnDate}
        <input
          type="date"
          min={start || today}
          value={end}
          onChange={(event) => {
            setEnd(event.target.value);
            setError(null);
          }}
          className={field}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm font-semibold text-[var(--color-accent-300)] sm:col-span-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="h-12 rounded-xl bg-[var(--color-accent-400)] px-6 font-semibold text-[var(--color-brand-900)] shadow-lift transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-300)] sm:col-span-3"
      >
        {start && end ? u.showAvailable : u.browseAll}
      </button>
    </form>
  );
}
