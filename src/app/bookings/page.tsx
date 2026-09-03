import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { BookingControls } from "@/components/booking-controls";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  ready: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  picked_up: "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
  returned: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300",
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
              className="rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">{booking.reference}</p>
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
                    {booking.pickup_time ? ` · ${booking.pickup_time.slice(0, 5)}` : ""}
                  </span>
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}
              >
                {t.status[booking.status as keyof typeof t.status] ?? booking.status}
              </span>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-1" aria-label="Booking progress">
                {["Requested", "Confirmed", "Ready", "Returned"].map((label, index) => {
                  const order = ["pending", "confirmed", "ready", "picked_up", "returned", "completed"];
                  const thresholds = [0, 1, 2, 4];
                  const active = booking.status !== "cancelled" && order.indexOf(booking.status) >= thresholds[index];
                  return <div key={label}><span className={`block h-1.5 rounded-full ${active ? "bg-[var(--color-brand-500)]" : "bg-[var(--color-border)]"}`} /><span className="mt-1 block text-[10px] text-ink-faint">{label}</span></div>;
                })}
              </div>
              <BookingControls bookingId={booking.id} status={booking.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
