"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QUOTATIONS, type Quotation } from "@/lib/dummy-quotations";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { VEHICLES } from "@/lib/dummy-vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PaginationBar } from "@/components/app/jobs/pagination-bar";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

type JobFilter = "all" | "GotJob" | "NotGotJob";
type SortKey = "date" | "total";
type SortDir = "asc" | "desc";

type Row = Quotation & {
  customerName: string;
  regoShown: string; // derived for search/display
};

const fmtNZ = (n: number) => `$${n.toFixed(2)}`;

export default function QuotationsPage() {
  const router = useRouter();
  const [rows, setRows] = React.useState<Quotation[]>(QUOTATIONS);

  // filters
  const [q, setQ] = React.useState("");
  const [jobFilter, setJobFilter] = React.useState<JobFilter>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [delOpen, setDelOpen] = React.useState(false);
  const [delTarget, setDelTarget] = React.useState<Quotation | null>(null);

  const enriched: Row[] = React.useMemo(() => {
    return rows.map((q) => {
      const customerName = CUSTOMERS.find((c) => c.id === q.customerId)?.name ?? (q.snapshotCustomerName ?? "—");
      const regoFromVehicle = q.vehicleId ? (VEHICLES.find(v => v.id === q.vehicleId)?.rego ?? undefined) : undefined;
      const regoShown = regoFromVehicle ?? q.snapshotRego ?? "—";
      return { ...q, customerName, regoShown };
    });
  }, [rows]);

  const filtered = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    return enriched.filter((r) => {
      const qOk =
        !ql ||
        r.quotationNumber.toLowerCase().includes(ql) ||
        r.customerName.toLowerCase().includes(ql) ||
        r.regoShown.toLowerCase().includes(ql);

      const fOk =
        jobFilter === "all" ||
        (jobFilter === "GotJob" && r.gotJob) ||
        (jobFilter === "NotGotJob" && !r.gotJob);

      return qOk && fOk;
    });
  }, [enriched, q, jobFilter]);

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "total") {
        const diff = a.total - b.total;
        return sortDir === "asc" ? diff : -diff;
      }
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
  }, [filtered, sortKey, sortDir]);

  React.useEffect(() => setPage(1), [q, jobFilter, sortKey, sortDir]);
  const total = sorted.length;
  const start = (page - 1) * pageSize;
  const end = Math.min(total, page * pageSize);
  const paged = sorted.slice(start, end);

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

  const openDelete = (q: Quotation) => {
    setDelTarget(q);
    setDelOpen(true);
  };

  const confirmDelete = () => {
    if (!delTarget) return;
    setRows((prev) => prev.filter((x) => x.id !== delTarget.id));
    const idx = QUOTATIONS.findIndex((x) => x.id === delTarget.id);
    if (idx !== -1) QUOTATIONS.splice(idx, 1);
    toast.success(`Quotation ${delTarget.quotationNumber} deleted`);
    setDelOpen(false);
    setDelTarget(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quotations</h1>
        <Button onClick={() => router.push("/app/quotations/new")}>
          Create Quotation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search quotation #, customer, rego"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={jobFilter} onValueChange={(v) => setJobFilter(v as JobFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Job status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="NotGotJob">Not Got Job</SelectItem>
              <SelectItem value="GotJob">Got Job</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rego</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead className="text-right">Bank charge</TableHead>
              <TableHead className="text-right">Est. Profit</TableHead>
              <TableHead className="text-right">
                <SortButton label="Total" k="total" />
              </TableHead>
              <TableHead>
                <SortButton label="Date" k="date" />
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.quotationNumber}</TableCell>

                <TableCell className="max-w-[220px] truncate">
                  {r.customerName !== "—" ? (
                    r.customerId ? (
                      <Link href={`/app/customers/${r.customerId}`} className="hover:underline">
                        {r.customerName}
                      </Link>
                    ) : (
                      r.customerName
                    )
                  ) : "—"}
                </TableCell>

                <TableCell>{r.regoShown}</TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded px-2 py-0.5 text-xs",
                      r.gotJob
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100"
                        : "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100"
                    )}
                  >
                    {r.gotJob ? "Got Job" : "Not Got Job"}
                  </span>
                </TableCell>

                <TableCell className="text-right">{fmtNZ(r.subtotal)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.gstTotal)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.bankCharge)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.estimatedProfit)}</TableCell>
                <TableCell className="text-right">{fmtNZ(r.total)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.date).toLocaleDateString("en-NZ")}
                </TableCell>

                <TableCell className="w-10">
                  <RowMenu q={r} />
                </TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-sm text-muted-foreground">
                  No quotations found.
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
            <DialogTitle>Delete quotation</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {delTarget ? (
              <>Are you sure you want to delete <b>{delTarget.quotationNumber}</b>?</>
            ) : (
              <>Are you sure you want to delete this quotation?</>
            )}
          </div>
          <Separator className="my-2" />
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowMenu({ q }: { q: Quotation }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/quotations/${q.id}`}>View & Edit</Link>
        </DropdownMenuItem>

        {q.jobId ? (
          <DropdownMenuItem asChild>
            <Link href={`/app/jobs/${q.jobId}`}>View Job</Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href={`/app/jobs/new?fromQuote=${q.id}`}>Create Job</Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="text-red-600"
          onSelect={() => {
            // open confirm dialog via a custom event the page listens to
            const ev = new CustomEvent("openQuoteDelete", { detail: q });
            window.dispatchEvent(ev);
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
