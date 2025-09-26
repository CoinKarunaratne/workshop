// src/components/app/quotes/quote-lines-table.tsx
"use client";

import * as React from "react";
import { QuotationLine, createEmptyLine } from "@/lib/dummy-quotations";
import { ItemPickerDialog } from "@/components/app/quotes/item-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

type Props = {
  lines: QuotationLine[];
  onChange: (next: QuotationLine[]) => void;
};

export function QuoteLinesTable({ lines, onChange }: Props) {
  const update = (id: string, patch: Partial<QuotationLine>) => {
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const addEmptyLine = () => onChange([...lines, createEmptyLine()]);
  const removeLine = (id: string) =>
    onChange(lines.filter((l) => l.id !== id));

  // Global picker (not tied to a specific row)
  const [pickerOpen, setPickerOpen] = React.useState(false);

  // Append a picked stock item as a new row
  function addPickedItem(item: {
    id?: string;
    name?: string;
    sellPrice?: number;
    buyPrice?: number;
    taxRate?: number;
  }) {
    const newLine: QuotationLine = {
      ...createEmptyLine(), // gives us a unique id
      itemId: item.id,
      description: item.name ?? "",
      quantity: 1,
      unitPrice: item.sellPrice ?? 0,
      unitCost: item.buyPrice ?? 0, // COST column
      taxRate: item.taxRate,
    };
    onChange([...lines, newLine]);
  }

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[46%]">Description</TableHead>
            <TableHead className="w-[10%]">Qty</TableHead>
            <TableHead className="w-[14%]">Unit Price</TableHead>
            <TableHead className="w-[14%]">Cost</TableHead>
            <TableHead className="w-[16%] text-right">Line Total</TableHead>
            <TableHead className="w-[4%]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {lines.map((l) => {
            const qty = Number(l.quantity) || 0;
            const price = Number(l.unitPrice) || 0;
            const lineTotal = qty * price;

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
                    onChange={(e) =>
                      update(l.id, { quantity: Number(e.target.value) })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.5"
                    value={String(l.unitPrice)}
                    onChange={(e) =>
                      update(l.id, { unitPrice: Number(e.target.value) })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.5"
                    value={String(l.unitCost ?? 0)}
                    onChange={(e) =>
                      update(l.id, { unitCost: Number(e.target.value) })
                    }
                  />
                </TableCell>

                <TableCell className="text-right">
                  ${lineTotal.toFixed(2)}
                </TableCell>

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
              </TableRow>
            );
          })}

          {lines.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-sm text-muted-foreground"
              >
                No items yet. Add labour, parts, or stock items.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addEmptyLine}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Pick from Stock
        </Button>
      </div>

      {/* Global picker dialog */}
      <ItemPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(item) => addPickedItem(item as any)}
      />
    </div>
  );
}
