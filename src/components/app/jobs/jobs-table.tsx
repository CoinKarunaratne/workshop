// src/components/app/jobs/jobs-table.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { JOBS, JobRow } from "@/lib/dummy-jobs";
import type { JobStatus } from "@/lib/dummy-jobs";

import { JobsFilters, JobsFilterState } from "./jobs-filters";
import { JobStatusBadge } from "./job-status";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaginationBar } from "./pagination-bar";
import { InlineStatusCell, InlineTechCell } from "./inline-cells";

const initialFilter: JobsFilterState = { q: "", statuses: [], tech: "all", onlyUnpaid: false };

type SortKey = "updatedAt" | "amount";
type SortDir = "asc" | "desc";

function matches(row: JobRow, f: JobsFilterState) {
  const q = f.q.toLowerCase().trim();
  const qOk = !q || [row.rego, row.number, row.customer].some(v => v.toLowerCase().includes(q));
  const sOk = !f.statuses.length || f.statuses.includes(row.status);
  const tOk = f.tech === "all" || row.technician === f.tech;
  const unpaidOk = !f.onlyUnpaid || row.amount > 0; // demo rule
  return qOk && sOk && tOk && unpaidOk;
}

function sortRows(rows: JobRow[], key: SortKey, dir: SortDir) {
  const sorted = [...rows].sort((a, b) => {
    if (key === "amount") return a.amount - b.amount;
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function JobsTable() {
  const router = useRouter();

  const [filter, setFilter] = React.useState<JobsFilterState>(initialFilter);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [sortKey, setSortKey] = React.useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const [rows, setRows] = React.useState<JobRow[]>(JOBS);

  const raw = React.useMemo(() => rows.filter(j => matches(j, filter)), [rows, filter]);
  const data = React.useMemo(() => sortRows(raw, sortKey, sortDir), [raw, sortKey, sortDir]);

  function applyEdits(id: string, patch: Partial<JobRow>) {
    setRows(prev =>
      prev.map(r => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r))
    );
  }

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  React.useEffect(() => { setPage(1); }, [filter, sortKey, sortDir]);

  const total = data.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, page * pageSize);
  const paged = React.useMemo(() => data.slice(startIndex, endIndex), [data, startIndex, endIndex]);

  const allSelected = paged.length > 0 && paged.every(j => selected[j.id]);
  const someSelected = paged.some(j => selected[j.id]);
  const countSelected = paged.filter(j => selected[j.id]).length;

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0 });
  }, [page, pageSize]);

  React.useEffect(() => {
    setSelected({});
  }, [page, pageSize]);

  const toggleAll = (checked: boolean) => {
    const next = { ...selected };
    if (checked) paged.forEach(j => (next[j.id] = true));
    else paged.forEach(j => delete next[j.id]);
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: checked }));
  };

  // scroll shadow state for the table container
  const [atTop, setAtTop] = React.useState(true);
  const [atBottom, setAtBottom] = React.useState(false);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      setAtTop(el.scrollTop <= 0);
      setAtBottom(el.scrollHeight - el.clientHeight - el.scrollTop <= 1);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [data.length]);

  // navigation helper (replaces drawer)
  const goToJob = (row: JobRow) => router.push(`/app/jobs/${row.id}`);
  const stopRowOpen: React.MouseEventHandler = (e) => e.stopPropagation();

  const SortButton = ({ label, k }: { label: string; k: SortKey }) => {
    const active = sortKey === k;
    const nextDir: SortDir = active && sortDir === "desc" ? "asc" : "desc";
    const Icon = !active ? ArrowUpDown : sortDir === "desc" ? ArrowDown : ArrowUp;
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 px-2"
        onClick={() => {
          setSortKey(k);
          setSortDir(nextDir);
        }}
      >
        {label}
        <Icon className="ml-1 size-4" />
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <JobsFilters
        state={filter}
        setState={setFilter}
        onReset={() => setFilter(initialFilter)}
        count={data.length}
      />

      {/* Bulk bar */}
      {someSelected && (
        <div className="flex items-center justify-between rounded-md border bg-card p-2 text-sm">
          <div>
            <strong>{countSelected}</strong> selected
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.message("Moved to Completed (demo)")}>
              Mark completed
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.message("Invoice created (demo)")}>
              Create invoice
            </Button>
            <Button size="sm" variant="destructive" onClick={() => toast.message("Deleted (demo)")}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div
        ref={scrollRef}
        className="scroll-shadows hidden max-h-[70vh] overflow-auto rounded-md border md:block"
        data-at-top={atTop}
        data-at-bottom={atBottom}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead className="w-10 sticky top-0 bg-background">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all"
                  onClick={stopRowOpen}
                />
              </TableHead>
              <TableHead className="sticky top-0 bg-background">Job #</TableHead>
              <TableHead className="sticky top-0 bg-background">Vehicle</TableHead>
              <TableHead className="sticky top-0 bg-background">Customer</TableHead>
              <TableHead className="sticky top-0 bg-background">Status</TableHead>
              <TableHead className="sticky top-0 bg-background">Technician</TableHead>
              <TableHead
                className="sticky top-0 bg-background"
                aria-sort={sortKey === "updatedAt" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <SortButton label="Updated" k="updatedAt" />
              </TableHead>
              <TableHead
                className="sticky top-0 bg-background text-right"
                aria-sort={sortKey === "amount" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <SortButton label="Amount" k="amount" />
              </TableHead>
              <TableHead className="sticky top-0 bg-background" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((j) => (
              <TableRow
                key={j.id}
                data-state={selected[j.id] ? "selected" : undefined}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => goToJob(j)}
              >
                <TableCell onClick={stopRowOpen}>
                  <Checkbox
                    checked={!!selected[j.id]}
                    onCheckedChange={(v) => toggleOne(j.id, Boolean(v))}
                    aria-label={`Select ${j.number}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{j.number}</TableCell>
                <TableCell>{j.rego}</TableCell>
                <TableCell className="max-w-[220px] truncate">{j.customer}</TableCell>
                <TableCell onClick={stopRowOpen}>
                  <InlineStatusCell
                    value={j.status as JobStatus}
                    onChange={(next) => applyEdits(j.id, { status: next })}
                    onOpenPreventRow={stopRowOpen}
                  />
                </TableCell>
                <TableCell onClick={stopRowOpen}>
                  <InlineTechCell
                    value={j.technician}
                    onChange={(next) => applyEdits(j.id, { technician: next })}
                    onOpenPreventRow={stopRowOpen}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(j.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">${j.amount.toFixed(2)}</TableCell>
                <TableCell className="w-10" onClick={stopRowOpen}>
                  <RowMenu job={j} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paged.map((j) => (
          <div
            key={j.id}
            className={cn("rounded-md border p-3", selected[j.id] && "ring-2 ring-ring")}
            onClick={() => goToJob(j)}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={!!selected[j.id]}
                  onCheckedChange={(v) => toggleOne(j.id, Boolean(v))}
                  aria-label={`Select ${j.number}`}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="font-medium">{j.number}</div>
              </div>
              <RowMenu job={j} />
            </div>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rego</span>
                <span>{j.rego}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="max-w-[55%] truncate text-right">{j.customer}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <JobStatusBadge status={j.status as JobStatus} />
                <span className="text-xs text-muted-foreground">
                  {new Date(j.updatedAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Tech</span>
                <span>{j.technician}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span>${j.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

function RowMenu({ job }: { job: JobRow }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 hover:bg-muted"
          aria-label="Row actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/jobs/${job.id}`}>Open</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.message(`Mark ${job.number} completed (demo)`)}>
          Mark completed
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => toast.message(`Create invoice for ${job.number} (demo)`)}>
          Create invoice
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onSelect={() => toast.message(`Delete ${job.number} (demo)`)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
