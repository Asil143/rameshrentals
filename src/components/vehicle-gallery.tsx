"use client";

import { useState } from "react";
import Image from "next/image";

export function VehicleGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative flex aspect-[4/3] touch-pan-y items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] shadow-soft dark:from-[var(--color-brand-900)] dark:to-[var(--color-brand-800)]"
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={(event) => {
          if (touchStart == null || photos.length < 2) return;
          const distance = event.changedTouches[0].clientX - touchStart;
          if (Math.abs(distance) > 45) setActive((current) => distance < 0 ? Math.min(photos.length - 1, current + 1) : Math.max(0, current - 1));
          setTouchStart(null);
        }}
      >
        <Image src={photos[active]} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        {photos.length > 1 && <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">{active + 1} / {photos.length}</span>}
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
              <span className="relative block h-full w-full">
                <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
