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
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {isAdmin && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}
          {user ? (
            <Link href="/bookings" className="hover:underline">
              My Bookings
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
