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
    title: "Exterior street view",
    description:
      "A bold roadside facade with a covered display, clear branding, and a dedicated pickup and return entrance.",
    src: "/concepts/exterior-concept.png",
    alt: "Exterior concept for the Ramesh Rentals vehicle hub",
  },
  {
    title: "Interior operations",
    description:
      "A practical interior with separate bike and car zones, a central inspection lane, and a secure key office.",
    src: "/concepts/interior-concept.png",
    alt: "Interior operations concept for the Ramesh Rentals vehicle hub",
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
            Three early concepts for a secure, customer-friendly home for the
            Ramesh Rentals fleet. Open or download any image below.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
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
