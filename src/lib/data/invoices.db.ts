// src/lib/data/invoices.db.ts
import { createClient } from "@/utils/supabase/client";
import type { Invoice, InvoiceLine } from "@/lib/dummy-invoices";

/** Row shape from `public.invoices` (Supabase/Postgres). */
type InvoiceRowDb = {
  id: string;
  user_id?: string;
  job_id: string;
  customer_id: string | null;
  invoice_number: string;
  invoice_date: string;
  mileage: string | null;
  rego: string | null;
  notes_top: string | null;
  notes_bottom: string | null;
  gst_enabled: boolean | null;
  bank_charge_enabled: boolean | null;
  bank_charge: number | string | null;
  payment_status: string | null;
  lines: unknown;
  subtotal: number | string;
  tax_total: number | string;
  total: number | string;
  grand_total: number | string;
  created_at: string;
  updated_at: string;
};

function asPaymentStatus(value: string | null): "Paid" | "Unpaid" | undefined {
  return value === "Paid" || value === "Unpaid" ? value : undefined;
}

function mapRow(row: InvoiceRowDb): Invoice {
  const rawLines = row.lines;
  const lines: InvoiceLine[] = Array.isArray(rawLines)
    ? rawLines
    : typeof rawLines === "string"
      ? (JSON.parse(rawLines || "[]") as InvoiceLine[])
      : [];

  return {
    id: row.id,
    jobId: row.job_id,
    customerId: row.customer_id ?? undefined,
    invoiceNumber: row.invoice_number,
    date:
      typeof row.invoice_date === "string"
        ? row.invoice_date.slice(0, 10)
        : row.invoice_date,
    mileage: row.mileage ?? undefined,
    rego: row.rego ?? "",
    notesTop: row.notes_top ?? undefined,
    notesBottom: row.notes_bottom ?? undefined,
    gstEnabled: row.gst_enabled ?? true,
    bankChargeEnabled: row.bank_charge_enabled ?? false,
    bankCharge:
      row.bank_charge === null || row.bank_charge === undefined
        ? undefined
        : Number(row.bank_charge),
    paymentStatus: asPaymentStatus(row.payment_status),
    lines,
    subtotal: Number(row.subtotal),
    taxTotal: Number(row.tax_total),
    total: Number(row.total),
    grandTotal: Number(row.grand_total),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPayload(inv: Invoice, userId: string) {
  return {
    id: inv.id,
    user_id: userId,
    job_id: inv.jobId,
    customer_id: inv.customerId ?? null,
    invoice_number: inv.invoiceNumber.trim(),
    invoice_date: inv.date,
    mileage: inv.mileage?.trim() || null,
    rego: inv.rego ?? "",
    notes_top: inv.notesTop ?? null,
    notes_bottom: inv.notesBottom ?? null,
    gst_enabled: inv.gstEnabled,
    bank_charge_enabled: !!inv.bankChargeEnabled,
    bank_charge: inv.bankCharge ?? null,
    payment_status: inv.paymentStatus ?? null,
    lines: inv.lines as unknown as Record<string, unknown>[],
    subtotal: inv.subtotal,
    tax_total: inv.taxTotal,
    total: inv.total,
    grand_total: inv.grandTotal,
  };
}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Not signed in.");
  return { supabase, user };
}

export async function getInvoiceByJob(jobId: string): Promise<Invoice | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("job_id", jobId)
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  return mapRow(data as InvoiceRowDb);
}

/** Next display number like INV-00001 (based on how many invoices the user already has). */
export async function getNextInvoiceNumber(): Promise<string> {
  const { supabase, user } = await requireUser();
  const { count, error } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (error) throw error;
  const next = (count ?? 0) + 1;
  return `INV-${String(next).padStart(5, "0")}`;
}

export type InvoiceEnriched = Invoice & { customerName: string };

export async function listInvoices(): Promise<Invoice[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("invoice_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as InvoiceRowDb));
}

type InvoiceRowWithCustomer = InvoiceRowDb & {
  customers?: { name?: string | null } | null;
};

export async function listInvoicesEnriched(): Promise<InvoiceEnriched[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, customers:customer_id(name)")
    .order("invoice_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as InvoiceRowWithCustomer;
    const { customers, ...rest } = row;
    return {
      ...mapRow(rest as InvoiceRowDb),
      customerName: customers?.name ?? "—",
    };
  });
}

export async function saveInvoice(inv: Invoice): Promise<Invoice> {
  const { supabase, user } = await requireUser();
  const payload = toPayload(inv, user.id);

  const existing = await getInvoiceByJob(inv.jobId);
  if (existing) {
    const { id: omitId, user_id: omitUserId, ...updateBody } = payload;
    void omitId;
    void omitUserId;
    const { data, error } = await supabase
      .from("invoices")
      .update(updateBody)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapRow(data as InvoiceRowDb);
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as InvoiceRowDb);
}

export async function deleteInvoice(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
  return { ok: true as const };
}

export async function deleteInvoices(ids: string[]) {
  const { supabase } = await requireUser();
  if (ids.length === 0) return { ok: true as const };
  const { error } = await supabase.from("invoices").delete().in("id", ids);
  if (error) throw error;
  return { ok: true as const };
}

export async function updateInvoicePaymentStatus(
  id: string,
  status: "Paid" | "Unpaid"
) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("invoices")
    .update({ payment_status: status })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data as InvoiceRowDb);
}
