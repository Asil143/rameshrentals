import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddVehicleForm } from "@/components/admin/add-vehicle-form";
import { BookingActions } from "@/components/admin/booking-actions";
import { VehicleStatusSelect } from "@/components/admin/vehicle-status-select";
import { BookingOperationsForm } from "@/components/admin/booking-operations-form";
import { VehicleDetailsForm } from "@/components/admin/vehicle-details-form";
import { TownOperationsForm } from "@/components/admin/town-operations-form";
import { MaintenanceBlockForm } from "@/components/admin/maintenance-block-form";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import Link from "next/link";
import Form from "next/form";
import type { BookingStatus } from "@/types/database";

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "ready", "picked_up", "returned", "completed", "cancelled"];

function isBookingStatus(value: string | undefined): value is BookingStatus {
  return BOOKING_STATUSES.some((status) => status === value);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; date?: string; town?: string }>;
}) {
  const filters = await searchParams;
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

  let bookingsQuery = supabase
      .from("bookings")
      .select("*, vehicles(make, model, type, town_id, towns(name))")
      .order("created_at", { ascending: false });
  if (isBookingStatus(filters.status)) bookingsQuery = bookingsQuery.eq("status", filters.status);
  if (filters.date) bookingsQuery = bookingsQuery.or(`start_date.eq.${filters.date},end_date.eq.${filters.date}`);
  if (filters.q) {
    const term = filters.q.replaceAll("%", "").trim();
    if (term) bookingsQuery = bookingsQuery.or(`reference.ilike.%${term}%,customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%`);
  }

  const [{ data: bookings }, { data: vehicles }, { data: towns }, { data: maintenanceBlocks }] = await Promise.all([
    bookingsQuery,
    supabase
      .from("vehicles")
      .select("*, towns(name)")
      .order("created_at", { ascending: false }),
    supabase.from("towns").select("*").eq("active", true).order("name"),
    supabase.from("vehicle_maintenance_blocks").select("*").order("start_date", { ascending: true }).limit(12),
  ]);

  const visibleBookings = filters.town && bookings
    ? bookings.filter((booking) => booking.vehicles?.town_id === filters.town)
    : bookings;

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
        <h2 className="font-display mb-4 text-lg font-semibold">Locations & delivery</h2>
        <div className="space-y-3">{towns?.map((town) => <TownOperationsForm key={town.id} town={town} />)}</div>
      </section>

      <section>
        <div className="mb-8 grid gap-3 sm:grid-cols-4">
          {[
            ["Today's handovers", bookings?.filter((item) => item.start_date === new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())).length ?? 0],
            ["Today's returns", bookings?.filter((item) => item.end_date === new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())).length ?? 0],
            ["Active rentals", bookings?.filter((item) => ["picked_up", "ready"].includes(item.status)).length ?? 0],
            ["Pending requests", bookings?.filter((item) => item.status === "pending").length ?? 0],
          ].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft"><strong className="font-display text-2xl">{value}</strong><span className="block text-xs text-ink-faint">{label}</span></div>)}
        </div>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Bookings</h2><Link href="/admin/bookings.csv" className="rounded-lg border border-hairline px-3 py-2 text-xs font-semibold">Export CSV</Link></div>
        <Form action="/admin" className="mb-4 grid gap-2 rounded-2xl border border-hairline bg-surface-raised p-3 sm:grid-cols-5">
          <input name="q" defaultValue={filters.q} placeholder="Reference, name, phone" className="rounded-lg border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm" />
          <select name="status" defaultValue={filters.status ?? ""} className="rounded-lg border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm"><option value="">Any status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="ready">Ready</option><option value="picked_up">Picked up</option><option value="returned">Returned</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
          <select name="town" defaultValue={filters.town ?? ""} className="rounded-lg border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm"><option value="">Any town</option>{towns?.map((town) => <option key={town.id} value={town.id}>{town.name}</option>)}</select>
          <input name="date" type="date" defaultValue={filters.date} className="rounded-lg border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm" />
          <button className="rounded-lg bg-[var(--color-brand-800)] px-3 py-2 text-sm font-semibold text-white">Filter</button>
        </Form>
        {!visibleBookings || visibleBookings.length === 0 ? (
          <p className="rounded-2xl border border-hairline bg-surface-raised p-6 text-sm text-ink-soft shadow-soft">
            No bookings yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {visibleBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--color-brand-600)]">{booking.reference}</p>
                  <p className="font-semibold">
                    {booking.customer_name} · {booking.customer_phone}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {booking.vehicles?.make} {booking.vehicles?.model} (
                    {booking.vehicles?.towns?.name}) · {booking.start_date} →{" "}
                    {booking.end_date}
                    {booking.fulfillment_method && (
                      <> · {booking.fulfillment_method === "doorstep_delivery" ? "Doorstep delivery" : "Location pickup"}</>
                    )}
                    {booking.estimated_total != null && (
                      <> · est. ₹{booking.estimated_total.toLocaleString("en-IN")}</>
                    )}
                  </p>
                  <span className="text-xs font-medium capitalize text-ink-faint">
                    {booking.status} · {booking.payment_status} · deposit {booking.deposit_status}
                  </span>
                  <BookingOperationsForm booking={booking} />
                </div>
                <BookingActions bookingId={booking.id} status={booking.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">Maintenance calendar</h2>
        <MaintenanceBlockForm vehicles={vehicles ?? []} />
        {(maintenanceBlocks?.length ?? 0) > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{maintenanceBlocks?.map((block) => <div key={block.id} className="rounded-xl border border-hairline bg-surface-raised p-3 text-sm"><strong>Blocked vehicle</strong><p className="text-ink-soft">{block.start_date} to {block.end_date} · {block.reason}</p></div>)}</div>}
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold">Reviews & testimonials</h2>
        <TestimonialForm towns={towns ?? []} />
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
                      <VehicleDetailsForm vehicle={vehicle} />
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
