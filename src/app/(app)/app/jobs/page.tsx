// src/app/(app)/jobs/page.tsx
import { JobsTable } from "@/components/app/jobs/jobs-table";
import { JobsHeader } from "@/components/app/jobs/jobs-header";

export const metadata = {
  title: "Jobs",
};

export default function JobsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6"> 
      <JobsHeader />
      <JobsTable />
    </div>
  );
}
