import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function OwnerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("owner_id, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.owner_id && !profile?.is_admin) redirect("/");
  const ownerId = profile.owner_id;

  const vehiclesQuery = supabase
    .from("vehicles")
    .select("*, towns(name)")
    .order("created_at", { ascending: false });

  const { data: vehicles } = profile.is_admin
    ? await vehiclesQuery
    : await vehiclesQuery.eq("owner_id", ownerId as string);

  const vehicleIds = vehicles?.map((vehicle) => vehicle.id) ?? [];
  const { data: bookings } = vehicleIds.length > 0
    ? await supabase
        .from("bookings")
        .select("*, vehicles(make, model, towns(name))")
        .in("vehicle_id", vehicleIds)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const totalRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.estimated_total ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-600)]">Owner self-service</p>
      <h1 className="font-display text-3xl font-bold">Fleet owner dashboard</h1>
      <p className="mt-2 text-sm text-ink-soft">Track listed vehicles, bookings, and estimated earnings.</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft"><strong className="font-display text-2xl">{vehicles?.length ?? 0}</strong><span className="block text-xs text-ink-faint">Listed vehicles</span></div>
        <div className="rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft"><strong className="font-display text-2xl">{bookings?.length ?? 0}</strong><span className="block text-xs text-ink-faint">Recent bookings</span></div>
        <div className="rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft"><strong className="font-display text-2xl">₹{totalRevenue.toLocaleString("en-IN")}</strong><span className="block text-xs text-ink-faint">Recent gross value</span></div>
      </div>

      <section className="mt-10">
        <h2 className="font-display mb-4 text-lg font-semibold">Vehicles</h2>
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface-raised shadow-soft">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-hairline text-left"><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Town</th><th className="px-4 py-3">Price/day</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody>{vehicles?.map((vehicle) => <tr key={vehicle.id} className="border-b border-hairline last:border-0"><td className="px-4 py-3">{vehicle.make} {vehicle.model}</td><td className="px-4 py-3">{vehicle.towns?.name}</td><td className="px-4 py-3">₹{vehicle.price_per_day}</td><td className="px-4 py-3 capitalize">{vehicle.status}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display mb-4 text-lg font-semibold">Recent bookings</h2>
        <div className="grid gap-3">
          {bookings?.map((booking) => <div key={booking.id} className="rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft"><p className="text-xs font-semibold text-[var(--color-brand-600)]">{booking.reference}</p><p className="font-semibold">{booking.vehicles?.make} {booking.vehicles?.model} · {booking.customer_name}</p><p className="text-sm text-ink-soft">{booking.start_date} to {booking.end_date} · {booking.status} · ₹{Number(booking.estimated_total ?? 0).toLocaleString("en-IN")}</p></div>)}
        </div>
      </section>

      {profile.is_admin && <Link href="/admin" className="mt-8 inline-flex rounded-xl border border-hairline px-4 py-3 text-sm font-semibold">Open full admin</Link>}
    </div>
  );
}
