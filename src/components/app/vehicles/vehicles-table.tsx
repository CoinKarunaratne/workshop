"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VEHICLES, VehicleRow } from "@/lib/dummy-vehicles";
import { VehiclesFilters, VehiclesFilterState } from "./vehicles-filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PaginationBar } from "@/components/app/jobs/pagination-bar";
import { toast } from "sonner";
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { repoDeleteVehicles } from "@/lib/data/vehicles.client";

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
  

function matches(row: VehicleRow, f: VehiclesFilterState) {
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

function sortRows(rows: VehicleRow[], key: SortKey, dir: SortDir) {
  const sorted = [...rows].sort((a, b) => {
    if (key === "year") return (parseInt(a.year || "0") - parseInt(b.year || "0"));
    if (key === "lastService")
      return new Date(a.lastService || 0).getTime() - new Date(b.lastService || 0).getTime();
    return a.rego.localeCompare(b.rego);
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function VehiclesTable() {
  const [filter, setFilter] = React.useState<VehiclesFilterState>(initialFilter);
  const [sortKey, setSortKey] = React.useState<SortKey>("rego");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<VehicleRow | null>(null);

  const dataRaw = React.useMemo(() => VEHICLES.filter((v) => matches(v, filter)), [filter]);
  const data = React.useMemo(() => sortRows(dataRaw, sortKey, sortDir), [dataRaw, sortKey, sortDir]);

  React.useEffect(() => setPage(1), [filter, sortKey, sortDir]);

  const total = data.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, page * pageSize);
  const paged = data.slice(startIndex, endIndex);

  const router = useRouter();

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
    await repoDeleteVehicles([toDelete.id]); // demo stub
    toast.success(`Deleted ${toDelete.rego} (demo)`);
    setConfirmOpen(false);
    setToDelete(null);
    // no real refetch since dummy; in Supabase we’d re-query here
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
            {paged.map((v) => (
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
            ))}
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

function RowMenu({ row, onDelete }: { row: VehicleRow; onDelete: () => void }) {
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
