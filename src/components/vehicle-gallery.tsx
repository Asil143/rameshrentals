"use client";

import { useState } from "react";

export function VehicleGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] shadow-soft dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[active]} alt={alt} className="h-full w-full object-cover" />
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2.5">
          {photos.map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                i === active
                  ? "border-[var(--color-brand-500)]"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
