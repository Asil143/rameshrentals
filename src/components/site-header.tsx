import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/constants";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-[var(--color-surface)]/80 backdrop-blur-lg backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-base font-bold text-white shadow-soft transition-transform group-hover:scale-105">
            R
          </span>
          <span className="font-display text-lg font-bold tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:gap-5">
          {isAdmin && (
            <Link
              href="/admin"
              className="font-medium text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
            >
              Admin
            </Link>
          )}
          {user ? (
            <Link
              href="/bookings"
              className="font-medium text-ink-soft transition-colors hover:text-[var(--color-brand-700)] dark:hover:text-[var(--color-brand-400)]"
            >
              My Bookings
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:shadow-brand hover:brightness-105 active:scale-[0.97]"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
