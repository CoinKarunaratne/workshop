// src/components/app/dashboard-header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, Search } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search rego, job #, customer" className="pl-8" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link href="/app/jobs/new">Job</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/app/customers/new">Customer</Link></DropdownMenuItem>
          
            {/* later: /app/invoices/new, /app/bookings/new */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
