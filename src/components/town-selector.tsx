"use client";

import { useRouter } from "next/navigation";
import { TOWNS } from "@/lib/constants";

export function TownSelector({ currentSlug }: { currentSlug: string }) {
  const router = useRouter();

  return (
    <select
      value={currentSlug}
      onChange={(e) => router.push(`/${e.target.value}/vehicles`)}
      className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black"
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
