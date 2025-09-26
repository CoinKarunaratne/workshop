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
  mileage?: string;        // free text for now
  rego: string;

  notesTop?: string;       // appears above items
  notesBottom?: string;    // footer note
  gstEnabled: boolean;

  lines: InvoiceLine[];
  subtotal: number;
  taxTotal: number;
  total: number;

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
    // overrideTotal: undefined // (optional)
  };
}

function lineNet(l: InvoiceLine) {
  const qty   = Number(l.quantity)  || 0;
  const price = Number(l.unitPrice) || 0;
  // if user overrode, trust that; otherwise qty * price
  return typeof l.overrideTotal === "number" ? Number(l.overrideTotal) : qty * price;
}

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
