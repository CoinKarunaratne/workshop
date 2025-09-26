"use client";

import * as React from "react";
import { ITEMS, type StockItem } from "@/lib/dummy-items";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (item: StockItem) => void;
};

export function ItemPickerDialog({ open, onOpenChange, onPick }: Props) {
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<"all" | "part" | "labour" | "misc">("all");

  const results = React.useMemo(() => {
    let data = ITEMS.filter((i) => i.isActive);
    if (type !== "all") data = data.filter((i) => i.type === type);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      data = data.filter((i) => [i.name, i.sku].filter(Boolean).some((s) => s!.toLowerCase().includes(k)));
    }
    return data.slice(0, 50);
  }, [q, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pick an item</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="w-[260px]"
            placeholder="Search by name or SKU…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="ml-auto flex items-center gap-2 text-sm">
            <Button variant={type === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setType("all")}>All</Button>
            <Button variant={type === "part" ? "secondary" : "ghost"} size="sm" onClick={() => setType("part")}>Parts</Button>
            <Button variant={type === "labour" ? "secondary" : "ghost"} size="sm" onClick={() => setType("labour")}>Labour</Button>
            <Button variant={type === "misc" ? "secondary" : "ghost"} size="sm" onClick={() => setType("misc")}>Misc</Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{i.type}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{i.sku ?? "—"}</TableCell>
                  <TableCell className="text-right">${i.sellPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{i.type === "part" ? (i.onHand ?? 0) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => { onPick(i); onOpenChange(false); }}>
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
