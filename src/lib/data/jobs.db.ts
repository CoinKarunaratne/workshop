// src/lib/data/jobs.db.ts
import { createClient } from "@/utils/supabase/client";

/** What your UI can rely on coming back from the DB layer */
export type JobRecord = {
  id: string;

  // 👇 NEW: human Job No. (nullable if you haven't backfilled old rows)
  jobNumber: string | null;

  customerId: string;
  vehicleId: string | null;
  title: string;
  description: string | null;

  // keep wide union so existing UI compiles; default now "in_workshop"
  status: "in_workshop" | "waiting_parts" | "waiting_concent" | "completed" | "invoice_sent" | "payment_completed" | "collected" | string;

  // Single date the UI edits (we still expose completedDate for legacy)
  startDate: string | null;       // ISO
  completedDate: string | null;   // ISO

  // kept for compatibility with older rows; not used by new UI
  estimatedTotal: number | null;

  notes: string | null;

  // denormalized convenience fields (via select join)
  customerName?: string | null;
  vehicleRego?: string | null;
};

export type JobsQuery = {
  q?: string;                 // search in title/description/customer/rego
  status?: string;            // e.g. in_workshop|completed|...
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
    jobNumber: r.job_number ?? null, // 👈 NEW
    customerId: r.customer_id,
    vehicleId: r.vehicle_id ?? null,
    title: r.title,
    description: r.description ?? null,
    status: r.status ?? "in_workshop",
    startDate: r.start_date ?? null,
    completedDate: r.completed_date ?? null,
    estimatedTotal:
      r.estimated_total === null || r.estimated_total === undefined
        ? null
        : Number(r.estimated_total),
    notes: r.notes ?? null,
    customerName: r.customers?.name ?? null,
    vehicleRego: r.vehicles?.rego ?? null,
  };
}

/** Check if a Job No. is available (case-insensitive). Optionally exclude a job id. */
export async function isJobNumberAvailable(jobNumber: string, excludeId?: string) {
  const supabase = createClient();
  let q = supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .ilike("job_number", jobNumber);

  if (excludeId) q = q.neq("id", excludeId);

  const { count, error } = await q;
  if (error) throw error;
  return (count ?? 0) === 0;
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
    // include job_number and joined fields
    .select(
      "id, job_number, customer_id, vehicle_id, title, description, status, start_date, completed_date, estimated_total, notes, customers:customer_id(name), vehicles:vehicle_id(rego)",
      { count: "exact" }
    )
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
    .select(
      "id, job_number, customer_id, vehicle_id, title, description, status, start_date, completed_date, estimated_total, notes, customers:customer_id(name), vehicles:vehicle_id(rego)"
    )
    .eq("id", id)
    .single();
  if (error) return null;
  return mapRow(data);
}

/** Create job. `jobNumber` is optional but recommended; single date is `startDate`. */
export async function createJob(input: {
  jobNumber?: string | null;
  customerId: string;
  vehicleId?: string | null;
  title: string;
  description?: string | null;
  status?: JobRecord["status"];
  startDate?: string | null; // single date your UI edits
  notes?: string | null;
}) {
  const supabase = createClient();

  if (input.jobNumber && input.jobNumber.trim()) {
    const ok = await isJobNumberAvailable(input.jobNumber.trim());
    if (!ok) throw new Error("Job number already exists");
  }

  const payload: any = {
    job_number: input.jobNumber ?? null,
    customer_id: input.customerId,
    vehicle_id: input.vehicleId ?? null,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? "in_workshop",
    start_date: input.startDate ?? null,
    // estimated_total intentionally omitted (UI no longer uses it)
    notes: input.notes ?? null,
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(payload)
    .select(
      "id, job_number, customer_id, vehicle_id, title, description, status, start_date, completed_date, estimated_total, notes, customers:customer_id(name), vehicles:vehicle_id(rego)"
    )
    .single();

  if (error) {
    // Surface unique violation as friendly message
    if ((error as any).code === "23505") throw new Error("Job number already exists");
    throw error;
  }
  return mapRow(data);
}

/** Update job. You can change `jobNumber`; we enforce uniqueness. */
export async function updateJob(id: string, patch: Partial<{
  jobNumber: string | null;
  customerId: string;
  vehicleId: string | null;
  title: string;
  description: string | null;
  status: JobRecord["status"];
  startDate: string | null;       // single date
  completedDate: string | null;   // kept for compatibility
  notes: string | null;
}>) {
  const supabase = createClient();

  if (patch.jobNumber && patch.jobNumber.trim()) {
    const ok = await isJobNumberAvailable(patch.jobNumber.trim(), id);
    if (!ok) throw new Error("Job number already exists");
  }

  const p: any = {};
  if (patch.jobNumber !== undefined) p.job_number = patch.jobNumber;
  if (patch.customerId !== undefined) p.customer_id = patch.customerId;
  if (patch.vehicleId !== undefined) p.vehicle_id = patch.vehicleId;
  if (patch.title !== undefined) p.title = patch.title;
  if (patch.description !== undefined) p.description = patch.description;
  if (patch.status !== undefined) p.status = patch.status;
  if (patch.startDate !== undefined) p.start_date = patch.startDate;
  if (patch.completedDate !== undefined) p.completed_date = patch.completedDate;
  if (patch.notes !== undefined) p.notes = patch.notes;

  const { data, error } = await supabase
    .from("jobs")
    .update(p)
    .eq("id", id)
    .select(
      "id, job_number, customer_id, vehicle_id, title, description, status, start_date, completed_date, estimated_total, notes, customers:customer_id(name), vehicles:vehicle_id(rego)"
    )
    .single();

  if (error) {
    if ((error as any).code === "23505") throw new Error("Job number already exists");
    throw error;
  }
  return mapRow(data);
}

export async function deleteJobs(ids: string[]) {
  const supabase = createClient();
  const { error } = await supabase.from("jobs").delete().in("id", ids);
  if (error) throw error;
  return { ok: true as const };
}
