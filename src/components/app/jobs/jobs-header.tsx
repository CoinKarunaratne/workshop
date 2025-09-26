// src/components/app/jobs/jobs-header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function JobsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Jobs</h1>
      <Button asChild>
        <Link href="/app/jobs/new">
          <Plus className="mr-2 size-4" />
          New Job
        </Link>
      </Button>
    </div>
  );
}
