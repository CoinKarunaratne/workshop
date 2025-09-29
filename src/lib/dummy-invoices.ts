import { nanoid } from "nanoid";

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;   // ex GST
  unitCost?: number;   // optional, not shown in PDF/print
  taxRate?: number;    // line snapshot, e.g. 15
  itemId?: string;     // link back to stock
  /** If set, this replaces (quantity * unitPrice) for this row */
  overrideTotal?: number;
};

export type Invoice = {
  id: string;
  jobId: string;
  customerId?: string;
  invoiceNumber: string;   // REQUIRED & editable
  date: string;            // YYYY-MM-DD
  mileage?: string;
  rego: string;

  notesTop?: string;
  notesBottom?: string;

  gstEnabled: boolean;

  /** Bank charge toggle + value (persisted for print/export) */
  bankChargeEnabled?: boolean;
  bankCharge?: number;     // 2% of (subtotal + GST) when enabled

  /** Payment status for list page/filtering */
  paymentStatus?: "Paid" | "Unpaid";

  lines: InvoiceLine[];
  subtotal: number;        // sum of line nets (ex GST)
  taxTotal: number;        // GST amount when gstEnabled
  total: number;           // subtotal + taxTotal (base total)
  /** Grand total includes bankCharge when enabled */
  grandTotal: number;

  createdAt: string;
  updatedAt: string;
};

export const INVOICES: Invoice[] = [];

export function createEmptyLine(): InvoiceLine {
  return {
    id: nanoid(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    unitCost: 0,
  };
}

function lineNet(l: InvoiceLine) {
  const qty   = Number(l.quantity)  || 0;
  const price = Number(l.unitPrice) || 0;
  return typeof l.overrideTotal === "number" ? Number(l.overrideTotal) : qty * price;
}

/** Subtotal (ex GST), GST component (if gstOn), base total (subtotal + GST). */
export function calcTotals(lines: InvoiceLine[], gstOn: boolean) {
  let subtotal = 0;
  let taxTotal = 0;
  for (const l of lines) {
    const net  = lineNet(l);
    const rate = ((typeof l.taxRate === "number" ? l.taxRate : 15) / 100) * (gstOn ? 1 : 0);
    subtotal += net;
    taxTotal += net * rate;
  }
  return { subtotal, taxTotal, total: subtotal + taxTotal };
}

/** 2% bank charge applied to (subtotal + GST) when enabled */
export function calcBankCharge(baseTotal: number, enabled: boolean) {
  if (!enabled) return 0;
  return Number((baseTotal * 0.02).toFixed(2));
}

/** Cost & profit (profit excludes GST & bank fee) */
export function calcCostsAndProfit(lines: InvoiceLine[]) {
  let costTotal = 0;
  let revenueTotal = 0;
  for (const l of lines) {
    const qty   = Number(l.quantity)  || 0;
    const cost  = (Number(l.unitCost) || 0) * qty;
    const rev   = typeof l.overrideTotal === "number"
      ? Number(l.overrideTotal)
      : (Number(l.unitPrice) || 0) * qty;

    costTotal += cost;
    revenueTotal += rev;
  }
  const profit = revenueTotal - costTotal;
  return {
    costTotal: Number(costTotal.toFixed(2)),
    profit: Number(profit.toFixed(2)),
  };
}

export function newInvoiceNumber(next = INVOICES.length + 1) {
  return `INV-${String(next).padStart(5, "0")}`;
}

export function upsertInvoice(inv: Invoice) {
  const i = INVOICES.findIndex(x => x.id === inv.id);
  if (i === -1) INVOICES.push(inv);
  else INVOICES[i] = inv;
}

export function getInvoiceByJob(jobId: string) {
  return INVOICES.find(q => q.jobId === jobId) || null;
}

/**
 * DEMO SEEDER
 * Lazily imports JOBS & CUSTOMERS, and seeds a few invoices if none exist (or force).
 * Keeps everything front-end only and avoids circular imports at module init time.
 */
export async function seedDemoInvoices(opts?: { force?: boolean; count?: number }) {
  const force = !!opts?.force;
  const take = Math.max(1, Math.min(opts?.count ?? 3, 8)); // seed up to 8

  if (!force && INVOICES.length > 0) return INVOICES;

  // Clear existing when force
  if (force) INVOICES.splice(0, INVOICES.length);

  const { JOBS } = await import("@/lib/dummy-jobs");
  const { CUSTOMERS } = await import("@/lib/dummy-customers");

  const today = new Date();
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);

  for (const j of JOBS.slice(0, take)) {
    // make 1–2 simple lines
    const lines: InvoiceLine[] = [
      { id: nanoid(), description: "Labour", quantity: 1, unitPrice: 120, unitCost: 0, taxRate: 15 },
      { id: nanoid(), description: "Oil & filter", quantity: 1, unitPrice: 45, unitCost: 25, taxRate: 15 },
    ];

    const gstOn = true;
    const { subtotal, taxTotal, total } = calcTotals(lines, gstOn);

    const bankChargeEnabled = Math.random() > 0.5;
    const bankCharge = calcBankCharge(total, bankChargeEnabled);
    const grandTotal = Number((total + bankCharge).toFixed(2));

    const customer = CUSTOMERS.find(
      (c) => c.name.trim().toLowerCase() === j.customer.trim().toLowerCase()
    );

    const inv: Invoice = {
      id: nanoid(),
      jobId: j.id,
      customerId: customer?.id,
      invoiceNumber: newInvoiceNumber(INVOICES.length + 1),
      date: toISODate(today),
      rego: j.rego,
      gstEnabled: gstOn,
      bankChargeEnabled,
      bankCharge,
      lines,
      subtotal: Number(subtotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      total: Number(total.toFixed(2)),
      grandTotal,
      paymentStatus: j.status === "Payment completed" ? "Paid" : "Unpaid",
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
    };

    INVOICES.push(inv);
  }

  return INVOICES;
}
