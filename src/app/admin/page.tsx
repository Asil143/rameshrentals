import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddVehicleForm } from "@/components/admin/add-vehicle-form";
import { BookingActions } from "@/components/admin/booking-actions";
import { VehicleStatusSelect } from "@/components/admin/vehicle-status-select";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const [{ data: bookings }, { data: vehicles }, { data: towns }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, vehicles(make, model, type, town_id, towns(name))")
      .order("created_at", { ascending: false }),
    supabase
      .from("vehicles")
      .select("*, towns(name)")
      .order("created_at", { ascending: false }),
    supabase.from("towns").select("*").eq("active", true).order("name"),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
          Dashboard
        </p>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin</h1>
        <p className="text-sm text-ink-soft">Manage bookings and the vehicle fleet.</p>
      </div>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">Bookings</h2>
        {!bookings || bookings.length === 0 ? (
          <p className="rounded-2xl border border-hairline bg-surface-raised p-6 text-sm text-ink-soft shadow-soft">
            No bookings yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft"
              >
                <div>
                  <p className="font-semibold">
                    {booking.customer_name} · {booking.customer_phone}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {booking.vehicles?.make} {booking.vehicles?.model} (
                    {booking.vehicles?.towns?.name}) · {booking.start_date} →{" "}
                    {booking.end_date}
                    {booking.estimated_total != null && (
                      <> · est. ₹{booking.estimated_total.toLocaleString("en-IN")}</>
                    )}
                  </p>
                  <span className="text-xs font-medium capitalize text-ink-faint">
                    {booking.status}
                  </span>
                </div>
                <BookingActions bookingId={booking.id} status={booking.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">Add a vehicle</h2>
        <AddVehicleForm towns={towns ?? []} />
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">Fleet</h2>
        {!vehicles || vehicles.length === 0 ? (
          <p className="rounded-2xl border border-hairline bg-surface-raised p-6 text-sm text-ink-soft shadow-soft">
            No vehicles yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface-raised shadow-soft">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="px-4 py-3 font-medium text-ink-faint">Vehicle</th>
                  <th className="px-4 py-3 font-medium text-ink-faint">Town</th>
                  <th className="px-4 py-3 font-medium text-ink-faint">Price/day</th>
                  <th className="px-4 py-3 font-medium text-ink-faint">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3">
                      {vehicle.make} {vehicle.model} ({vehicle.type})
                    </td>
                    <td className="px-4 py-3">{vehicle.towns?.name}</td>
                    <td className="px-4 py-3">₹{vehicle.price_per_day}</td>
                    <td className="px-4 py-3">
                      <VehicleStatusSelect vehicleId={vehicle.id} status={vehicle.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
