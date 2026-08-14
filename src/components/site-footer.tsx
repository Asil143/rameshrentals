import Link from "next/link";
import { SITE_NAME, TOWNS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-hairline bg-surface-raised">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-sm font-bold text-white">
                R
              </span>
              <span className="font-display text-base font-bold">{SITE_NAME}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              Organized bike &amp; car rentals for towns the big platforms skip.
              Doorstep delivery, pay at pickup, book on WhatsApp.
            </p>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Where we operate
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {TOWNS.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/${t.slug}/vehicles`}
                    className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Account
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-hairline pt-6 text-xs text-ink-faint">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
