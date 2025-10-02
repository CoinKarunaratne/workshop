// src/lib/dummy-settings.ts
import { z } from "zod";

export const personalDetailsSchema = z.object({
  id: z.string(),           // auth user id (or local id)
  username: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  // bookkeeping
  updatedAt: z.string(),    // ISO
  createdAt: z.string(),    // ISO
});
export type PersonalDetails = z.infer<typeof personalDetailsSchema>;

// ---- Demo store (1 user) ----
let CURRENT_USER: PersonalDetails = {
  id: "usr_demo_1",
  username: "david",
  fullName: "David",
  email: "davidfreg@gmail.com",
  mobile: "",
  address: "",
  avatarUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function getPersonalDetails(): PersonalDetails {
  return { ...CURRENT_USER };
}

export function updatePersonalDetails(patch: Partial<PersonalDetails>): PersonalDetails {
  const next: PersonalDetails = {
    ...CURRENT_USER,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  // validate in one place
  personalDetailsSchema.parse(next);
  CURRENT_USER = next;
  return { ...CURRENT_USER };
}

// In-memory demo store for Settings (mirrors how we did other dummy libs)

export type ContactMethod = "email" | "sms";

export type WorkshopSettings = {
  id: string;               // workspace id (single-tenant demo: "default")
  // --- Logo ---
  logoUrl?: string;         // for prod: Supabase public/signed URL
  logoDataUrl?: string;     // demo preview only (do not persist in prod)

  // --- Workshop Info ---
  name: string;
  gstRegNo?: string;
  licenceDetails?: string;
  wofOrgNo?: string;

  // --- Notifications ---
  registeredForGst: boolean;          // keep this (not "prices include GST")
  sendBookingReminder: boolean;
  sendBookingConfirmation: boolean;
  bookingReminderBy: ContactMethod;   // "email" | "sms"
  firstReminderDays?: number;         // before booking date
  secondReminderDays?: number;        // optional

  // --- Data export ---
  exportEmail?: string;

  // system
  updatedAt: string;
};

export const WORKSHOP: WorkshopSettings = {
  id: "default",
  name: "Your Workshop",
  gstRegNo: "",
  licenceDetails: "",
  wofOrgNo: "",
  registeredForGst: true,
  sendBookingReminder: true,
  sendBookingConfirmation: false,
  bookingReminderBy: "email",
  firstReminderDays: 1,
  secondReminderDays: undefined,
  exportEmail: "",
  updatedAt: new Date().toISOString(),
};

// simple helpers (same pattern as other dummy libs)
export function getWorkshop(): WorkshopSettings {
  return { ...WORKSHOP };
}

export function updateWorkshop(patch: Partial<WorkshopSettings>) {
  Object.assign(WORKSHOP, patch, { updatedAt: new Date().toISOString() });
  return getWorkshop();
}
