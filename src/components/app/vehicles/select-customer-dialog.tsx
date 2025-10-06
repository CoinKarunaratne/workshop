"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listCustomers } from "@/lib/data/customers.db";

export function SelectCustomerDialog({
  onSelect,
}: {
  onSelect: (c: { id: string; name: string }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchCustomers() {
    try {
      setLoading(true);
      setError(null);
      const res = await listCustomers({ q, page: 1, pageSize: 50, sortKey: "lastVisit", sortDir: "desc" });
      const items = res.items.map((c) => ({ id: c.id, name: c.name ?? "" }));
      setRows(items);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (open) fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (open) fetchCustomers();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

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

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No results</div>
            ) : (
              rows.map((c) => (
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
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
