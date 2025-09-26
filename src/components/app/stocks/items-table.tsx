"use client";

import * as React from "react";
import { ITEMS, StockItem } from "@/lib/dummy-items";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ItemFormDialog } from "./item-form";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "name" | "sellPrice" | "buyPrice" | "onHand";
type SortDir = "asc" | "desc";

export function ItemsTable() {
  const [rows, setRows] = React.useState<StockItem[]>(ITEMS);
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<"all" | "part" | "labour" | "misc">("all");
  const [onlyActive, setOnlyActive] = React.useState(true);
  const [sortKey, setSortKey] = React.useState<SortKey>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  // toggle to show prices incl. tax
  const [showInclTax, setShowInclTax] = React.useState(false);
  const priceIncl = (price: number, taxRate?: number) => {
    const r = (taxRate ?? 0) / 100;
    return price * (1 + r);
  };

  // dialog state
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StockItem | null>(null);

  // filter/sort
  const filtered = React.useMemo(() => {
    let data = [...rows];
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      data = data.filter((r) =>
        [r.name, r.sku].filter(Boolean).some((s) => s!.toLowerCase().includes(k))
      );
    }
    if (type !== "all") data = data.filter((r) => r.type === type);
    if (onlyActive) data = data.filter((r) => r.isActive);

    data.sort((a, b) => {
      let va: number | string = "";
      let vb: number | string = "";
      if (sortKey === "name") { va = a.name; vb = b.name; }
      if (sortKey === "sellPrice") { va = a.sellPrice; vb = b.sellPrice; }
      if (sortKey === "buyPrice") { va = a.buyPrice ?? 0; vb = b.buyPrice ?? 0; }
      if (sortKey === "onHand") { va = a.onHand ?? 0; vb = b.onHand ?? 0; }
      if (typeof va === "string") return sortDir === "asc" ? (va as string).localeCompare(vb as string) : (vb as string).localeCompare(va as string);
      return sortDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });

    return data;
  }, [rows, q, type, onlyActive, sortKey, sortDir]);

  const SortButton = ({ label, k }: { label: string; k: SortKey }) => {
    const active = sortKey === k;
    const next: SortDir = active && sortDir === "asc" ? "desc" : "asc";
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("-ml-2 h-8 px-2", active && "text-foreground")}
        onClick={() => { setSortKey(k); setSortDir(next); }}
      >
        {label}
      </Button>
    );
  };

  function openNew() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(item: StockItem) {
    setEditing(item);
    setOpen(true);
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-[260px]" placeholder="Search name or SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant={type === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setType("all")}
          >All</Button>
          <Button
            variant={type === "part" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setType("part")}
          >Parts</Button>
          <Button
            variant={type === "labour" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setType("labour")}
          >Labour</Button>
          <Button
            variant={type === "misc" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setType("misc")}
          >Misc</Button>
        </div>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="onlyActive" checked={onlyActive} onCheckedChange={(v) => setOnlyActive(Boolean(v))} />
            <label htmlFor="onlyActive" className="text-muted-foreground">Only active</label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="inclTax" checked={showInclTax} onCheckedChange={(v) => setShowInclTax(Boolean(v))} />
            <label htmlFor="inclTax" className="text-muted-foreground">Sell price incl. tax</label>
          </div>

          <Button size="sm" variant="outline" onClick={openNew}>New Item</Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortButton label="Name" k="name" /></TableHead>
              <TableHead>Type</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right"><SortButton label="Buy Price" k="buyPrice" /></TableHead>
              <TableHead className="text-right">
                <SortButton label={showInclTax ? "Sell Price (incl.)" : "Sell Price"} k="sellPrice" />
              </TableHead>
              <TableHead className="text-right"><SortButton label="On Hand" k="onHand" /></TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{i.type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{i.sku ?? "—"}</TableCell>

                {/* Buy Price */}
                <TableCell className="text-right">
                  {i.type === "part" && typeof i.buyPrice === "number"
                    ? `$${i.buyPrice.toFixed(2)}`
                    : "—"}
                </TableCell>

                {/* Sell Price (incl. toggle) */}
                <TableCell className="text-right">
                  <div className="leading-tight">
                    <div>
                      {showInclTax
                        ? `$${priceIncl(i.sellPrice, i.taxRate).toFixed(2)}`
                        : `$${i.sellPrice.toFixed(2)}`
                      }
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {showInclTax ? `incl. ${i.taxRate ?? 0}%` : `excl. tax`}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  {i.type === "part" ? (i.onHand ?? 0) : "—"}
                </TableCell>

                <TableCell className="w-10 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(i)}>
                        View &amp; Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          i.isActive = !i.isActive;
                          setRows([...ITEMS]);
                          toast.message(i.isActive ? "Activated" : "Deactivated");
                        }}
                      >
                        {i.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  No items match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ItemFormDialog open={open} onOpenChange={setOpen} initial={editing} />
    </>
  );
}
