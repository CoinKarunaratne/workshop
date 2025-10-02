// src/app/(app)/expenses/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EXPENSES, seedDemoExpenses, deleteExpense, listYears, getYear, getMonth } from "@/lib/dummy-expenses";
import { type Expense } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { PaginationBar } from "@/components/app/jobs/pagination-bar";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

const MONTH_OPTS = [
  { v: "all", label: "All months" },
  { v: "1", label: "Jan" },
  { v: "2", label: "Feb" },
  { v: "3", label: "Mar" },
  { v: "4", label: "Apr" },
  { v: "5", label: "May" },
  { v: "6", label: "Jun" },
  { v: "7", label: "Jul" },
  { v: "8", label: "Aug" },
  { v: "9", label: "Sep" },
  { v: "10", label: "Oct" },
  { v: "11", label: "Nov" },
  { v: "12", label: "Dec" },
];

const fmtNZ = (n: number) => `$${n.toFixed(2)}`;

export default function ExpensesPage() {
  const router = useRouter();

  // local mirror
  const [rows, setRows] = React.useState<Expense[]>(EXPENSES);
  React.useEffect(() => {
    if (EXPENSES.length === 0) {
      seedDemoExpenses();
      setRows([...EXPENSES]);
    }
  }, []);

  // filters
  const [q, setQ] = React.useState("");
  const [year, setYear] = React.useState<string>("all");
  const [month, setMonth] = React.useState<string>("all");

  // sort
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  // pagination
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  // selection
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  // delete dialog
  const [delOpen, setDelOpen] = React.useState(false);
  const [delTarget, setDelTarget] = React.useState<Expense | null>(null);

  const availableYears = React.useMemo(() => listYears(), [rows.length]);

  // compute month options that exist in selected year
  const monthsForYear = React.useMemo(() => {
    if (year === "all") return MONTH_OPTS;
    const y = Number(year);
    const set = new Set<number>();
    rows.forEach((r) => {
      if (getYear(r.date) === y) set.add(getMonth(r.date));
    });
    const filtered = MONTH_OPTS.filter((m) => m.v === "all" || set.has(Number(m.v)));
    return filtered.length ? filtered : MONTH_OPTS;
  }, [rows, year]);

  // filter
  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      const qOk = !ql || r.description.toLowerCase().includes(ql) || r.type.toLowerCase().includes(ql);
      const yOk = year === "all" || getYear(r.date) === Number(year);
      const mOk = month === "all" || getMonth(r.date) === Number(month);
      return qOk && yOk && mOk;
    });
  }, [rows, q, year, month]);

  // sort
  const sorted = React.useMemo(() => {
    const out = [...filtered].sort((a, b) => {
      if (sortKey === "amount") {
        const diff = a.amount - b.amount;
        return sortDir === "asc" ? diff : -diff;
      }
      // date
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
    return out;
  }, [filtered, sortKey, sortDir]);

  React.useEffect(() => setPage(1), [q, year, month, sortKey, sortDir]);

  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const end = Math.min(total, page * pageSize);
  const paged = sorted.slice(start, end);

  const allSelected = paged.length > 0 && paged.every((r) => selected[r.id]);
  const someSelected = paged.some((r) => selected[r.id]);
  const countSelected = paged.filter((r) => selected[r.id]).length;

  const toggleAll = (v: boolean) => {
    const next = { ...selected };
    if (v) paged.forEach((r) => (next[r.id] = true));
    else paged.forEach((r) => delete next[r.id]);
    setSelected(next);
  };
  const toggleOne = (id: string, v: boolean) => setSelected((s) => ({ ...s, [id]: v }));

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
        <Icon className="ml-1 h-4 w-4" />
      </Button>
    );
  };

  const openDelete = (e: Expense) => {
    setDelTarget(e);
    setDelOpen(true);
  };
  const confirmDelete = () => {
    if (!delTarget) return;
    deleteExpense(delTarget.id);
    setRows((prev) => prev.filter((x) => x.id !== delTarget.id));
    toast.success("Expense deleted");
    setDelOpen(false);
    setDelTarget(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <Button onClick={() => router.push("/app/expenses/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search description or type"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <Select value={year} onValueChange={(v) => { setYear(v); setMonth("all"); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {monthsForYear.map((m) => (
                <SelectItem key={m.v} value={m.v}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* (room for future export button etc.) */}
      </div>

      {/* Bulk bar */}
      {someSelected && (
        <div className="flex items-center justify-between rounded-md border bg-card p-2 text-sm">
          <div>
            <strong>{countSelected}</strong> selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const ids = Object.keys(selected).filter((k) => selected[k]);
                if (!ids.length) return;
                if (!confirm(`Delete ${ids.length} expense(s)?`)) return;
                ids.forEach(deleteExpense);
                setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
                setSelected({});
                toast.success(`Deleted ${ids.length} expense(s)`);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                className="text-right"
                aria-sort={sortKey === "amount" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <SortButton label="Amount" k="amount" />
              </TableHead>
              <TableHead className="text-right"
                aria-sort={sortKey === "date" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <SortButton label="Date" k="date" />
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Checkbox
                    checked={!!selected[r.id]}
                    onCheckedChange={(v) => toggleOne(r.id, Boolean(v))}
                    aria-label={`Select ${r.description}`}
                  />
                </TableCell>
                <TableCell className="max-w-[420px] truncate">{r.description}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.amount)}</TableCell>
                <TableCell className="text-sm text-muted-foreground text-right">
                  {new Date(r.date).toLocaleDateString("en-NZ")}
                </TableCell>
                <TableCell className="w-10">
                <RowMenu id={r.id} onDelete={() => openDelete(r)} />
                </TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  No expenses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* Delete dialog */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete expense</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {delTarget ? (
              <>Are you sure you want to delete <b>{delTarget.description}</b>?</>
            ) : (
              <>Are you sure you want to delete this expense?</>
            )}
          </div>
          <Separator className="my-2" />
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowMenu({ onDelete, id }: { onDelete: () => void; id: string }) {
    const router = useRouter();
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 hover:bg-muted"
            aria-label="Row actions"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push(`/app/expenses/${id}`)}>
            View & Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onSelect={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
