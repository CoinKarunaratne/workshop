"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export type VehicleDraft = { 
  rego: string; 
  make?: string; 
  model?: string; 
  year?: string;
  mileage?: string;
  wofExpiry?: string;
  serviceDue?: string;
};

export function VehiclesRepeater({
  items, onChange, className,
}: { items: VehicleDraft[]; onChange: (next: VehicleDraft[]) => void; className?: string }) {
  const set = (i: number, k: keyof VehicleDraft, v: string) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };
  const add = () => onChange([...items, { 
    rego: "", make: "", model: "", year: "", 
    mileage: "", wofExpiry: "", serviceDue: "" 
  }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">Vehicles</div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-2 size-4" /> Add vehicle
        </Button>
      </div>

      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            Add at least one vehicle for this customer.
          </div>
        )}

        {items.map((v, i) => (
          <div key={i} className="rounded-md border p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">Vehicle {i + 1}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => remove(i)}
                disabled={items.length <= 1}
              >
                <Trash2 className="mr-1 size-4" /> Remove
              </Button>
            </div>
            {/* Vehicle fields: first row */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor={`rego-${i}`}>Rego</Label>
                <Input
                  id={`rego-${i}`}
                  placeholder="ABC123"
                  value={v.rego}
                  onChange={(e) => set(i, "rego", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`make-${i}`}>Make</Label>
                <Input
                  id={`make-${i}`}
                  placeholder="Toyota"
                  value={v.make ?? ""}
                  onChange={(e) => set(i, "make", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`model-${i}`}>Model</Label>
                <Input
                  id={`model-${i}`}
                  placeholder="Corolla"
                  value={v.model ?? ""}
                  onChange={(e) => set(i, "model", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`year-${i}`}>Year</Label>
                <Input
                  id={`year-${i}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 2020"
                  value={v.year ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    // allow only digits, max length 4
                    if (/^\d*$/.test(val) && val.length <= 4) {
                      set(i, "year", val);
                    }
                  }}
                />
              </div>
            </div>
            {/* Vehicle fields: second row */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor={`mileage-${i}`}>Mileage (km)</Label>
                <Input
                  id={`mileage-${i}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 120000"
                  value={v.mileage ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    // allow digits only (no fixed length)
                    if (/^\d*$/.test(val)) {
                      set(i, "mileage", val);
                    }
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`wof-${i}`}>WOF Expiry</Label>
                <Input
                  id={`wof-${i}`}
                  type="date"
                  value={v.wofExpiry ?? ""}
                  onChange={(e) => set(i, "wofExpiry", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`service-${i}`}>Service Due</Label>
                <Input
                  id={`service-${i}`}
                  type="date"
                  value={v.serviceDue ?? ""}
                  onChange={(e) => set(i, "serviceDue", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
