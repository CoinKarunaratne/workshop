"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getQuotationById,
  upsertQuotation,
  calcQuotationTotals,
  type Quotation,
} from "@/lib/dummy-quotations";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { VEHICLES } from "@/lib/dummy-vehicles";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceLinesTable } from "@/components/app/invoices/invoice-lines-table";
import { ArrowLeft } from "lucide-react";

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const existing = getQuotationById(id);
  if (!existing) {
    return (
      <div className="p-4 sm:p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/quotations")} className="-ml-2">
          <ArrowLeft className="mr-2 size-4" />
          Back to Quotations
        </Button>
        <Card className="mt-4 border-destructive/40">
          <CardHeader><CardTitle>Quotation not found</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The quotation you’re looking for doesn’t exist.
          </CardContent>
        </Card>
      </div>
    );
  }

  const [q, setQ] = React.useState<Quotation>({ ...existing });

  // totals
  const totals = React.useMemo(
    () => calcQuotationTotals(q.lines, q.gstEnabled, q.bankChargeEnabled),
    [q.lines, q.gstEnabled, q.bankChargeEnabled]
  );

  function save() {
    const updated: Quotation = {
      ...q,
      subtotal: Number(totals.subtotal.toFixed(2)),
      gstTotal: Number(totals.gstTotal.toFixed(2)),
      bankCharge: Number(totals.bankCharge.toFixed(2)),
      total: Number(totals.total.toFixed(2)),
      estimatedProfit: Number(totals.estimatedProfit.toFixed(2)),
      updatedAt: new Date().toISOString(),
    };
    upsertQuotation(updated);
    setQ(updated);
    toast.success("Quotation saved");
  }

  const customerName =
    q.customerId
      ? (CUSTOMERS.find(c => c.id === q.customerId)?.name ?? q.snapshotCustomerName ?? "—")
      : (q.snapshotCustomerName ?? "—");

  const vehicleRego =
    q.vehicleId
      ? (VEHICLES.find(v => v.id === q.vehicleId)?.rego ?? q.snapshotRego ?? "—")
      : (q.snapshotRego ?? "—");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/quotations")} className="-ml-2">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">{q.quotationNumber}</h1>
        </div>
        <div className="flex items-center gap-2">
          {q.jobId ? (
            <Button asChild variant="outline">
              <Link href={`/app/jobs/${q.jobId}`}>View Job</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={`/app/jobs/new?fromQuote=${q.id}`}>Create Job</Link>
            </Button>
          )}

          <Button onClick={save}>Save</Button>
        </div>
      </div>

      <Separator />

      {/* Meta */}
      <Card>
        <CardHeader><CardTitle>Meta</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Quotation #</Label>
            <Input value={q.quotationNumber} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={q.date}
              onChange={(e) => setQ({ ...q, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Customer</Label>
            <Input readOnly value={customerName} />
          </div>
          <div className="space-y-2">
            <Label>Rego</Label>
            <Input readOnly value={vehicleRego} />
          </div>

          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={q.notesTop ?? ""}
              onChange={(e) => setQ({ ...q, notesTop: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={q.gstEnabled}
                onCheckedChange={(v) => setQ({ ...q, gstEnabled: Boolean(v) })}
              />
              <span>Apply GST</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={q.bankChargeEnabled}
                onCheckedChange={(v) => setQ({ ...q, bankChargeEnabled: Boolean(v) })}
              />
              <span>Bank charge 2%</span>
            </label>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <Checkbox
                checked={q.gotJob}
                onCheckedChange={(v) => setQ({ ...q, gotJob: Boolean(v) })}
              />
              <span>Got Job</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Lines */}
      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <InvoiceLinesTable
            lines={q.lines as any}
            onChange={(next) => setQ({ ...q, lines: next as any })}
            showCost
            showControls
          />

          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Subtotal (ex GST)</div>
              <div className="font-medium">${totals.subtotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">GST</div>
              <div className="font-medium">${totals.gstTotal.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Bank charge {q.bankChargeEnabled ? "(2%)" : "(off)"}</div>
              <div className="font-medium">${totals.bankCharge.toFixed(2)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Estimated profit</div>
              <div className="font-medium">${totals.estimatedProfit.toFixed(2)}</div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Last updated {new Date(q.updatedAt).toLocaleString("en-NZ")}
            </div>
            <div className="text-base font-semibold">Total: ${totals.total.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
