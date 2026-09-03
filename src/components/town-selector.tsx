"use client";

import { useRouter } from "next/navigation";
import type { Town } from "@/types/database";

export function TownSelector({ currentSlug, towns, prominent = false }: { currentSlug: string; towns: Town[]; prominent?: boolean }) {
  const router = useRouter();

  return (
    <select
      value={currentSlug}
      onChange={(e) => router.push(`/${e.target.value}/vehicles`)}
      className={prominent
        ? "h-14 w-full rounded-xl border border-white/20 bg-white px-4 text-base font-semibold text-[var(--color-brand-900)] shadow-lift outline-none focus:ring-4 focus:ring-white/20"
        : "rounded-full border border-hairline bg-surface-raised px-4 py-2 text-sm font-medium shadow-soft transition-colors hover:border-[var(--color-brand-500)]"}
      aria-label="Select town"
    >
      {towns.map((town) => (
        <option key={town.slug} value={town.slug}>
          {town.name}
        </option>
      ))}
    </select>
  );
}
