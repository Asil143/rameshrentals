import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  completed: "bg-black/10 text-black/70 dark:bg-white/10 dark:text-white/70",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400",
};

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const locale = await getLocale();
  const t = getDictionary(locale).bookings;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, vehicles(make, model, type)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display mb-8 text-2xl font-bold sm:text-3xl">{t.title}</h1>

      {!bookings || bookings.length === 0 ? (
        <p className="rounded-2xl border border-hairline bg-surface-raised p-8 text-center text-ink-soft shadow-soft">
          {t.empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft"
            >
              <div>
                <p className="font-display font-semibold">
                  {booking.vehicles?.make} {booking.vehicles?.model}
                </p>
                <p className="text-sm text-ink-soft">
                  {booking.start_date} → {booking.end_date}
                  {booking.estimated_total != null && (
                    <>
                      {" "}
                      · {t.estimatedPrefix} ₹{booking.estimated_total.toLocaleString("en-IN")}
                    </>
                  )}
                  <span className="block text-xs text-ink-faint">
                    {booking.fulfillment_method === "doorstep_delivery" ? "Doorstep delivery" : "Pickup at location"}
                  </span>
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}
              >
                {t.status[booking.status as keyof typeof t.status] ?? booking.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
