// src/lib/data/jobs.db.ts
import { createClient } from "@/utils/supabase/client";

/** What your UI can rely on coming back from the DB layer */
export type JobRecord = {
  id: string;
  customerId: string;
  vehicleId: string | null;
  title: string;
  description: string | null;
  status: "draft" | "booked" | "in_progress" | "completed" | string;
  startDate: string | null;       // ISO
  completedDate: string | null;   // ISO
  estimatedTotal: number | null;
  notes: string | null;

  // denormalized convenience fields (via select join)
  customerName?: string | null;
  vehicleRego?: string | null;
};

export type JobsQuery = {
  q?: string;                 // search in title/description/customer/rego
  status?: string;            // draft|booked|in_progress|completed
  dateFrom?: string;          // ISO (filters start_date >=)
  dateTo?: string;            // ISO (filters start_date <=)
  page?: number;
  pageSize?: number;
  sortKey?: "created_at" | "start_date" | "status" | "title";
  sortDir?: "asc" | "desc";
};

export type JobsPage = { items: JobRecord[]; total: number };

function mapRow(r: any): JobRecord {
  return {
    id: r.id,
    customerId: r.customer_id,
    vehicleId: r.vehicle_id ?? null,
    title: r.title,
    description: r.description ?? null,
    status: r.status ?? "draft",
    startDate: r.start_date ?? null,
    completedDate: r.completed_date ?? null,
    estimatedTotal: r.estimated_total === null || r.estimated_total === undefined ? null : Number(r.estimated_total),
    notes: r.notes ?? null,
    customerName: r.customers?.name ?? null,
    vehicleRego: r.vehicles?.rego ?? null,
  };
}

export async function listJobs(q: JobsQuery = {}): Promise<JobsPage> {
  const supabase = createClient();

  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const sortCol =
    q.sortKey === "start_date" ? "start_date" :
    q.sortKey === "status" ? "status" :
    q.sortKey === "title" ? "title" : "created_at";

  let query = supabase
    .from("jobs")
    // join names/rego for display
    .select("*, customers:customer_id(name), vehicles:vehicle_id(rego)", { count: "exact" })
    .order(sortCol, { ascending: (q.sortDir ?? "desc") === "asc" })
    .range(from, to);

  if (q.status && q.status !== "any") query = query.eq("status", q.status);
  if (q.dateFrom) query = query.gte("start_date", q.dateFrom);
  if (q.dateTo) query = query.lte("start_date", q.dateTo);

  if (q.q) {
    const like = `%${q.q}%`;
    // title/desc + joined fields (customers.name, vehicles.rego) via or()
    query = query.or(
      `title.ilike.${like},description.ilike.${like},customers.name.ilike.${like},vehicles.rego.ilike.${like}`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data ?? []).map(mapRow);
  return { items, total: count ?? items.length };
}

export async function getJob(id: string): Promise<JobRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, customers:customer_id(name), vehicles:vehicle_id(rego)")
    .eq("id", id)
    .single();
  if (error) return null;
  return mapRow(data);
}

export async function createJob(input: {
  customerId: string;
  vehicleId?: string | null;
  title: string;
  description?: string | null;
  status?: JobRecord["status"];
  startDate?: string | null;
  estimatedTotal?: number | null;
  notes?: string | null;
}) {
  const supabase = createClient();
  const payload: any = {
    customer_id: input.customerId,
    vehicle_id: input.vehicleId ?? null,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? "draft",
    start_date: input.startDate ?? null,
    estimated_total: input.estimatedTotal ?? null,
    notes: input.notes ?? null,
  };
  const { data, error } = await supabase
    .from("jobs")
    .insert(payload)
    .select("*, customers:customer_id(name), vehicles:vehicle_id(rego)")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateJob(id: string, patch: Partial<{
  customerId: string;
  vehicleId: string | null;
  title: string;
  description: string | null;
  status: JobRecord["status"];
  startDate: string | null;
  completedDate: string | null;
  estimatedTotal: number | null;
  notes: string | null;
}>) {
  const supabase = createClient();
  const p: any = {};
  if (patch.customerId !== undefined) p.customer_id = patch.customerId;
  if (patch.vehicleId !== undefined) p.vehicle_id = patch.vehicleId;
  if (patch.title !== undefined) p.title = patch.title;
  if (patch.description !== undefined) p.description = patch.description;
  if (patch.status !== undefined) p.status = patch.status;
  if (patch.startDate !== undefined) p.start_date = patch.startDate;
  if (patch.completedDate !== undefined) p.completed_date = patch.completedDate;
  if (patch.estimatedTotal !== undefined) p.estimated_total = patch.estimatedTotal;
  if (patch.notes !== undefined) p.notes = patch.notes;

  const { data, error } = await supabase
    .from("jobs")
    .update(p)
    .eq("id", id)
    .select("*, customers:customer_id(name), vehicles:vehicle_id(rego)")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteJobs(ids: string[]) {
  const supabase = createClient();
  const { error } = await supabase.from("jobs").delete().in("id", ids);
  if (error) throw error;
  return { ok: true as const };
}
