"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type CustomersFilterState = {
  q: string;
  onlyWithBalance: boolean;
  recency: "any" | "30d" | "90d";
};

export function CustomersFilters({
  state, setState, onReset, count, className,
}: {
  state: CustomersFilterState;
  setState: (next: CustomersFilterState) => void;
  onReset: () => void; // kept to avoid breaking callers
  count: number;       // kept to avoid breaking callers
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Name, email, phone"
            value={state.q}
            onChange={(e) => setState({ ...state, q: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label>Last visit</Label>
          <select
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            value={state.recency}
            onChange={(e) =>
              setState({ ...state, recency: e.target.value as CustomersFilterState["recency"] })
            }
          >
            <option value="any">Any time</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        <div className="flex items-center gap-2 md:col-span-3">
          <Checkbox
            id="bal"
            checked={state.onlyWithBalance}
            onCheckedChange={(v) => setState({ ...state, onlyWithBalance: Boolean(v) })}
          />
          <Label htmlFor="bal" className="text-sm">Only with outstanding balance</Label>
        </div>
      </div>
      {/* right-side count + Reset removed */}
    </div>
  );
}
