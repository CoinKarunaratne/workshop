import { z } from "zod";

export const customerSchema = z.object({
  id: z.string(),                 // uuid
  name: z.string().min(1),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  lastVisit: z.string(),          // ISO date
  balance: z.number().nonnegative(),
});
export type Customer = z.infer<typeof customerSchema>;

export const vehicleSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  ownerName: z.string().min(1),   // 👈 new: matches VehicleForm
  rego: z.string().min(1),
  make: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  lastService: z.string().optional().nullable(), // ISO date
  mileage: z.string().optional().nullable(),
  wofExpiry: z.string().optional().nullable(),
  serviceDue: z.string().optional().nullable(),
});
export type Vehicle = z.infer<typeof vehicleSchema>;

// ===== Jobs =====
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
    id: z.string(),                 // uuid
    number: z.string(),             // display number e.g. J-1245
    rego: z.string(),
    customer: z.string(),
    status: jobStatusEnum,
    technician: z.string(),
    createdAt: z.string(),          // ISO
    updatedAt: z.string(),          // ISO
    amount: z.number(),             // dollars (for demo)
  });
  export type Job = z.infer<typeof jobSchema>;
  export type JobStatus = z.infer<typeof jobStatusEnum>;