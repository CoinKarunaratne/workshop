"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VehiclesFilters, VehiclesFilterState } from "./vehicles-filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationBar } from "@/components/app/jobs/pagination-bar";
import { toast } from "sonner";
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ✅ Supabase-backed repo
import { listVehicles, deleteVehicles, type VehiclesPage } from "@/lib/data/vehicles.db";
import type { Vehicle } from "@/lib/types";

const initialFilter: VehiclesFilterState = {
  q: "",
  wofStatus: "any",
  serviceStatus: "any",
};

type SortKey = "rego" | "year" | "lastService";
type SortDir = "asc" | "desc";

function fmtDate(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-NZ") : "—";
}

// client-side filters that aren’t yet pushed to SQL
function matches(row: Vehicle, f: VehiclesFilterState) {
  const q = f.q.toLowerCase().trim();
  const qOk =
    !q ||
    [row.rego, row.make ?? "", row.model ?? "", row.ownerName ?? ""].some((v) =>
      v.toLowerCase().includes(q)
    );

  // WOF status
  let wofOk = true;
  if (f.wofStatus !== "any") {
    const expired = row.wofExpiry ? new Date(row.wofExpiry).getTime() < Date.now() : false;
    wofOk = f.wofStatus === "expired" ? expired : !expired;
  }

  // Service status
  let svcOk = true;
  if (f.serviceStatus !== "any") {
    const dueTs = row.serviceDue ? new Date(row.serviceDue).getTime() : NaN;
    const now = Date.now();
    const in30 = now + 30 * 24 * 60 * 60 * 1000;
    if (f.serviceStatus === "due") {
      svcOk = Number.isFinite(dueTs) && dueTs < now;
    } else if (f.serviceStatus === "due30") {
      svcOk = Number.isFinite(dueTs) && dueTs >= now && dueTs <= in30;
    }
  }

  return qOk && wofOk && svcOk;
}

function sortRows(rows: Vehicle[], key: SortKey, dir: SortDir) {
  const sorted = [...rows].sort((a, b) => {
    if (key === "year") return (parseInt(a.year || "0") - parseInt(b.year || "0"));
    if (key === "lastService")
      return new Date(a.lastService || 0).getTime() - new Date(b.lastService || 0).getTime();
    return a.rego.localeCompare(b.rego);
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function VehiclesTable() {
  const router = useRouter();

  // UI state
  const [filter, setFilter] = React.useState<VehiclesFilterState>(initialFilter);
  const [sortKey, setSortKey] = React.useState<SortKey>("rego");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<Vehicle | null>(null);

  // Data (fetched from Supabase)
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [rowsAll, setRowsAll] = React.useState<Vehicle[]>([]);

  async function fetchAll() {
    try {
      setLoading(true);
      setErrorMsg(null);
      // For now: fetch a big page and do client-side WOF/service filtering.
      // Later we can push more filters to SQL and paginate there.
      const res: VehiclesPage = await listVehicles({
        q: filter.q,
        sortKey,
        sortDir,
        page: 1,
        pageSize: 1000,
      });
      setRowsAll(res.items);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "Failed to load vehicles");
      toast.error(err?.message ?? "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.q, sortKey, sortDir]);

  // recompute when non-SQL filters change
  React.useEffect(() => {
    setPage(1);
  }, [filter, sortKey, sortDir]);

  const filtered = React.useMemo(() => rowsAll.filter((v) => matches(v, filter)), [rowsAll, filter]);
  const sorted = React.useMemo(() => sortRows(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, page * pageSize);
  const paged = sorted.slice(startIndex, endIndex);

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

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteVehicles([toDelete.id]);
      toast.success(`Deleted ${toDelete.rego}`);
      setConfirmOpen(false);
      setToDelete(null);
      await fetchAll(); // refresh from DB
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to delete vehicle");
    }
  }

  return (
    <div className="space-y-4">
      <VehiclesFilters state={filter} setState={setFilter} />

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rego</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead><SortButton label="Year" k="year" /></TableHead>
              <TableHead><SortButton label="Last service" k="lastService" /></TableHead>
              <TableHead>WOF Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8}>Loading…</TableCell></TableRow>
            ) : errorMsg ? (
              <TableRow><TableCell colSpan={8} className="text-destructive">{errorMsg}</TableCell></TableRow>
            ) : paged.length === 0 ? (
              <TableRow><TableCell colSpan={8}>No vehicles found.</TableCell></TableRow>
            ) : (
              paged.map((v) => (
                <TableRow
                  key={v.id}
                  className="hover:bg-muted/40"
                  onClick={() => router.push(`/app/vehicles/${v.id}/edit`)}
                >
                  <TableCell>{v.rego}</TableCell>
                  <TableCell>{v.ownerName}</TableCell>
                  <TableCell>{v.make}</TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>{v.year}</TableCell>
                  <TableCell>{fmtDate(v.lastService)}</TableCell>
                  <TableCell>{fmtDate(v.wofExpiry)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <RowMenu
                      row={v}
                      onDelete={() => {
                        setToDelete(v);
                        setConfirmOpen(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
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

      {/* Delete confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete vehicle</DialogTitle>
          </DialogHeader>
          <div className="text-sm">
            {toDelete ? (
              <>Are you sure you want to delete <b>{toDelete.rego}</b> ({toDelete.ownerName}) from records?</>
            ) : null}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>No</Button>
            <Button variant="destructive" onClick={confirmDelete}>Yes, delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowMenu({ row, onDelete }: { row: Vehicle; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/app/vehicles/${row.id}/edit`}>
            <Pencil className="mr-2 size-4" /> Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete}>
          <Trash className="mr-2 size-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
