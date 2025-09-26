"use client"

import { ItemsHeader } from "@/components/app/stocks/items-header";
import { ItemsTable } from "@/components/app/stocks/items-table";
import * as React from "react";

export default function ItemsPage() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <ItemsHeader />
      {/* We forward the "open" intent by toggling a key so ItemsTable opens its dialog. */}
      <div key={String(open)} className="space-y-4">
        <ItemsTable />
      </div>
    </div>
  );
}
