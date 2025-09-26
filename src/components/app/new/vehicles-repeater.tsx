// src/components/app/new/vehicles-repeater.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { RequiredAsterisk, FieldHint } from "./required";

export type VehicleDraft = {
  rego: string;
  make: string;
  model: string;
  year: string;
};

const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

export function VehiclesRepeater({
  value,
  onChange,
  submitted,
}: {
  value: VehicleDraft[];
  onChange: (next: VehicleDraft[]) => void;
  submitted?: boolean;
}) {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const mark = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  const add = () =>
    onChange([
      ...value,
      { rego: "", make: "", model: "", year: YEARS[0] },
    ]);

  const remove = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const update = (idx: number, patch: Partial<VehicleDraft>) => {
    const next = [...value];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const regoKey = (idx: number) => `rego-${idx}`;

  return (
    <div className="space-y-3">
      {value.map((v, idx) => {
        const key = regoKey(idx);
        const invalid = (submitted || touched[key]) && !v.rego.trim();
        return (
          <Card key={idx} className="border-dashed">
            <CardContent className="pt-4">
              <div className="grid gap-4 sm:grid-cols-5">
                {/* Rego (required) */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`rego-${idx}`}>
                    Rego <RequiredAsterisk />
                  </Label>
                  <Input
                    id={`rego-${idx}`}
                    placeholder="ABC123"
                    value={v.rego}
                    onChange={(e) => update(idx, { rego: e.target.value })}
                    onBlur={() => mark(key)}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? `rego-${idx}-err` : undefined}
                  />
                  {invalid && <FieldHint id={`rego-${idx}-err`}>Rego is required.</FieldHint>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`make-${idx}`}>Make</Label>
                  <Input
                    id={`make-${idx}`}
                    placeholder="Toyota"
                    value={v.make}
                    onChange={(e) => update(idx, { make: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`model-${idx}`}>Model</Label>
                  <Input
                    id={`model-${idx}`}
                    placeholder="Corolla"
                    value={v.model}
                    onChange={(e) => update(idx, { model: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={v.year} onValueChange={(y) => update(idx, { year: y })}>
                    <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  disabled={value.length === 1}
                >
                  <Trash2 className="mr-2 size-4" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button type="button" variant="outline" onClick={add}>
        <Plus className="mr-2 size-4" />
        Add another vehicle
      </Button>
    </div>
  );
}
