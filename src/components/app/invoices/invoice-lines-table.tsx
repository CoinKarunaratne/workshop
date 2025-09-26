"use client";

import * as React from "react";
import { ItemPickerDialog } from "@/components/app/invoices/item-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { type InvoiceLine } from "@/lib/dummy-invoices";
import { createEmptyLine } from "@/lib/dummy-invoices";

type Props = {
  lines: InvoiceLine[];
  onChange: (next: InvoiceLine[]) => void;
  showCost?: boolean;      // render Cost column (hidden on PDF by not passing true)
  showControls?: boolean;  // render Add/Pick/Delete buttons
};

export function InvoiceLinesTable({ lines, onChange, showCost = true, showControls = true }: Props) {
  const update = (id: string, patch: Partial<InvoiceLine>) => {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const addEmptyLine = () => onChange([...lines, createEmptyLine()]);
  const removeLine = (id: string) => onChange(lines.filter((l) => l.id !== id));

  // Picker state (global)
  const [pickerOpen, setPickerOpen] = React.useState(false);

  // Append a picked stock item as a new row
  function addPickedItem(item: {
    id?: string;
    name?: string;
    sellPrice?: number;
    buyPrice?: number;
    taxRate?: number;
  }) {
    const newLine: InvoiceLine = {
      ...createEmptyLine(),
      itemId: item.id,
      description: item.name ?? "",
      quantity: 1,
      unitPrice: item.sellPrice ?? 0,
      unitCost: item.buyPrice ?? 0,
      taxRate: item.taxRate,
    };
    onChange([...lines, newLine]);
  }

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[42%]">Description</TableHead>
            <TableHead className="w-[11%]">Qty</TableHead>
            <TableHead className="w-[15%]">Unit Price</TableHead>
            {showCost && <TableHead className="w-[15%]">Cost</TableHead>}
            <TableHead className="w-[15%] text-right">Line Total</TableHead>
            {showControls && <TableHead className="w-[2%]" />}
          </TableRow>
        </TableHeader>

        <TableBody>
          {lines.map((l) => {
            const qty = Number(l.quantity) || 0;
            const unitPrice = Number(l.unitPrice) || 0;
            const computedTotal = qty * unitPrice;

            return (
              <TableRow key={l.id}>
                <TableCell>
                  <Input
                    value={l.description}
                    placeholder="e.g., Labour: Brake pad replacement"
                    onChange={(e) => update(l.id, { description: e.target.value })}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.25"
                    value={String(l.quantity)}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      // keep total if user edited it earlier by adjusting price accordingly
                      if (q > 0 && l.overrideTotal != null) {
                        update(l.id, { quantity: q, unitPrice: l.overrideTotal / q });
                      } else {
                        update(l.id, { quantity: q });
                      }
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={String(l.unitPrice)}
                    onChange={(e) => update(l.id, { unitPrice: Number(e.target.value), overrideTotal: undefined })}
                  />
                </TableCell>

                {showCost && (
                  <TableCell>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      value={String(l.unitCost ?? 0)}
                      onChange={(e) => update(l.id, { unitCost: Number(e.target.value) })}
                    />
                  </TableCell>
                )}

                {/* Editable Line Total: editing back-calculates unit price */}
                <TableCell className="text-right">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={String(l.overrideTotal ?? computedTotal)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      const q = Number(l.quantity) || 0;
                      if (q > 0) {
                        update(l.id, { unitPrice: v / q, overrideTotal: v });
                      } else {
                        // if qty is 0, just store a temp override; when qty>0 we’ll recompute
                        update(l.id, { overrideTotal: v });
                      }
                    }}
                    className="text-right"
                  />
                </TableCell>

                {showControls && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(l.id)}
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}

          {lines.length === 0 && (
            <TableRow>
              <TableCell colSpan={showCost ? 6 : 5} className="text-center text-sm text-muted-foreground">
                No items yet. Add labour, parts, or stock items.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Actions */}
      {showControls && (
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={addEmptyLine}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>

          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Pick from Stock
          </Button>
        </div>
      )}

      {/* Picker dialog */}
      <ItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(item) => addPickedItem(item as any)}
      />
    </div>
  );
}
