// src/components/app/jobs/jobs-table.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { JobStatus } from "@/lib/types";
import { JobsFilters, JobsFilterState } from "./jobs-filters";
import { JobStatusBadge } from "./job-status";

import { listJobs, updateJob, deleteJobs } from "@/lib/data/jobs.db"; // ✅ DB layer
import type { JobRecord } from "@/lib/data/jobs.db";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaginationBar } from "./pagination-bar";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers: map DB status <-> UI status text used by your components
// ──────────────────────────────────────────────────────────────────────────────
const dbToUI: Record<string, JobStatus> = {
  // legacy/loose mappings
  draft: "In Workshop",
  in_workshop: "In Workshop",
  waiting_parts: "Waiting Parts",
  waiting_concent: "Waiting for Concent",
  completed: "Completed",
  invoice_sent: "Invoice Sent",
  payment_completed: "Payment completed",
  collected: "Collected",
};
const uiToDb: Record<JobStatus, string> = {
  "In Workshop": "in_workshop",
  "Waiting Parts": "waiting_parts",
  "Waiting for Concent": "waiting_concent",
  "Completed": "completed",
  "Invoice Sent": "invoice_sent",
  "Payment completed": "payment_completed",
  "Collected": "collected",
};

// Row shape your table renders (derived from JobRecord)
type JobRow = {
  id: string;
  number: string;          // friendly number (derived from id)
  rego: string;            // vehicle rego
  customer: string;        // customer name
  status: JobStatus;       // UI status
  createdAt: string;       // ISO date (uses startDate as the "created" column)
  amount: number;          // from estimatedTotal
};

const initialFilter: JobsFilterState = { q: "", statuses: [], tech: "all" };

type SortKey = "createdAt" | "amount";
type SortDir = "asc" | "desc";

function toRow(r: JobRecord): JobRow {
  return {
    id: r.id,
    number: r.id.slice(0, 6).toUpperCase(),
    rego: r.vehicleRego ?? "—",
    customer: r.customerName ?? "—",
    status: dbToUI[r.status] ?? "In Workshop",
    createdAt: r.startDate ?? "", // show start date as "Created"
    amount: typeof r.estimatedTotal === "number" ? r.estimatedTotal : 0,
  };
}

function matches(row: JobRow, f: JobsFilterState) {
  const q = f.q.toLowerCase().trim();
  const qOk = !q || [row.rego, row.number, row.customer].some(v => v.toLowerCase().includes(q));
  const sOk = !f.statuses.length || f.statuses.includes(row.status);
  // "tech" filter removed (not in schema) — keep it always ok:
  const tOk = true;
  return qOk && sOk && tOk;
}

function sortRows(rows: JobRow[], key: SortKey, dir: SortDir) {
  const sorted = [...rows].sort((a, b) => {
    if (key === "amount") return a.amount - b.amount;
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function JobsTable() {
  const router = useRouter();

  const [filter, setFilter] = React.useState<JobsFilterState>(initialFilter);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const [rows, setRows] = React.useState<JobRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function fetchJobs() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await listJobs({
        q: filter.q,
        status: filter.statuses.length ? uiToDb[filter.statuses[0] as JobStatus] : undefined, // simple mapping for single status filter
        sortKey: "start_date",
        sortDir: sortDir,
        page: 1,
        pageSize: 500,
      });
      setRows(res.items.map(toRow));
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message ?? "Failed to load jobs");
      toast.error(e?.message ?? "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.q, filter.statuses, sortDir]);

  const raw = React.useMemo(() => rows.filter(j => matches(j, filter)), [rows, filter]);
  const data = React.useMemo(() => sortRows(raw, sortKey, sortDir), [raw, sortKey, sortDir]);

  function applyEdits(id: string, patch: Partial<JobRow>) {
    // optimistic UI
    setRows(prev =>
      prev.map(r => (r.id === id ? { ...r, ...patch } : r))
    );
    // persist to DB (map UI status -> DB status)
    const dbPatch: any = {};
    if (patch.status !== undefined) dbPatch.status = uiToDb[patch.status];
    updateJob(id, dbPatch).catch((err) => {
      console.error(err);
      toast.error(err?.message ?? "Failed to update job");
      // revert on error (simple refetch)
      fetchJobs();
    });
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

  // ——— Delete (with confirm) ———
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deletingIds, setDeletingIds] = React.useState<string[]>([]);
  const openConfirmDelete = (ids: string[]) => {
    setDeletingIds(ids);
    setConfirmOpen(true);
  };
  const doDelete = async () => {
    try {
      await deleteJobs(deletingIds);
      setRows(prev => prev.filter(r => !deletingIds.includes(r.id)));
      setSelected({});
      setConfirmOpen(false);
      toast.success(deletingIds.length > 1 ? "Jobs deleted" : "Job deleted");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to delete jobs");
    }
  };

  // ——— Bulk operations ———
  const selectedIds = React.useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected]);
  const markSelCompleted = async () => {
    try {
      await Promise.all(selectedIds.map(id => updateJob(id, { status: "completed" })));
      setRows(prev => prev.map(r => (selectedIds.includes(r.id) ? { ...r, status: "Completed" as JobStatus } : r)));
      toast.success("Marked completed");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to mark completed");
    }
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
            <Button size="sm" variant="outline" onClick={markSelCompleted}>
              Mark completed
            </Button>
            <Button size="sm" variant="destructive" onClick={() => openConfirmDelete(selectedIds)}>
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
              <TableHead className="sticky top-0 w-10 bg-background">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => {
                    const next = { ...selected };
                    if (v) paged.forEach(j => (next[j.id] = true));
                    else paged.forEach(j => delete next[j.id]);
                    setSelected(next);
                  }}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="sticky top-0 bg-background">Job #</TableHead>
              <TableHead className="sticky top-0 bg-background">Vehicle</TableHead>
              <TableHead className="sticky top-0 bg-background">Customer</TableHead>
              <TableHead className="sticky top-0 bg-background">Status</TableHead>
              {/* Technician column removed (not in schema) */}
              <TableHead
                className="sticky top-0 bg-background"
                aria-sort={sortKey === "createdAt" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <SortButton label="Created" k="createdAt" />
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
            {loading ? (
              <TableRow><TableCell colSpan={8}>Loading…</TableCell></TableRow>
            ) : errorMsg ? (
              <TableRow><TableCell colSpan={8} className="text-destructive">{errorMsg}</TableCell></TableRow>
            ) : paged.length === 0 ? (
              <TableRow><TableCell colSpan={8}>No jobs found.</TableCell></TableRow>
            ) : (
              paged.map((j) => (
                <TableRow
                  key={j.id}
                  data-state={selected[j.id] ? "selected" : undefined}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => goToJob(j)}
                >
                  <TableCell onClick={stopRowOpen}>
                    <Checkbox
                      checked={!!selected[j.id]}
                      onCheckedChange={(v) => setSelected(prev => ({ ...prev, [j.id]: Boolean(v) }))}
                      aria-label={`Select ${j.number}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{j.number}</TableCell>
                  <TableCell>{j.rego}</TableCell>
                  <TableCell className="max-w-[220px] truncate">{j.customer}</TableCell>
                  <TableCell>
                    <JobStatusBadge status={j.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {j.createdAt ? new Date(j.createdAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">${j.amount.toFixed(2)}</TableCell>
                  <TableCell className="w-10" onClick={stopRowOpen}>
                    <RowMenu job={j} onDelete={() => openConfirmDelete([j.id])} />
                  </TableCell>
                </TableRow>
              ))
            )}
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
                  onCheckedChange={(v) => setSelected(prev => ({ ...prev, [j.id]: Boolean(v) }))}
                  aria-label={`Select ${j.number}`}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="font-medium">{j.number}</div>
              </div>
              <RowMenu job={j} onDelete={() => openConfirmDelete([j.id])} />
            </div>
            <div className="text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Rego</span><span>{j.rego}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="max-w-[55%] truncate text-right">{j.customer}</span></div>
              <div className="mt-2 flex items-center justify-between">
                <JobStatusBadge status={j.status} />
                <span className="text-xs text-muted-foreground">{j.createdAt ? new Date(j.createdAt).toLocaleString() : "—"}</span>
              </div>
              <div className="mt-1 flex items-center justify-between"><span className="text-muted-foreground">Amount</span><span>${j.amount.toFixed(2)}</span></div>
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

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deletingIds.length > 1 ? "selected jobs" : "job"}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove {deletingIds.length > 1 ? "the selected jobs" : "the job"} from records.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowMenu({ job, onDelete }: { job: JobRow; onDelete: () => void }) {
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
        <DropdownMenuItem asChild>
          <Link href={`/app/jobs/${job.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            updateJob(job.id, { status: "completed" })
              .then(() => {
                // optimistic: reflect immediately
                // (parent also does optimistic, but keep UI snappy here too)
                toast.success(`Marked ${job.number} completed`);
              })
              .catch((e) => toast.error(e?.message ?? "Failed to mark completed"))
          }
        >
          Mark completed
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/app/jobs/${job.id}/invoice`}>Create invoice</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onSelect={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
