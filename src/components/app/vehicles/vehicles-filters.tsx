"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type VehiclesFilterState = {
  q: string;
  wofStatus: "any" | "valid" | "expired";
  serviceStatus: "any" | "due" | "due30";
};

export function VehiclesFilters({
  state, setState, className,
}: {
  state: VehiclesFilterState;
  setState: (next: VehiclesFilterState) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid w-full grid-cols-1 gap-3 md:grid-cols-3", className)}>
      <div className="space-y-1 md:col-span-1">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          placeholder="Rego, make, model, owner"
          value={state.q}
          onChange={(e) => setState({ ...state, q: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <Label>WOF status</Label>
        <Select
          value={state.wofStatus}
          onValueChange={(v: "any" | "valid" | "expired") => setState({ ...state, wofStatus: v })}
        >
          <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="valid">Valid</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Service status</Label>
        <Select
          value={state.serviceStatus}
          onValueChange={(v: "any" | "due" | "due30") => setState({ ...state, serviceStatus: v })}
        >
          <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="due">Due now</SelectItem>
            <SelectItem value="due30">Due in next 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
