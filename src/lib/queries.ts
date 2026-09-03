import { createClient } from "@/lib/supabase/server";
import type { Vehicle, VehicleType } from "@/types/database";

export async function getTownBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("towns")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getVehiclesForTown(
  townId: string,
  type?: VehicleType
): Promise<Vehicle[]> {
  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("*")
    .eq("town_id", townId)
    .eq("status", "available")
    .order("price_per_day", { ascending: true });

  if (type) {
    query = query.eq("type", type);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).single();
  return data;
}

export async function getActiveTowns() {
  const supabase = await createClient();
  const { data } = await supabase.from("towns").select("*").eq("active", true);
  return data ?? [];
}

export async function getAllTowns() {
  const supabase = await createClient();
  const { data } = await supabase.from("towns").select("*").order("name");
  return data ?? [];
}

export async function getAllAvailableVehicleUrls() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("id, town:towns(slug)")
    .eq("status", "available");
  return data ?? [];
}
