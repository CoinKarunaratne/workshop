// src/components/app/customers/customers-header.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function CustomersHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">Customers</h1>
      <Button asChild>
        <Link href="/app/customers/new">
          <Plus className="mr-2 size-4" />
          New Customer
        </Link>
      </Button>
    </div>
  );
}
