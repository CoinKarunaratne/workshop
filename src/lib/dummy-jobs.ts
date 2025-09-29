import type { Job, JobStatus } from "./types";

export const TECHS = ["Ava", "Ben", "Carter", "Dylan", "Ella"];

const iso = (d: string) => new Date(d).toISOString();

export const JOBS: Job[] = [
  { id: "1", number: "J-1245", rego: "ABC123", customer: "John Smith",  status: "In Workshop",      technician: "Ava",    createdAt: iso("2025-08-10T09:00:00Z"), updatedAt: iso("2025-08-15T10:32:00Z"), amount: 420.0 },
  { id: "2", number: "J-1246", rego: "KLM998", customer: "S. Patel",    status: "Waiting Parts",     technician: "Ben",    createdAt: iso("2025-08-12T10:00:00Z"), updatedAt: iso("2025-08-14T15:10:00Z"), amount: 180.0 },
  { id: "3", number: "J-1247", rego: "QWE765", customer: "M. Chen",     status: "Waiting Parts",     technician: "Carter", createdAt: iso("2025-08-13T08:00:00Z"), updatedAt: iso("2025-08-15T08:05:00Z"), amount: 0 },
  { id: "4", number: "J-1248", rego: "NZR220", customer: "A. Tui",      status: "Completed",         technician: "Ella",   createdAt: iso("2025-08-11T11:00:00Z"), updatedAt: iso("2025-08-13T12:20:00Z"), amount: 560.0 },
  { id: "5", number: "J-1249", rego: "WOF777", customer: "K. Brown",    status: "Collected",         technician: "Dylan",  createdAt: iso("2025-08-09T09:00:00Z"), updatedAt: iso("2025-08-12T09:00:00Z"), amount: 310.0 },
  { id: "6", number: "J-1250", rego: "BRK321", customer: "RotorLab Auto", status: "In Workshop",     technician: "Ava",    createdAt: iso("2025-08-16T00:10:00Z"), updatedAt: iso("2025-08-16T02:41:00Z"), amount: 260.0 },
];

export type { Job, JobStatus };
