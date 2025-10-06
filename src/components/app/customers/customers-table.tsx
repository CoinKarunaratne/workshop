"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomersFilters, CustomersFilterState } from "./customers-filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from "lucide-react";
import { PaginationBar } from "@/components/app/jobs/pagination-bar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listCustomers,
  type CustomersQuery,
  type CustomersPage,
  deleteCustomers as repoDeleteCustomers,
} from "@/lib/data/customers.db";

type SortKey = "lastVisit" | "balance";
type SortDir = "asc" | "desc";

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-NZ");

export function CustomersTable() {
  const router = useRouter();

  // UI filter state (matches repository query)
  const [filter, setFilter] = React.useState<CustomersFilterState>({
    q: "",
    onlyWithBalance: false,
    recency: "any",
  });
  const [sortKey, setSortKey] = React.useState<SortKey>("lastVisit");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const query: CustomersQuery = {
    q: filter.q,
    onlyWithBalance: filter.onlyWithBalance,
    recency: filter.recency,
    sortKey,
    sortDir,
    page,
    pageSize,
  };

  const [data, setData] = React.useState<CustomersPage>({ items: [], total: 0 });

  // Fetch (from mock repo for now)
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await listCustomers(query);
      if (!cancelled) setData(res);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.q, filter.onlyWithBalance, filter.recency, sortKey, sortDir, page, pageSize]);

  const paged = data.items;
  const total = data.total;

  // selection
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const allSelected = paged.length > 0 && paged.every((r) => selected[r.id]);
  const someSelected = paged.some((r) => selected[r.id]);
  const countSelected = paged.filter((r) => selected[r.id]).length;
  const selectedIds = paged.filter((r) => selected[r.id]).map((r) => r.id);
  const singleSelectedRow = countSelected === 1 ? paged.find(r => selected[r.id]) ?? null : null;

  React.useEffect(() => {
    // clear selection when data page changes
    setSelected({});
  }, [paged.map(r => r.id).join(",")]);

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
  }, [paged.length]);

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
          setPage(1);
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

  const onView = (id: string) => router.push(`/app/customers/${id}`);

  // Delete dialog
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const openDelete = () => setConfirmOpen(true);
  const onConfirmDelete = async () => {
    await repoDeleteCustomers(selectedIds); // demo no-op
    // locally refetch to reflect deletion (mock behavior)
    toast.success(
      countSelected === 1 ? "Customer deleted (demo)" : `${countSelected} customers deleted (demo)`
    );
    setSelected({});
    // simple refetch
    const res = await listCustomers({ ...query, page });
    setData(res);
    setConfirmOpen(false);
  };

  const onEdit = () => {
    if (!singleSelectedRow) return;
    router.push(`/app/customers/${singleSelectedRow.id}/edit`);
  };

  return (
    <div className="space-y-4">
      <CustomersFilters
        state={filter}
        setState={(next) => { setFilter(next); setPage(1); }}
        onReset={() => {}}
        count={total}
      />

      {/* Bulk bar */}
      {someSelected && (
        <div className="flex items-center justify-between rounded-md border bg-card p-2 text-sm">
          <div>
            <strong>{countSelected}</strong> selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              disabled={countSelected !== 1}
              title={countSelected === 1 ? "Edit selected" : "Select exactly one to edit"}
            >
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={openDelete}>
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
              {/* Vehicles column removed */}
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
                onClick={() => onView(r.id)}
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
                {/* Vehicles column removed */}
                <TableCell className="text-sm text-muted-foreground">
                  {fmtDate(r.lastVisit)}
                </TableCell>
                <TableCell className="text-right">${r.balance.toFixed(2)}</TableCell>
                <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                  <RowMenu id={r.id} name={r.name} />
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
            onClick={() => onView(r.id)}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">{r.name}</div>
              <RowMenu id={r.id} name={r.name} stopPropagation />
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
              {/* Vehicles line removed */}
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

      {/* Delete confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              {countSelected === 1 && singleSelectedRow
                ? `Are you sure you want to delete "${singleSelectedRow.name}" from records?`
                : `Are you sure you want to delete ${countSelected} selected customers from records?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowMenu({ id, name, stopPropagation }: { id: string; name: string; stopPropagation?: boolean }) {
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
          <Link href={`/app/customers/${id}`}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/app/customers/${id}/vehicles/new`}>Add vehicle</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/app/jobs/new?customer=${encodeURIComponent(name)}`}>New job</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/app/customers/${id}/edit`}>Edit</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
