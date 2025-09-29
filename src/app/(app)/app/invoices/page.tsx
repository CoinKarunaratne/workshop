"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  INVOICES,
  upsertInvoice,
  calcCostsAndProfit,
  seedDemoInvoices, 
  type Invoice,
} from "@/lib/dummy-invoices";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { PaginationBar } from "@/components/app/jobs/pagination-bar";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

type PayFilter = "all" | "Paid" | "Unpaid";
type SortKey = "date" | "total";
type SortDir = "asc" | "desc";

type Row = Invoice & {
  customerName: string;
  costTotal: number;
  profit: number;
  bankChargeShown: number;
  gstShown: number;
  totalShown: number; // grand total
  paymentStatusSafe: "Paid" | "Unpaid";
};

const fmtNZ = (n: number) => `$${n.toFixed(2)}`;

export default function InvoicesPage() {
  const router = useRouter();

  // local working copy (client-side demo store)
  const [rows, setRows] = React.useState<Invoice[]>(INVOICES);

// Auto-seed if empty (demo only)
React.useEffect(() => {
  (async () => {
    if (INVOICES.length === 0) {
      await seedDemoInvoices();
      setRows([...INVOICES]);
    }
  })();
}, []);


  // filters/sort
  const [q, setQ] = React.useState("");
  const [pay, setPay] = React.useState<PayFilter>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  // selection
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});

  // delete dialog
  const [delOpen, setDelOpen] = React.useState(false);
  const [delTarget, setDelTarget] = React.useState<Invoice | null>(null);

  // derived
  const enriched: Row[] = React.useMemo(() => {
    return rows.map((inv) => {
      const customerName =
        CUSTOMERS.find((c) => c.id === inv.customerId)?.name ?? "—";

      const { costTotal, profit } = calcCostsAndProfit(inv.lines);
      const bankChargeShown = inv.bankChargeEnabled ? (inv.bankCharge ?? 0) : 0;
      const gstShown = inv.taxTotal ?? 0;
      const totalShown = inv.grandTotal ?? inv.total ?? (inv.subtotal + gstShown + bankChargeShown);
      const paymentStatusSafe: "Paid" | "Unpaid" = inv.paymentStatus ?? "Unpaid";

      return {
        ...inv,
        customerName,
        costTotal,
        profit,
        bankChargeShown,
        gstShown,
        totalShown,
        paymentStatusSafe,
      };
    });
  }, [rows]);

  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return enriched.filter((r) => {
      const qOk =
        !ql ||
        r.invoiceNumber.toLowerCase().includes(ql) ||
        r.customerName.toLowerCase().includes(ql) ||
        r.rego.toLowerCase().includes(ql);

      const pOk = pay === "all" || r.paymentStatusSafe === pay;

      return qOk && pOk;
    });
  }, [enriched, q, pay]);

  const sorted = React.useMemo(() => {
    const out = [...filtered].sort((a, b) => {
      if (sortKey === "total") {
        const diff = a.totalShown - b.totalShown;
        return sortDir === "asc" ? diff : -diff;
      }
      // date sort (YYYY-MM-DD) -> use Date
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
    return out;
  }, [filtered, sortKey, sortDir]);

  // pagination
  React.useEffect(() => setPage(1), [q, pay, sortKey, sortDir]);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const end = Math.min(total, page * pageSize);
  const paged = sorted.slice(start, end);

  const allSelected = paged.length > 0 && paged.every((r) => selected[r.id]);
  const someSelected = paged.some((r) => selected[r.id]);
  const countSelected = paged.filter((r) => selected[r.id]).length;

  const toggleAll = (checked: boolean) => {
    const next = { ...selected };
    if (checked) paged.forEach((r) => (next[r.id] = true));
    else paged.forEach((r) => delete next[r.id]);
    setSelected(next);
  };
  const toggleOne = (id: string, v: boolean) => {
    setSelected((s) => ({ ...s, [id]: v }));
  };

  // sort button
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

  // actions
  const openDelete = (inv: Invoice) => {
    setDelTarget(inv);
    setDelOpen(true);
  };

  const confirmDelete = () => {
    if (!delTarget) return;
    setRows((prev) => prev.filter((x) => x.id !== delTarget.id));
    // also mutate store so other pages reflect it in-session
    const idx = INVOICES.findIndex((x) => x.id === delTarget.id);
    if (idx !== -1) INVOICES.splice(idx, 1);
    toast.success(`Invoice ${delTarget.invoiceNumber} deleted`);
    setDelOpen(false);
    setDelTarget(null);
  };

  const markPaid = (inv: Invoice, status: "Paid" | "Unpaid") => {
    const updated: Invoice = {
      ...inv,
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    };
    upsertInvoice(updated);
    setRows((prev) => prev.map((x) => (x.id === inv.id ? updated : x)));
    toast.success(`Marked ${inv.invoiceNumber} ${status.toLowerCase()}`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Invoices</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search invoice #, customer, rego"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <Select value={pay} onValueChange={(v) => setPay(v as PayFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right side: sort (no 'reset' chip per your preference) */}
        <div className="flex items-center gap-2">
          {/* Optional place for future actions */}
        </div>
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
              variant="outline"
              onClick={() => {
                // bulk mark paid demo
                const ids = Object.keys(selected).filter((k) => selected[k]);
                const updates = rows.map((r) =>
                  ids.includes(r.id) ? { ...r, paymentStatus: "Paid" as const, updatedAt: new Date().toISOString() } : r
                );
                updates.forEach(upsertInvoice);
                setRows(updates);
                toast.success("Selected invoices marked paid");
              }}
            >
              Mark paid
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                const ids = Object.keys(selected).filter((k) => selected[k]);
                if (!ids.length) return;
                // mini confirm for bulk
                const count = ids.length;
                if (!confirm(`Delete ${count} invoice(s)?`)) return;
                setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
                // mutate demo store
                for (const id of ids) {
                  const i = INVOICES.findIndex((x) => x.id === id);
                  if (i !== -1) INVOICES.splice(i, 1);
                }
                setSelected({});
                toast.success(`Deleted ${count} invoice(s)`);
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
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rego</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead className="text-right">Bank charge</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead
                className="text-right"
                aria-sort={sortKey === "total" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <SortButton label="Total" k="total" />
              </TableHead>
              <TableHead
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
                    aria-label={`Select ${r.invoiceNumber}`}
                  />
                </TableCell>

                <TableCell className="font-medium">{r.invoiceNumber}</TableCell>

                <TableCell className="max-w-[220px] truncate">
                  {r.customerName !== "—" ? (
                    <Link
                      className="hover:underline"
                      href={`/app/customers/${r.customerId}`}
                    >
                      {r.customerName}
                    </Link>
                  ) : "—"}
                </TableCell>

                <TableCell>{r.rego}</TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-2 py-0.5 text-xs",
                      r.paymentStatusSafe === "Paid"
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                        : "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                    )}
                  >
                    {r.paymentStatusSafe}
                  </span>
                </TableCell>

                <TableCell className="text-right">{fmtNZ(r.costTotal)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.gstShown)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.bankChargeShown)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.profit)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.totalShown)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.date).toLocaleDateString("en-NZ")}
                </TableCell>

                <TableCell className="w-10">
                  <RowMenu
                    inv={r}
                    onView={() => router.push(`/app/jobs/${r.jobId}/invoice`)}
                    onPaid={() => markPaid(r, "Paid")}
                    onUnpaid={() => markPaid(r, "Unpaid")}
                    onDelete={() => openDelete(r)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-sm text-muted-foreground">
                  No invoices found.
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
            <DialogTitle>Delete invoice</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {delTarget ? (
              <>Are you sure you want to delete <b>{delTarget.invoiceNumber}</b> from records?</>
            ) : (
              <>Are you sure you want to delete this invoice?</>
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

function RowMenu({
  inv,
  onView,
  onPaid,
  onUnpaid,
  onDelete,
}: {
  inv: Invoice;
  onView: () => void;
  onPaid: () => void;
  onUnpaid: () => void;
  onDelete: () => void;
}) {
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
        <DropdownMenuItem onSelect={onView}>View & Edit</DropdownMenuItem>
        {inv.paymentStatus === "Paid" ? (
          <DropdownMenuItem onSelect={onUnpaid}>Mark unpaid</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={onPaid}>Mark paid</DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-red-600" onSelect={onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
