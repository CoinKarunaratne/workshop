import { nanoid } from "nanoid";

export type QuotationLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitCost?: number;
  overrideTotal?: number;
};

export type Quotation = {
  id: string;
  quotationNumber: string;

  customerId?: string;
  vehicleId?: string;
  jobId?: string;

  // ✅ Snapshots so we can still prefill even if no linked entities exist
  snapshotCustomerName?: string;
  snapshotRego?: string;

  date: string;
  notesTop?: string;

  gstEnabled: boolean;
  bankChargeEnabled: boolean;

  lines: QuotationLine[];
  subtotal: number;
  gstTotal: number;
  bankCharge: number;
  total: number;

  estimatedProfit: number;

  gotJob: boolean;

  createdAt: string;
  updatedAt: string;
};

export const QUOTATIONS: Quotation[] = [];

export function createEmptyQuotationLine(): QuotationLine {
  return { id: nanoid(), description: "", quantity: 1, unitPrice: 0, unitCost: 0 };
}

function lineNet(l: QuotationLine) {
  const qty = Number(l.quantity) || 0;
  const price = Number(l.unitPrice) || 0;
  return typeof l.overrideTotal === "number" ? l.overrideTotal : qty * price;
}

export function calcQuotationTotals(lines: QuotationLine[], gstOn: boolean, bankChargeOn: boolean) {
  let subtotal = 0;
  let gstTotal = 0;
  for (const l of lines) {
    const net = lineNet(l);
    subtotal += net;
    if (gstOn) gstTotal += net * 0.15;
  }
  const baseTotal = subtotal + gstTotal;
  const bankCharge = bankChargeOn ? Number((baseTotal * 0.02).toFixed(2)) : 0;
  const total = baseTotal + bankCharge;

  // profit (estimation, excludes GST + bank charges)
  let costTotal = 0;
  for (const l of lines) {
    const qty = Number(l.quantity) || 0;
    costTotal += (Number(l.unitCost) || 0) * qty;
  }
  const estimatedProfit = subtotal - costTotal;

  return { subtotal, gstTotal, bankCharge, total, estimatedProfit };
}

export function newQuotationNumber(next = QUOTATIONS.length + 1) {
  return `QTN-${String(next).padStart(5, "0")}`;
}

export function upsertQuotation(q: Quotation) {
  const i = QUOTATIONS.findIndex((x) => x.id === q.id);
  if (i === -1) QUOTATIONS.push(q);
  else QUOTATIONS[i] = q;
}

export function getQuotationById(id: string) {
  return QUOTATIONS.find((q) => q.id === id) || null;
}

// ✅ Link quotation → job (used after creating a job from a quotation)
export function linkQuotationToJob(quotationId: string, jobId: string) {
  const q = QUOTATIONS.find((x) => x.id === quotationId);
  if (!q) return;
  q.jobId = jobId;
  q.gotJob = true;
  q.updatedAt = new Date().toISOString();
}
