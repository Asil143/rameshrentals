"use client";

import { useRouter } from "next/navigation";
import { TOWNS } from "@/lib/constants";

export function TownSelector({ currentSlug }: { currentSlug: string }) {
  const router = useRouter();

  return (
    <select
      value={currentSlug}
      onChange={(e) => router.push(`/${e.target.value}/vehicles`)}
      className="rounded-full border border-hairline bg-surface-raised px-4 py-2 text-sm font-medium shadow-soft transition-colors hover:border-[var(--color-brand-500)]"
      aria-label="Select town"
    >
      {TOWNS.map((town) => (
        <option key={town.slug} value={town.slug}>
          {town.name}
        </option>
      ))}
    </select>
  );
}
