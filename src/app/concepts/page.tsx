import type { Metadata } from "next";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Rental Hub Concepts | ${SITE_NAME}`,
  description:
    "Explore exterior, interior, and floor-plan concepts for the future Ramesh Rentals vehicle hub.",
};

const concepts = [
  {
    title: "3D daylight exterior",
    description:
      "A street-level architectural render of the proposed dark steel hub, illuminated brand fascia, vehicle bays, and customer forecourt.",
    src: "/concepts/rental-hub-day.png",
    alt: "Daylight 3D architectural render of the Ramesh Rentals vehicle hub",
  },
  {
    title: "Cinematic night exterior",
    description:
      "A dramatic evening render showing the glowing roadside identity, illuminated parking lanes, office volume, and secure open frontage.",
    src: "/concepts/rental-hub-night.png",
    alt: "Night-time 3D architectural render of the Ramesh Rentals vehicle hub",
  },
  {
    title: "Illustrative floor plan",
    description:
      "A 40 by 70 foot starting concept showing parking, handover, washing, service, storage, and office areas.",
    src: "/concepts/floor-plan.png",
    alt: "Top-down floor plan concept for the Ramesh Rentals vehicle hub",
  },
] as const;

export default function ConceptsPage() {
  return (
    <div>
      <section className="mesh-hero px-4 py-14 text-white sm:py-18">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            Future rental hub
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-5xl">
            See the shed ideas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            A cinematic 3D preview and architectural concepts for a secure,
            customer-friendly home for the Ramesh Rentals fleet.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-lift">
          <div className="relative aspect-video">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              poster="/concepts/rental-hub-day.png"
              aria-label="Animated day-to-night preview of the Ramesh Rentals vehicle hub"
            >
              <source src="/concepts/rental-hub-hero.mp4" type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16 text-white sm:px-8 sm:pb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-300)]">
                Cinematic preview
              </p>
              <h2 className="mt-1 font-display text-xl font-bold sm:text-3xl">
                From daylight to a glowing night landmark
              </h2>
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {concepts.map((concept, index) => (
            <article
              key={concept.src}
              className="overflow-hidden rounded-3xl border border-hairline bg-surface-raised shadow-soft"
            >
              <div className="border-b border-hairline p-5 sm:flex sm:items-end sm:justify-between sm:gap-6 sm:p-7">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
                    Concept {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-display text-xl font-bold sm:text-2xl">
                    {concept.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
                    {concept.description}
                  </p>
                </div>
                <a
                  href={concept.src}
                  download
                  className="mt-4 inline-flex shrink-0 items-center justify-center rounded-full border border-hairline px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)] sm:mt-0"
                >
                  Download PNG
                </a>
              </div>
              <a href={concept.src} target="_blank" rel="noreferrer">
                <Image
                  src={concept.src}
                  alt={concept.alt}
                  width={1600}
                  height={1000}
                  className="h-auto w-full"
                  sizes="(max-width: 1152px) 100vw, 1152px"
                />
              </a>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--color-accent-400)]/35 bg-[var(--color-accent-300)]/15 p-5 text-sm leading-relaxed text-ink-soft sm:p-6">
          <strong className="text-[var(--color-ink)]">Planning note:</strong>{" "}
          these are visual starting points, not engineering drawings. Final
          dimensions, structure, drainage, electrical work, and permissions
          should be verified by qualified local professionals.
        </div>
      </section>
    </div>
  );
}
