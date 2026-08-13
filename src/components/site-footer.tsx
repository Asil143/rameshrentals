import { SITE_NAME, TOWNS } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 py-8 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4">
        <p className="font-medium text-black/80 dark:text-white/80">{SITE_NAME}</p>
        <p>Bike &amp; car rentals across {TOWNS.map((t) => t.name).join(", ")}.</p>
        <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
      </div>
    </footer>
  );
}
