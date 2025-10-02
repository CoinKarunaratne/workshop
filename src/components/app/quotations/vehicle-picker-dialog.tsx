"use client";

import * as React from "react";
import { VEHICLES, type VehicleRow } from "@/lib/dummy-vehicles";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export function VehiclePickerDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (v: VehicleRow) => void;
}) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return VEHICLES;
    return VEHICLES.filter((v) => {
      const cust = CUSTOMERS.find((c) => c.id === v.customerId);
      return [
        v.rego,
        v.make ?? "",
        v.model ?? "",
        v.year ?? "",
        cust?.name ?? "",
        cust?.email ?? "",
        cust?.phone ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(s);
    });
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick a vehicle</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Search rego, make/model, owner…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="max-h-[50vh] overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rego</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => {
                  const owner = CUSTOMERS.find((c) => c.id === v.customerId);
                  return (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onPick(v)}>
                      <TableCell className="font-medium">{v.rego}</TableCell>
                      <TableCell>{[v.make, v.model].filter(Boolean).join(" ") || "—"}</TableCell>
                      <TableCell>{v.year || "—"}</TableCell>
                      <TableCell>{owner?.name ?? "—"}</TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No matches.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
