"use client";

// In-memory repo (drop-in replacement with Supabase later)
import { JOBS } from "../dummy-jobs";
import type { Job, JobStatus } from "../types";

const nowISO = () => new Date().toISOString();

export async function listJobs(): Promise<Job[]> {
  return JOBS;
}

export async function getJob(id: string): Promise<Job | null> {
  return JOBS.find(j => j.id === id) ?? null;
}

export async function createJob(input: Omit<Job, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Job, "id">>): Promise<Job> {
  const id = input.id ?? crypto.randomUUID();
  const createdAt = nowISO();
  const job: Job = { id, createdAt, updatedAt: createdAt, ...input };
  JOBS.unshift(job);
  return job;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<Job | null> {
  const i = JOBS.findIndex(j => j.id === id);
  if (i === -1) return null;
  JOBS[i] = { ...JOBS[i], ...patch, updatedAt: nowISO() };
  return JOBS[i];
}

export async function deleteJobs(ids: string[]): Promise<void> {
  ids.forEach(id => {
    const i = JOBS.findIndex(j => j.id === id);
    if (i !== -1) JOBS.splice(i, 1);
  });
}

export async function markCompleted(ids: string[]): Promise<void> {
  ids.forEach(id => {
    const j = JOBS.find(x => x.id === id);
    if (j) {
      j.status = "Completed" as JobStatus;
      j.updatedAt = nowISO();
    }
  });
}
