// Client-side mock repository. Your components import from here now.
// Later: swap imports to a Supabase-backed module (e.g. customers.server.ts).

import { CUSTOMERS } from "@/lib/dummy-customers";
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

export type CustomersPage = {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
};

function applyFilters(all: Customer[], q: CustomersQuery): Customer[] {
  const { q: text, onlyWithBalance, recency = "any" } = q;
  const t = (text ?? "").trim().toLowerCase();

  let rows = [...all];
  if (t) rows = rows.filter(r => [r.name, r.email ?? "", r.phone ?? ""].some(v => v.toLowerCase().includes(t)));
  if (onlyWithBalance) rows = rows.filter(r => r.balance > 0.001);
  if (recency !== "any") {
    const daysMax = recency === "30d" ? 30 : 90;
    rows = rows.filter(r => (Date.now() - new Date(r.lastVisit).getTime())/86400000 <= daysMax);
  }
  return rows;
}

function applySort(rows: Customer[], key: NonNullable<CustomersQuery["sortKey"]> = "lastVisit", dir: NonNullable<CustomersQuery["sortDir"]> = "desc") {
  const sorted = [...rows].sort((a,b) => key === "balance"
    ? a.balance - b.balance
    : new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime()
  );
  return dir === "asc" ? sorted : sorted.reverse();
}

export async function listCustomers(q: CustomersQuery): Promise<CustomersPage> {
  const all = (CUSTOMERS as unknown[]).map(c => customerSchema.parse(c)) as Customer[];
  const filtered = applyFilters(all, q);
  const sorted = applySort(filtered, q.sortKey ?? "lastVisit", q.sortDir ?? "desc");
  const page = q.page ?? 1, pageSize = q.pageSize ?? 25;
  const start = (page-1)*pageSize, end = start + pageSize;
  return { items: sorted.slice(start, end), total: sorted.length, page, pageSize };
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const all = (CUSTOMERS as unknown[]).map(c => customerSchema.parse(c)) as Customer[];
  return all.find(c => c.id === id) ?? null;
}

// Demo no-ops (so UI can call stable APIs today)
export async function updateCustomer(id: string, patch: Partial<Omit<Customer,"id">>) {
  return { ok: true as const };
}
export async function deleteCustomers(ids: string[]) {
  return { ok: true as const };
}
