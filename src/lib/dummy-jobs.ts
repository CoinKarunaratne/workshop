export type JobStatus = "Booked" | "In Workshop" | "Waiting Parts" | "Completed" | "Collected";

export interface JobRow {
  id: string;
  number: string;
  rego: string;
  customer: string;
  status: JobStatus;
  technician: string;
  updatedAt: string; // ISO date
  amount: number;    // cents or dollars (here dollars)
}

export const TECHS = ["Ava", "Ben", "Carter", "Dylan", "Ella"];

export const JOBS: JobRow[] = [
  { id: "1", number: "J-1245", rego: "ABC123", customer: "John Smith", status: "In Workshop", technician: "Ava", updatedAt: "2025-08-15T10:32:00Z", amount: 420.0 },
  { id: "2", number: "J-1246", rego: "KLM998", customer: "S. Patel", status: "Waiting Parts", technician: "Ben", updatedAt: "2025-08-14T15:10:00Z", amount: 180.0 },
  { id: "3", number: "J-1247", rego: "QWE765", customer: "M. Chen", status: "Booked", technician: "Carter", updatedAt: "2025-08-15T08:05:00Z", amount: 0 },
  { id: "4", number: "J-1248", rego: "NZR220", customer: "A. Tui", status: "Completed", technician: "Ella", updatedAt: "2025-08-13T12:20:00Z", amount: 560.0 },
  { id: "5", number: "J-1249", rego: "WOF777", customer: "K. Brown", status: "Collected", technician: "Dylan", updatedAt: "2025-08-12T09:00:00Z", amount: 310.0 },
  { id: "6", number: "J-1250", rego: "BRK321", customer: "RotorLab Auto", status: "In Workshop", technician: "Ava", updatedAt: "2025-08-16T02:41:00Z", amount: 260.0 },
];
