// src/lib/types.ts
import { z } from "zod";

/** Common primitives */
export const id = z.string();                 // UUID/slug
export const isoDate = z.string();            // ISO 8601
export const money = z.number();              // dollars in UI (not cents)

/* -----------------------------------------------------------------------------
 * Customers
 * -------------------------------------------------------------------------- */
export const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  lastVisit: z.string(), // ISO format
  balance: z.number().nonnegative(),
});

export type Customer = z.infer<typeof customerSchema>;

/* -----------------------------------------------------------------------------
 * Vehicles
 * -------------------------------------------------------------------------- */
export const vehicleSchema = z.object({
  id,
  customerId: id,
  /** Owner name (shown/filled in the vehicle form); keeps FE+BE aligned */
  ownerName: z.string().min(1),
  rego: z.string().min(1),
  make: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  lastService: isoDate.optional().nullable(),
  mileage: z.string().optional().nullable(),
  wofExpiry: isoDate.optional().nullable(),
  serviceDue: isoDate.optional().nullable(),
});
export type Vehicle = z.infer<typeof vehicleSchema>;

/* -----------------------------------------------------------------------------
 * Jobs
 * -------------------------------------------------------------------------- */
export const jobStatusEnum = z.enum([
  "In Workshop",
  "Waiting Parts",
  "Waiting for Concent",
  "Completed",
  "Invoice Sent",
  "Payment completed",
  "Collected",
]);

export const jobSchema = z.object({
  id,
  number: z.string(),                 // e.g. J-1245
  rego: z.string(),
  customer: z.string(),               // display name (denormalized for list speed)
  status: jobStatusEnum,
  technician: z.string(),
  createdAt: isoDate,
  updatedAt: isoDate,
  amount: money,                      // demo UI amount
});
export type JobStatus = z.infer<typeof jobStatusEnum>;
export type Job = z.infer<typeof jobSchema>;

/* -----------------------------------------------------------------------------
 * Invoices
 * -------------------------------------------------------------------------- */
export const invoiceLineSchema = z.object({
  id,
  description: z.string(),
  quantity: z.number(),
  unitPrice: money,                   // ex GST sell price
  unitCost: money.optional(),         // buy cost (not printed)
  taxRate: z.number().optional(),     // line snapshot (e.g. 15)
  /** If present, use this instead of qty*unitPrice for the row total */
  overrideTotal: z.number().optional(),
  itemId: z.string().optional(),      // stock link (optional)
});
export type InvoiceLine = z.infer<typeof invoiceLineSchema>;

export const paymentStatusEnum = z.enum(["Paid", "Unpaid"]);

export const invoiceSchema = z.object({
  id,
  jobId: id,
  customerId: id.optional(),
  invoiceNumber: z.string().min(1),
  date: z.string(),                   // YYYY-MM-DD
  mileage: z.string().optional(),
  rego: z.string(),
  notesTop: z.string().optional(),
  notesBottom: z.string().optional(),

  /** Charges */
  gstEnabled: z.boolean().default(true),
  bankChargeEnabled: z.boolean().default(false),
  bankCharge: money.optional(),       // computed (2% of subtotal+GST) when enabled

  /** Lines & totals */
  lines: z.array(invoiceLineSchema),
  subtotal: money,                    // ex GST
  taxTotal: money,                    // GST amount
  /** grandTotal = subtotal + taxTotal + (bankChargeEnabled ? bankCharge : 0) */
  grandTotal: money,

  /** Optional payment state (used by Invoices list filters/actions) */
  paymentStatus: paymentStatusEnum.optional(),

  createdAt: isoDate,
  updatedAt: isoDate,
});
export type Invoice = z.infer<typeof invoiceSchema>;

/* -----------------------------------------------------------------------------
 * Quotations
 * -------------------------------------------------------------------------- */
export const quotationLineSchema = z.object({
  id,
  description: z.string(),
  quantity: z.number(),
  unitPrice: money,
  unitCost: money.optional(),
  overrideTotal: z.number().optional(),
});
export type QuotationLine = z.infer<typeof quotationLineSchema>;

export const quotationSchema = z.object({
  id,
  quotationNumber: z.string().min(1),
  customerId: id.optional(),
  vehicleId: id.optional(),
  jobId: id.optional(),

  date: z.string(),                   // YYYY-MM-DD
  notesTop: z.string().optional(),

  /** Toggles mirror invoice editor (so UX matches) */
  gstEnabled: z.boolean().default(true),
  bankChargeEnabled: z.boolean().default(false),

  lines: z.array(quotationLineSchema),

  /** Totals kept on the record for list performance + history */
  subtotal: money,                    // ex GST
  gstTotal: money,                    // GST amount
  bankCharge: money,                  // 2% when enabled
  total: money,                       // subtotal + gstTotal + bankCharge

  /** Estimation excludes GST & bank charges */
  estimatedProfit: money,

  /** For list filter: whether this quote converted into a job */
  gotJob: z.boolean().default(false),

  createdAt: isoDate,
  updatedAt: isoDate,
});
export type Quotation = z.infer<typeof quotationSchema>;

/* -----------------------------------------------------------------------------
 * Module exports helper bundle (optional)
 * -------------------------------------------------------------------------- */
export const schemas = {
  customer: customerSchema,
  vehicle: vehicleSchema,
  job: jobSchema,
  invoice: invoiceSchema,
  invoiceLine: invoiceLineSchema,
  quotation: quotationSchema,
  quotationLine: quotationLineSchema,
};

// --- Expenses ---

export const expenseTypeEnum = z.enum([
  "Internet & Telephone",
  "Marketing & Web design",
  "Uniforms",
  "Parts",
  "Small Asset Purchase",
  "Consumables & Cleaning Materials",
  "Accessories",
  "Postage & Freights",
  "Fuel & Travel",
  "Workshop miscellaneous",
  "Other",
]);

export const expenseSchema = z.object({
  id: z.string(),              // uuid
  description: z.string().min(1),
  amount: z.number().nonnegative(),
  type: expenseTypeEnum,
  date: z.string(),            // YYYY-MM-DD
  createdAt: z.string(),       // ISO
  updatedAt: z.string(),       // ISO
});

export type ExpenseType = z.infer<typeof expenseTypeEnum>;
export type Expense = z.infer<typeof expenseSchema>;

export type UserProfile = {
  id: string;         // auth user id
  username: string;
  fullName: string;
  email: string;      // primary auth email (immutable in regular edit)
  phone?: string;
  mobile?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  // When changing email with Supabase, we can use this to show pending state
  pendingEmail?: string;
};
