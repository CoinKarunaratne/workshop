"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function VehiclesHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Vehicles</h1>
      <Button asChild>
        <Link href="/app/vehicles/new">
          <Plus className="mr-2 size-4" />
          New Vehicle
        </Link>
      </Button>
    </div>
  );
}
