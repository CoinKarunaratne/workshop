// src/components/JobsTable.tsx
import { createClient } from "@/utils/supabase/server"
import JobsTableClient from "./JobsTableClient"

export default async function JobsTable() {
  const supabase = await createClient()

  // Adjust these columns to your schema:
  // Example schema assumption:
  // jobs: id (uuid), title (text), status (text), created_at (timestamptz)
  // customers: name (text) joined via view or denormalized column job_customer_name
  // vehicles: rego (text) joined via view or denormalized column job_vehicle_rego
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, status, created_at, customer_name, vehicle_rego")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    // Fallback to empty array if columns differ; we’ll handle display gracefully on client
    return <JobsTableClient rows={[]} />
  }

  return <JobsTableClient rows={data ?? []} />
}
