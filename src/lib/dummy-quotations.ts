// src/lib/dummy-quotations.ts
import { nanoid } from "nanoid";

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export type QuotationLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  itemId?: string;    // linked stock item
  taxRate?: number;   // per-line tax snapshot (percent)
  unitCost?: number;  // 👈 NEW: buy price (cost) per unit
};


  export type Quotation = {
    id: string;
    jobId: string;
    customerId?: string;
    number: string;
    status: QuoteStatus;
    date: string;
    lines: QuotationLine[];
    subtotal: number;
    taxTotal: number;
    total: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  
    // 👇 NEW: persist whether GST is applied for this quotation
    gstEnabled?: boolean; // default true
  };
  

// In-memory store (MVP)
export const QUOTATIONS: Quotation[] = [];

// Helpers (MVP — replace with Supabase later)
export function calcTotals(lines: QuotationLine[], taxRate = 0.15) {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const taxTotal = Math.max(0, subtotal * taxRate);
  const total = subtotal + taxTotal;
  return { subtotal, taxTotal, total };
}

export function newQuoteNumber(next = QUOTATIONS.length + 1) {
  return `Q-${String(next).padStart(4, "0")}`;
}

export function createEmptyLine(): QuotationLine {
  return { id: nanoid(), description: "", quantity: 1, unitPrice: 0 };
}

export function upsertQuotation(q: Quotation) {
  const i = QUOTATIONS.findIndex((x) => x.id === q.id);
  if (i === -1) QUOTATIONS.push(q);
  else QUOTATIONS[i] = q;
}

export function getQuotationByJob(jobId: string) {
  return QUOTATIONS.find((q) => q.jobId === jobId);
}
