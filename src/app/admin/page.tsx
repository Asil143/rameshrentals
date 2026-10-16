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
import { formatRupees } from "@/lib/pricing";

const BOOKING_STATUSES: BookingStatus[] = ["pending", "confirmed", "ready", "picked_up", "returned", "completed", "cancelled"];

const TABS = [
  { id: "bookings", label: "Bookings" },
  { id: "fleet", label: "Fleet" },
  { id: "add-vehicle", label: "Add vehicle" },
  { id: "maintenance", label: "Maintenance" },
  { id: "reviews", label: "Reviews" },
  { id: "settings", label: "Town settings" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-[var(--color-accent-400)]/20 text-[var(--color-accent-600)]",
  confirmed: "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]",
  ready: "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-700)] dark:text-[var(--color-brand-400)]",
  picked_up: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  returned: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  completed: "bg-[var(--color-border)] text-ink-soft",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-300",
};

function formatDay(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(y, m - 1, d));
}

function isBookingStatus(value: string | undefined): value is BookingStatus {
  return BOOKING_STATUSES.some((status) => status === value);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; status?: string; q?: string; date?: string; town?: string }>;
}) {
  const filters = await searchParams;
  const tab: TabId = TABS.some((item) => item.id === filters.tab) ? (filters.tab as TabId) : "bookings";
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

  const [{ data: bookings }, { data: allBookings }, { data: vehicles }, { data: towns }, { data: maintenanceBlocks }] = await Promise.all([
    bookingsQuery,
    // Unfiltered, for the stat cards and tab badge.
    supabase.from("bookings").select("status, start_date, end_date"),
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

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const pendingCount = allBookings?.filter((item) => item.status === "pending").length ?? 0;
  const stats = [
    { label: "Pending requests", value: pendingCount, href: "/admin?status=pending", highlight: pendingCount > 0 },
    { label: "Today's handovers", value: allBookings?.filter((item) => item.start_date === today && item.status !== "cancelled").length ?? 0, href: `/admin?date=${today}` },
    { label: "Today's returns", value: allBookings?.filter((item) => item.end_date === today && item.status !== "cancelled").length ?? 0, href: `/admin?date=${today}` },
    { label: "Active rentals", value: allBookings?.filter((item) => ["picked_up", "ready"].includes(item.status)).length ?? 0, href: "/admin?status=picked_up" },
  ];
  const vehicleNames = new Map(vehicles?.map((vehicle) => [vehicle.id, `${vehicle.make} ${vehicle.model}`]) ?? []);
  const field = "rounded-lg border border-hairline bg-[var(--color-surface)] px-3 py-2 text-sm";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
            Dashboard
          </p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Admin</h1>
        </div>
        <Link href="/admin/bookings.csv" className="rounded-lg border border-hairline px-3 py-2 text-xs font-semibold">Export CSV</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-2xl border p-4 shadow-soft transition-colors hover:border-[var(--color-brand-500)]/50 ${
              stat.highlight ? "border-[var(--color-accent-400)]/60 bg-[var(--color-accent-400)]/10" : "border-hairline bg-surface-raised"
            }`}
          >
            <strong className="font-display text-2xl">{stat.value}</strong>
            <span className="block text-xs text-ink-faint">{stat.label}</span>
          </Link>
        ))}
      </div>

      <nav aria-label="Admin sections" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1 rounded-full border border-hairline bg-surface-raised p-1 shadow-soft">
          {TABS.map((item) => (
            <Link
              key={item.id}
              href={item.id === "bookings" ? "/admin" : `/admin?tab=${item.id}`}
              aria-current={tab === item.id ? "page" : undefined}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === item.id ? "bg-[var(--color-brand-600)] text-white" : "text-ink-soft hover:text-[var(--color-ink)]"
              }`}
            >
              {item.label}
              {item.id === "bookings" && pendingCount > 0 && (
                <span className={`rounded-full px-1.5 text-[11px] ${tab === item.id ? "bg-white/25" : "bg-[var(--color-accent-400)] text-[var(--color-brand-900)]"}`}>{pendingCount}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {tab === "bookings" && (
        <section>
          <Form action="/admin" className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-hairline bg-surface-raised p-3 sm:grid-cols-5">
            <input name="q" defaultValue={filters.q} placeholder="Reference, name, phone" className={`col-span-2 sm:col-span-1 ${field}`} />
            <select name="status" defaultValue={filters.status ?? ""} className={field}><option value="">Any status</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="ready">Ready</option><option value="picked_up">Picked up</option><option value="returned">Returned</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
            <select name="town" defaultValue={filters.town ?? ""} className={field}><option value="">Any town</option>{towns?.map((town) => <option key={town.id} value={town.id}>{town.name}</option>)}</select>
            <input name="date" type="date" defaultValue={filters.date} className={field} />
            <div className="flex gap-2">
              <button className="flex-1 rounded-lg bg-[var(--color-brand-800)] px-3 py-2 text-sm font-semibold text-white">Filter</button>
              {(filters.q || filters.status || filters.town || filters.date) && <Link href="/admin" className="rounded-lg border border-hairline px-3 py-2 text-sm font-semibold">Clear</Link>}
            </div>
          </Form>
          {!visibleBookings || visibleBookings.length === 0 ? (
            <p className="rounded-2xl border border-hairline bg-surface-raised p-6 text-sm text-ink-soft shadow-soft">
              {filters.q || filters.status || filters.town || filters.date ? "No bookings match these filters." : "No bookings yet."}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {visibleBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col-reverse gap-3 rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[booking.status]}`}>{booking.status.replaceAll("_", " ")}</span>
                      <span className="text-xs font-semibold text-[var(--color-brand-600)]">{booking.reference}</span>
                    </div>
                    <p className="mt-1.5 font-semibold">
                      {booking.customer_name} · <a href={`tel:+91${booking.customer_phone}`} className="hover:underline">{booking.customer_phone}</a>
                    </p>
                    <p className="text-sm text-ink-soft">
                      {booking.vehicles?.make} {booking.vehicles?.model} · {booking.vehicles?.towns?.name} · {formatDay(booking.start_date)} → {formatDay(booking.end_date)}
                      {" · "}{booking.fulfillment_method === "doorstep_delivery" ? "Doorstep delivery" : "Location pickup"}
                      {booking.estimated_total != null && <> · {formatRupees(booking.estimated_total)}</>}
                    </p>
                    <span className="text-xs font-medium capitalize text-ink-faint">
                      Payment {booking.payment_status.replaceAll("_", " ")} · deposit {booking.deposit_status.replaceAll("_", " ")}
                    </span>
                    {booking.customer_notes && <p className="mt-1 text-xs italic text-ink-soft">“{booking.customer_notes}”</p>}
                    <BookingOperationsForm booking={booking} />
                  </div>
                  <BookingActions bookingId={booking.id} status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "fleet" && (
        <section>
          {!vehicles || vehicles.length === 0 ? (
            <p className="rounded-2xl border border-hairline bg-surface-raised p-6 text-sm text-ink-soft shadow-soft">
              No vehicles yet. <Link href="/admin?tab=add-vehicle" className="font-semibold underline">Add one</Link>.
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
                    <tr key={vehicle.id} className="border-b border-hairline align-top last:border-0">
                      <td className="px-4 py-3">
                        <span className="font-semibold">{vehicle.make} {vehicle.model}</span>
                        <span className="ml-1.5 text-xs capitalize text-ink-faint">{vehicle.type} · {vehicle.registration_no}</span>
                        <VehicleDetailsForm vehicle={vehicle} />
                      </td>
                      <td className="px-4 py-3">{vehicle.towns?.name}</td>
                      <td className="px-4 py-3">{formatRupees(vehicle.price_per_day)}</td>
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
      )}

      {tab === "add-vehicle" && (
        <section>
          <AddVehicleForm towns={towns ?? []} />
        </section>
      )}

      {tab === "maintenance" && (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">Blocked dates can&apos;t be booked by customers.</p>
          <MaintenanceBlockForm vehicles={vehicles ?? []} />
          {(maintenanceBlocks?.length ?? 0) > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {maintenanceBlocks?.map((block) => (
                <div key={block.id} className="rounded-xl border border-hairline bg-surface-raised p-3 text-sm">
                  <strong>{vehicleNames.get(block.vehicle_id) ?? "Vehicle"}</strong>
                  <p className="text-ink-soft">{formatDay(block.start_date)} → {formatDay(block.end_date)} · {block.reason}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "reviews" && (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">Active reviews appear on the home page.</p>
          <TestimonialForm towns={towns ?? []} />
        </section>
      )}

      {tab === "settings" && (
        <section className="flex flex-col gap-5">
          <p className="text-sm text-ink-soft">Pickup location, delivery fees and opening hours for each town. Bookings must fall within opening hours.</p>
          {towns?.map((town) => (
            <div key={town.id}>
              <h2 className="font-display mb-2 font-semibold">{town.name}</h2>
              <TownOperationsForm town={town} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
