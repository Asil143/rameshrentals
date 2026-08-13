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
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Manage bookings and the vehicle fleet.
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Bookings</h2>
        {!bookings || bookings.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">No bookings yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <div>
                  <p className="font-medium">
                    {booking.customer_name} · {booking.customer_phone}
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {booking.vehicles?.make} {booking.vehicles?.model} (
                    {booking.vehicles?.towns?.name}) · {booking.start_date} →{" "}
                    {booking.end_date}
                  </p>
                  <span className="text-xs font-medium capitalize text-black/50 dark:text-white/50">
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
        <h2 className="mb-4 text-lg font-semibold">Add a vehicle</h2>
        <AddVehicleForm towns={towns ?? []} />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Fleet</h2>
        {!vehicles || vehicles.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">No vehicles yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left dark:border-white/10">
                  <th className="py-2 pr-4">Vehicle</th>
                  <th className="py-2 pr-4">Town</th>
                  <th className="py-2 pr-4">Price/day</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-black/5 dark:border-white/5">
                    <td className="py-2 pr-4">
                      {vehicle.make} {vehicle.model} ({vehicle.type})
                    </td>
                    <td className="py-2 pr-4">{vehicle.towns?.name}</td>
                    <td className="py-2 pr-4">₹{vehicle.price_per_day}</td>
                    <td className="py-2 pr-4">
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
