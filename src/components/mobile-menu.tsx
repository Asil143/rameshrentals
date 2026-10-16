"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** A <details> dropdown that closes itself after navigating, since the header persists across pages. */
export function MobileMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details ref={ref} className="relative sm:hidden">
      <summary className="flex h-10 cursor-pointer list-none items-center rounded-full border border-hairline bg-surface-raised px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {label}
      </summary>
      <div className="absolute right-0 top-12 z-30 flex w-48 flex-col gap-1 rounded-2xl border border-hairline bg-surface-raised p-2 shadow-lift">
        {children}
      </div>
    </details>
  );
}
