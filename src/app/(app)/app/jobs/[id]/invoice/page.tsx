"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

import { JOBS, type JobRow } from "@/lib/dummy-jobs";
import { VEHICLES, type VehicleRow } from "@/lib/dummy-vehicles";
import { CUSTOMERS, type CustomerRow } from "@/lib/dummy-customers";

import {
  getInvoiceByJob,
  upsertInvoice,
  newInvoiceNumber,
  createEmptyLine,
  calcTotals,
  type Invoice,
  type InvoiceLine,
} from "@/lib/dummy-invoices";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { InvoiceLinesTable } from "@/components/app/invoices/invoice-lines-table";
import { ArrowLeft, Download } from "lucide-react";
import { JobStatusBadge } from "@/components/app/jobs/job-status";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function JobInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const job = JOBS.find((j) => j.id === id);
  if (!job) {
    return (
      <div className="p-4 sm:p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/jobs")} className="-ml-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>
        <Card className="mt-4 border-destructive/40">
          <CardHeader><CardTitle>Job not found</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">The job you’re looking for doesn’t exist.</CardContent>
        </Card>
      </div>
    );
  }
  const jobOk: JobRow = job;

  // Resolve vehicle & customer (rego → vehicle → customer; fallback by name)
  const vehicle: VehicleRow | undefined =
    VEHICLES.find((v) => v.rego.toLowerCase() === jobOk.rego.toLowerCase());
  const customer: CustomerRow | undefined =
    (vehicle && CUSTOMERS.find((c) => c.id === vehicle.customerId)) ||
    CUSTOMERS.find((c) => c.name.trim().toLowerCase() === jobOk.customer.trim().toLowerCase());

  // Load existing invoice or seed new
  const existing = getInvoiceByJob(jobOk.id);
  const [invoiceNumber, setInvoiceNumber] = React.useState(existing?.invoiceNumber ?? newInvoiceNumber());
  const [date, setDate] = React.useState(existing?.date ?? new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = React.useState(existing?.mileage ?? "");
  const [notesTop, setNotesTop] = React.useState(existing?.notesTop ?? "");
  const [gstEnabled, setGstEnabled] = React.useState<boolean>(existing?.gstEnabled ?? true);

  const [lines, setLines] = React.useState<InvoiceLine[]>(existing?.lines ?? [createEmptyLine()]);
  const { subtotal, taxTotal, total } = calcTotals(lines, gstEnabled);

  // Print only invoice body
  const printRef = React.useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoiceNumber || "Invoice",
  });

  function onSave() {
    if (!invoiceNumber.trim()) {
      toast.error("Invoice number is required.");
      return;
    }
    if (lines.length === 0 || lines.every((l) => !l.description.trim())) {
      toast.error("Add at least one line item before saving.");
      return;
    }

    const inv: Invoice = {
      id: existing?.id ?? crypto.randomUUID(),
      jobId: jobOk.id,
      customerId: customer?.id,
      invoiceNumber: invoiceNumber.trim(),
      date,
      mileage: mileage?.trim() || undefined,
      rego: jobOk.rego,
      notesTop: notesTop?.trim() || undefined,
      gstEnabled,
      lines,
      subtotal: Number(subtotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      total: Number(total.toFixed(2)),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertInvoice(inv);
    toast.success(`Invoice ${inv.invoiceNumber} saved`);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/app/jobs/${jobOk.id}`)} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Invoice for {jobOk.number}</h1>
          <JobStatusBadge status={jobOk.status as any} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Download invoice
          </Button>
          <Button onClick={onSave}>Save Invoice</Button>
        </div>
      </div>

      <Separator className="print:hidden" />

      {/* Printable area */}
      <div ref={printRef} className="space-y-4">
        {/* Print header (company) */}
        <div className="hidden print:block">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">Your Garage Name</div>
              <div className="text-sm text-muted-foreground">123 Workshop Rd, Auckland · +64 21 000 000</div>
              <div className="text-sm text-muted-foreground">info@garage.co.nz</div>
            </div>
            <div className="h-12 w-24 rounded bg-muted" />
          </div>
          <Separator className="my-3" />
        </div>

        {/* Two-column workspace: Job Card (left) + Invoice meta/lines (right) */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Job Card (restored design) */}
          <Card>
            <CardHeader><CardTitle>Job Card</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Customer">
                {customer ? (
                  <Link href={`/app/customers/${customer.id}`} className="font-medium hover:underline">
                    {customer.name}
                  </Link>
                ) : (
                  jobOk.customer
                )}
              </Row>
              {customer?.phone && <Row label="Phone">{customer.phone}</Row>}
              {customer?.email && <Row label="Email">{customer.email}</Row>}
              <Separator />
              <Row label="Vehicle">
                {vehicle
                  ? `${vehicle.make ?? "—"} ${vehicle.model ?? ""} ${vehicle.year ? `(${vehicle.year})` : ""}`.trim()
                  : jobOk.rego}
              </Row>
              <Row label="Rego">{jobOk.rego}</Row>
              <Separator />
              <Row label="Job Status">{jobOk.status}</Row>

              {/* Date (editable, for migrated/backdated records) */}
              <div className="pt-2">
                <Label htmlFor="inv-date-job" className="mb-1 block">Date</Label>
                <Input
                  id="inv-date-job"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Defaults to today. Editable so you can backdate migrated records.
                </p>
              </div>

              {/* Mileage (kept based on your invoice requirements) */}
              <div className="pt-2">
                <Label htmlFor="mileage" className="mb-1 block">Mileage</Label>
                <Input
                  id="mileage"
                  placeholder="e.g. 185,387 km"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
              </div>

              {/* Invoice # (required) */}
              <div className="pt-2">
                <Label htmlFor="inv-no" className="mb-1 block">Invoice #</Label>
                <Input
                  id="inv-no"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Right column: Notes (top) + Items + totals */}
          <div className="space-y-4">
            {/* Notes (TOP) */}
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Visible to customer. E.g. work summary, warnings, etc."
                  value={notesTop}
                  onChange={(e) => setNotesTop(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Items + totals */}
            <Card>
              <CardHeader><CardTitle>Items</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <InvoiceLinesTable
                  lines={lines}
                  onChange={setLines}
                  showCost
                  showControls
                />

                <div className="flex items-center justify-end print:hidden">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={gstEnabled} onCheckedChange={(v) => setGstEnabled(Boolean(v))} />
                    <span>Apply GST</span>
                  </label>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal (ex GST)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">GST{gstEnabled ? "" : " (disabled)"}</span>
                    <span>${taxTotal.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-base font-medium">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right">{children}</span>
    </div>
  );
}
