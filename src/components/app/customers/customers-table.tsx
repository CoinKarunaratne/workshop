// src/components/app/customers/customers-table.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CUSTOMERS, CustomerRow } from "@/lib/dummy-customers";
import { CustomersFilters, CustomersFilterState } from "./customers-filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { PaginationBar } from "@/components/app/jobs/pagination-bar";
import { cn } from "@/lib/utils";

const initialFilter: CustomersFilterState = {
  q: "",
  onlyWithBalance: false,
  withVehicles: "any",
  recency: "any",
};

type SortKey = "lastVisit" | "balance";
type SortDir = "asc" | "desc";

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-NZ");

function matches(row: CustomerRow, f: CustomersFilterState) {
  const q = f.q.toLowerCase().trim();
  const qOk =
    !q ||
    [row.name, row.email ?? "", row.phone ?? ""].some((v) => v.toLowerCase().includes(q));

  const vOk =
    f.withVehicles === "any" ||
    (f.withVehicles === "1+" && row.vehicles >= 1) ||
    (f.withVehicles === "2+" && row.vehicles >= 2);

  const balOk = !f.onlyWithBalance || row.balance > 0.001;

  const days = (Date.now() - new Date(row.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
  const recOk =
    f.recency === "any" ||
    (f.recency === "30d" && days <= 30) ||
    (f.recency === "90d" && days <= 90);

  return qOk && vOk && balOk && recOk;
}

function sortRows(rows: CustomerRow[], key: SortKey, dir: SortDir) {
  const sorted = [...rows].sort((a, b) => {
    if (key === "balance") return a.balance - b.balance;
    return new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime();
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function CustomersTable() {
  const [filter, setFilter] = React.useState<CustomersFilterState>(initialFilter);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [sortKey, setSortKey] = React.useState<SortKey>("lastVisit");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const raw = React.useMemo(() => CUSTOMERS.filter((c) => matches(c, filter)), [filter]);
  const data = React.useMemo(() => sortRows(raw, sortKey, sortDir), [raw, sortKey, sortDir]);

  React.useEffect(() => {
    setPage(1);
  }, [filter, sortKey, sortDir]);

  const total = data.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, page * pageSize);
  const paged = data.slice(startIndex, endIndex);

  const allSelected = paged.length > 0 && paged.every((r) => selected[r.id]);
  const someSelected = paged.some((r) => selected[r.id]);
  const countSelected = paged.filter((r) => selected[r.id]).length;

  // scroll shadows
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

  // sorting button
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

  const toggleAll = (checked: boolean) => {
    const next = { ...selected };
    if (checked) paged.forEach((r) => (next[r.id] = true));
    else paged.forEach((r) => delete next[r.id]);
    setSelected(next);
  };
  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const router = useRouter();
  const onView = (r: CustomerRow) => router.push(`/app/customers/${r.id}`);

  return (
    <div className="space-y-4">
      <CustomersFilters
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
            <Button size="sm" variant="outline" onClick={() => toast.message("Export (demo)")}>
              Export
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
                  checked={allSelected || (someSelected ? "indeterminate" : false)}
                  onCheckedChange={(v) => toggleAll(Boolean(v))}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="sticky top-0 bg-background">Name</TableHead>
              <TableHead className="sticky top-0 bg-background">Contact</TableHead>
              <TableHead className="sticky top-0 bg-background">Vehicles</TableHead>
              <TableHead className="sticky top-0 bg-background">
                <SortButton label="Last visit" k="lastVisit" />
              </TableHead>
              <TableHead className="sticky top-0 bg-background text-right">
                <SortButton label="Balance" k="balance" />
              </TableHead>
              <TableHead className="sticky top-0 bg-background" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((r) => (
              <TableRow
                key={r.id}
                data-state={selected[r.id] ? "selected" : undefined}
                className="cursor-pointer hover:bg-muted/40"
                onClick={() => onView(r)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={!!selected[r.id]}
                    onCheckedChange={(v) => toggleOne(r.id, Boolean(v))}
                    aria-label={`Select ${r.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="truncate">{r.email || "—"}</div>
                  <div className="truncate">{r.phone || "—"}</div>
                </TableCell>
                <TableCell>{r.vehicles}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmtDate(r.lastVisit)}</TableCell>
                <TableCell className="text-right">${r.balance.toFixed(2)}</TableCell>
                <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                  <RowMenu row={r} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paged.map((r) => (
          <div
            key={r.id}
            className={cn("rounded-md border p-3", selected[r.id] && "ring-2 ring-ring")}
            onClick={() => onView(r)}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">{r.name}</div>
              <RowMenu row={r} stopPropagation />
            </div>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="max-w-[55%] truncate text-right">{r.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{r.phone || "—"}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Vehicles</span>
                <span>{r.vehicles}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Last visit</span>
                <span>{fmtDate(r.lastVisit)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">Balance</span>
                <span>${r.balance.toFixed(2)}</span>
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

function RowMenu({ row, stopPropagation }: { row: CustomerRow; stopPropagation?: boolean }) {
  const onClick: React.MouseEventHandler = (e) => {
    if (stopPropagation) e.stopPropagation();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button onClick={onClick} variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={onClick}>
        <DropdownMenuItem asChild>
          <Link href={`/app/customers/${row.id}`}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/app/customers/${row.id}/vehicles/new`}>Add vehicle</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/app/jobs/new?customer=${encodeURIComponent(row.name)}`}>New job</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
