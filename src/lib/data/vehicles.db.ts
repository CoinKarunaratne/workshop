// src/lib/data/vehicles.db.ts
import { createClient } from "@/utils/supabase/client";
import { vehicleSchema, type Vehicle } from "@/lib/types";

/** Map DB row -> UI type */
function mapRow(row: any): Vehicle {
  return vehicleSchema.parse({
    id: row.id,
    customerId: row.customer_id,
    ownerName: row.owner_name ?? "",
    rego: row.rego,
    make: row.make ?? null,
    model: row.model ?? null,
    year: row.year ?? null,
    lastService: row.last_service ?? null,
    mileage: row.mileage ?? null,
    wofExpiry: row.wof_expiry ?? null,
    serviceDue: row.service_due ?? null,
  });
}

export type VehiclesQuery = {
  q?: string;                 // filter by rego/make/model
  customerId?: string;        // filter for a single customer
  page?: number;
  pageSize?: number;
  sortKey?: "rego" | "make" | "model" | "year" | "lastService";
  sortDir?: "asc" | "desc";
};

export type VehiclesPage = { items: Vehicle[]; total: number };

export async function listVehicles(q: VehiclesQuery = {}): Promise<VehiclesPage> {
  const supabase = createClient();

  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let sortCol = "last_service";
  if (q.sortKey === "rego") sortCol = "rego";
  if (q.sortKey === "make") sortCol = "make";
  if (q.sortKey === "model") sortCol = "model";
  if (q.sortKey === "year") sortCol = "year";

  let query = supabase
    .from("vehicles")
    .select("*", { count: "exact" })
    .order(sortCol, { ascending: (q.sortDir ?? "desc") === "asc" })
    .range(from, to);

  if (q.customerId) {
    query = query.eq("customer_id", q.customerId);
  }
  if (q.q) {
    const like = `%${q.q}%`;
    query = query.or(`rego.ilike.${like},make.ilike.${like},model.ilike.${like},year.ilike.${like}`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data ?? []).map(mapRow);
  return { items, total: count ?? items.length };
}

export async function listVehiclesByCustomer(customerId: string): Promise<Vehicle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("customer_id", customerId)
    .order("last_service", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("vehicles").select("*").eq("id", id).single();
  if (error) return null;
  return mapRow(data);
}

export async function createVehicle(input: {
  customerId: string;
  ownerName?: string;
  rego: string;
  make?: string | null;
  model?: string | null;
  year?: string | null;
  lastService?: string | null;
  mileage?: string | null;
  wofExpiry?: string | null;
  serviceDue?: string | null;
}) {
  const supabase = createClient();
  const payload = {
    customer_id: input.customerId,
    owner_name: input.ownerName ?? null,
    rego: input.rego,
    make: input.make ?? null,
    model: input.model ?? null,
    year: input.year ?? null,
    last_service: input.lastService ?? null,
    mileage: input.mileage ?? null,
    wof_expiry: input.wofExpiry ?? null,
    service_due: input.serviceDue ?? null,
  };
  const { data, error } = await supabase.from("vehicles").insert(payload).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateVehicle(id: string, patch: Partial<{
  ownerName: string;
  rego: string;
  make: string | null;
  model: string | null;
  year: string | null;
  lastService: string | null;
  mileage: string | null;
  wofExpiry: string | null;
  serviceDue: string | null;
}>) {
  const supabase = createClient();
  const payload: any = {};
  if (patch.ownerName !== undefined) payload.owner_name = patch.ownerName;
  if (patch.rego !== undefined) payload.rego = patch.rego;
  if (patch.make !== undefined) payload.make = patch.make;
  if (patch.model !== undefined) payload.model = patch.model;
  if (patch.year !== undefined) payload.year = patch.year;
  if (patch.lastService !== undefined) payload.last_service = patch.lastService;
  if (patch.mileage !== undefined) payload.mileage = patch.mileage;
  if (patch.wofExpiry !== undefined) payload.wof_expiry = patch.wofExpiry;
  if (patch.serviceDue !== undefined) payload.service_due = patch.serviceDue;

  const { data, error } = await supabase.from("vehicles").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteVehicles(ids: string[]) {
  const supabase = createClient();
  const { error } = await supabase.from("vehicles").delete().in("id", ids);
  if (error) throw error;
  return { ok: true as const };
}
