// src/lib/data/customers.db.ts
import { createClient } from "@/utils/supabase/client";
import { customerSchema, type Customer } from "@/lib/types";

export type CustomersQuery = {
  q?: string;
  onlyWithBalance?: boolean;
  recency?: "any" | "30d" | "90d";
  page?: number;
  pageSize?: number;
  sortKey?: "lastVisit" | "balance";
  sortDir?: "asc" | "desc";
};

export type CustomersPage = { items: Customer[]; total: number };

function mapRow(row: any): Customer {
  // tolerate nulls and coerce to your zod type
  return customerSchema.parse({
    id: row.id,
    name: row.name,
    email: row.email ?? null,
    phone: row.phone ?? null,
    lastVisit: (row.last_visit ?? new Date().toISOString()),
    balance: Number(row.balance ?? 0),
  });
}

export async function listCustomers(q: CustomersQuery): Promise<CustomersPage> {
  const supabase = createClient();
  const page = q.page ?? 1;
  const pageSize = q.pageSize ?? 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // sort
  const sortCol = (q.sortKey ?? "lastVisit") === "balance" ? "balance" : "last_visit";
  const ascending = (q.sortDir ?? "desc") === "asc";

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order(sortCol, { ascending })
    .range(from, to);

  // filters
  if (q.q) {
    const like = `%${q.q}%`;
    query = query.or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
  }
  if (q.onlyWithBalance) {
    query = query.gt("balance", 0);
  }
  if (q.recency && q.recency !== "any") {
    const days = q.recency === "30d" ? 30 : 90;
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    query = query.gte("last_visit", since);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const items = (data ?? []).map(mapRow);
  return { items, total: count ?? items.length };
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
  if (error) return null;
  return mapRow(data);
}

export async function createCustomer(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  lastVisit?: string | null;
  balance?: number | null;
}) {
  const supabase = createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not signed in.");
  const payload = {
    user_id: user.id,     
    name: input.name,
    email: input.email ?? null,
    phone: input.phone ?? null,
    last_visit: input.lastVisit ?? new Date().toISOString(),
    balance: input.balance ?? 0,
  };
  const { data, error } = await supabase.from("customers").insert(payload).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateCustomer(id: string, patch: Partial<Omit<Customer, "id">>) {
  const supabase = createClient();
  const payload: any = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.email !== undefined) payload.email = patch.email;
  if (patch.phone !== undefined) payload.phone = patch.phone;
  if (patch.lastVisit !== undefined) payload.last_visit = patch.lastVisit;
  if (patch.balance !== undefined) payload.balance = patch.balance;

  const { data, error } = await supabase.from("customers").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteCustomers(ids: string[]) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").delete().in("id", ids);
  if (error) throw error;
  return { ok: true as const };
}
