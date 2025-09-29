"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Filter, RotateCcw } from "lucide-react";
import type { JobStatus } from "@/lib/types";
import { TECHS } from "@/lib/dummy-jobs";

export type JobsFilterState = {
  q: string;
  statuses: JobStatus[];
  tech: string | "all";
};

export function JobsFilters({
  state,
  setState,
  onReset,
  count,
}: {
  state: JobsFilterState;
  setState: (s: JobsFilterState) => void;
  onReset: () => void;
  count: number;
}) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (state.q) n++;
    if (state.statuses.length) n++;
    if (state.tech !== "all") n++;
    return n;
  }, [state]);

  const toggleStatus = (s: JobStatus) => {
    const has = state.statuses.includes(s);
    setState({ ...state, statuses: has ? state.statuses.filter(x => x !== s) : [...state.statuses, s] });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search rego, job #, customer"
            value={state.q}
            onChange={(e) => setState({ ...state, q: e.target.value })}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="justify-start">
              <Filter className="mr-2 size-4" />
              Status{activeCount ? ` (${activeCount})` : ""}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {(["In Workshop","Waiting Parts","Waiting for Concent","Completed","Invoice Sent","Payment completed","Collected"] as JobStatus[]).map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={state.statuses.includes(s)}
                onCheckedChange={() => toggleStatus(s)}
              >
                {s}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select
          value={state.tech}
          onValueChange={(v) => setState({ ...state, tech: v as JobsFilterState["tech"] })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Technician" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All techs</SelectItem>
            {TECHS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden text-sm text-muted-foreground sm:block">{count} jobs</div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-1 size-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
