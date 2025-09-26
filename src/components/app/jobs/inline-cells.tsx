// src/components/app/jobs/inline-cells.tsx
"use client";

import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { JobStatusBadge } from "./job-status";
import type { JobStatus } from "@/lib/dummy-jobs";
import { TECHS } from "@/lib/dummy-jobs";
import { cn } from "@/lib/utils";

/** Inline Status cell: shows badge; click to edit with a compact Select */
export function InlineStatusCell({
  value,
  onChange,
  className,
  disabled,
  onOpenPreventRow,
}: {
  value: JobStatus;
  onChange: (next: JobStatus) => void;
  className?: string;
  disabled?: boolean;
  onOpenPreventRow?: (e: React.MouseEvent) => void; // call e.stopPropagation() upstream
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as JobStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-7 w-[160px] border-none bg-transparent px-0 focus:ring-0 focus-visible:ring-0",
          "data-[state=open]:ring-0",
          className
        )}
        aria-label="Edit status"
        onClick={(e) => onOpenPreventRow?.(e)}
      >
        <SelectValue
          placeholder="Select status"
          aria-label={value}
          className="!m-0 !p-0"
        >
          <span className="inline-flex">
            <JobStatusBadge status={value} />
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" onClick={(e) => e.stopPropagation()}>
        {(["Booked","In Workshop","Waiting Parts","Completed","Collected"] as JobStatus[]).map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Inline Technician cell: shows text; click to edit with Select */
export function InlineTechCell({
  value,
  onChange,
  className,
  disabled,
  onOpenPreventRow,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  disabled?: boolean;
  onOpenPreventRow?: (e: React.MouseEvent) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-7 w-[140px] justify-start border-none bg-transparent px-0 text-foreground focus:ring-0",
          className
        )}
        aria-label="Assign technician"
        onClick={(e) => onOpenPreventRow?.(e)}
      >
        <SelectValue placeholder="Assign technician" />
      </SelectTrigger>
      <SelectContent align="start" onClick={(e) => e.stopPropagation()}>
        {TECHS.map((t) => (
          <SelectItem key={t} value={t}>{t}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
