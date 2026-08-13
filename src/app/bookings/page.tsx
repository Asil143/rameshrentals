import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, vehicles(make, model, type)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Bookings</h1>

      {!bookings || bookings.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          No bookings yet. Browse vehicles and request a booking to see it here.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10"
            >
              <div>
                <p className="font-semibold">
                  {booking.vehicles?.make} {booking.vehicles?.model}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {booking.start_date} → {booking.end_date}
                  {booking.estimated_total != null && (
                    <> · est. ₹{booking.estimated_total.toLocaleString("en-IN")}</>
                  )}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[booking.status]}`}
              >
                {booking.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
