"use client";

import * as React from "react";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SelectCustomerDialog({
  onSelect,
}: {
  onSelect: (c: { id: string; name: string }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  const filtered = CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">Pick customer</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Select customer</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search customers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-3"
        />
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {filtered.map((c) => (
            <Button
              key={c.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                onSelect({ id: c.id, name: c.name });
                setOpen(false);
              }}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
