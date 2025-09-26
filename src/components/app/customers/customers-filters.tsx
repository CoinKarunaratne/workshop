// src/components/app/customers/customers-filters.tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CustomersFilterState = {
  q: string;
  onlyWithBalance: boolean;
  withVehicles: "any" | "1+" | "2+";
  recency: "any" | "30d" | "90d"; // last visit window
};

export function CustomersFilters({
  state, setState, onReset, count,
  className,
}: {
  state: CustomersFilterState;
  setState: (next: CustomersFilterState) => void;
  onReset: () => void;
  count: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 md:flex-row md:items-end md:justify-between", className)}>
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4">
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
          <Label>Vehicles</Label>
          <Select
            value={state.withVehicles}
            onValueChange={(v: "any" | "1+" | "2+") => setState({ ...state, withVehicles: v })}
          >
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1+">1+</SelectItem>
              <SelectItem value="2+">2+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Last visit</Label>
          <Select
            value={state.recency}
            onValueChange={(v: "any" | "30d" | "90d") => setState({ ...state, recency: v })}
          >
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 md:col-span-2">
          <Checkbox
            id="bal"
            checked={state.onlyWithBalance}
            onCheckedChange={(v) => setState({ ...state, onlyWithBalance: Boolean(v) })}
          />
          <Label htmlFor="bal" className="text-sm">Only with outstanding balance</Label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 md:w-auto">
        <div className="text-sm text-muted-foreground hidden md:block">{count} customers</div>
        <Button variant="outline" onClick={onReset}>Reset</Button>
      </div>
    </div>
  );
}
