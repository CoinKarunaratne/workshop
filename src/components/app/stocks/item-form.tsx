"use client";

import * as React from "react";
import { StockItem, createBlankItem, upsertItem } from "@/lib/dummy-items";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: StockItem | null;
};

export function ItemFormDialog({ open, onOpenChange, initial }: Props) {
  const [item, setItem] = React.useState<StockItem>(initial ?? createBlankItem());

  React.useEffect(() => {
    setItem(initial ?? createBlankItem());
  }, [initial, open]);

  const isLabour = item.type === "labour";
  const isPart   = item.type === "part";

  function save() {
    if (!item.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (isNaN(item.sellPrice) || item.sellPrice < 0) {
      toast.error("Sell price must be a positive number");
      return;
    }

    const next = { ...item, updatedAt: new Date().toISOString() };
    upsertItem(next);
    toast.success(`Item ${item.name || "(unnamed)"} saved`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Item" : "New Item"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={item.sku ?? ""} onChange={(e) => setItem({ ...item, sku: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={item.type}
                onValueChange={(v) => setItem({ ...item, type: v as any, unit: v === "labour" ? "hr" : item.unit ?? "ea" })}
              >
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="part">Part (stocked)</SelectItem>
                  <SelectItem value="labour">Labour (service)</SelectItem>
                  <SelectItem value="misc">Misc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" value={item.unit ?? ""} onChange={(e) => setItem({ ...item, unit: e.target.value })} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sellPrice">Sell Price *</Label>
              <Input
                id="sellPrice"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={String(item.sellPrice)}
                onChange={(e) => setItem({ ...item, sellPrice: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="taxRate">Tax %</Label>
              <Input
                id="taxRate"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={String(item.taxRate ?? 0)}
                onChange={(e) => setItem({ ...item, taxRate: Number(e.target.value) })}
              />
            </div>

            {isPart && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="onHand">On Hand</Label>
                  <Input
                    id="onHand"
                    type="number"
                    min={0}
                    step="1"
                    value={String(item.onHand ?? 0)}
                    onChange={(e) => setItem({ ...item, onHand: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reorder">Reorder Level</Label>
                  <Input
                    id="reorder"
                    type="number"
                    min={0}
                    step="1"
                    value={String(item.reorderLevel ?? 0)}
                    onChange={(e) => setItem({ ...item, reorderLevel: Number(e.target.value) })}
                  />
                </div>
              </>
            )}
          </div>

          {isPart && (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="buyPrice">Buy Price</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={String(item.buyPrice ?? 0)}
                  onChange={(e) => setItem({ ...item, buyPrice: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={item.supplier ?? ""}
                  onChange={(e) => setItem({ ...item, supplier: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
