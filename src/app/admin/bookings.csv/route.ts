import { createClient } from "@/lib/supabase/server";

function csv(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return new Response("Forbidden", { status: 403 });
  const { data } = await supabase.from("bookings").select("*, vehicles(make, model)").order("created_at", { ascending: false });
  const headings = ["Reference", "Customer", "Phone", "Vehicle", "Start", "Pickup time", "End", "Return time", "Handover", "Address", "Rental total", "Deposit", "Payment", "Deposit status", "Status"];
  const rows = (data ?? []).map((b) => [b.reference, b.customer_name, b.customer_phone, `${b.vehicles?.make ?? ""} ${b.vehicles?.model ?? ""}`, b.start_date, b.pickup_time, b.end_date, b.return_time, b.fulfillment_method, b.delivery_address, b.estimated_total, b.deposit_amount, b.payment_status, b.deposit_status, b.status]);
  const output = [headings, ...rows].map((row) => row.map(csv).join(",")).join("\n");
  return new Response(output, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ramesh-rentals-bookings.csv"`, "Cache-Control": "no-store" } });
}
