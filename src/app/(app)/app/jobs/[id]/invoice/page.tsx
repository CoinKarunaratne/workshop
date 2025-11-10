"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

import {
  getInvoiceByJob,
  upsertInvoice,
  newInvoiceNumber,
  createEmptyLine,
  calcTotals,
  calcBankCharge,
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

import { getJob } from "@/lib/data/jobs.db";
import { getCustomer } from "@/lib/data/customers.db";
import { getVehicle } from "@/lib/data/vehicles.db";
import type { JobRecord } from "@/lib/data/jobs.db";
import type { Customer, Vehicle, JobStatus } from "@/lib/types";

const statusText: Record<string, JobStatus> = {
  draft: "In Workshop",
  in_workshop: "In Workshop",
  waiting_parts: "Waiting Parts",
  waiting_concent: "Waiting for Concent",
  completed: "Completed",
  invoice_sent: "Invoice Sent",
  payment_completed: "Payment completed",
  collected: "Collected",
};

export default function JobInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = React.useState<JobRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null);

  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [mileage, setMileage] = React.useState("");
  const [notesTop, setNotesTop] = React.useState("");
  const [gstEnabled, setGstEnabled] = React.useState(true);
  const [bankChargeEnabled, setBankChargeEnabled] = React.useState(false);
  const [lines, setLines] = React.useState<InvoiceLine[]>([createEmptyLine()]);

  React.useEffect(() => {
    (async () => {
      try {
        const data = await getJob(id);
        setJob(data ?? null);
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message ?? "Failed to load job");
        setJob(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  React.useEffect(() => {
    if (job) {
      getCustomer(job.customerId)
        .then(data => setCustomer(data))
        .catch(err => console.error(err));
      if (job.vehicleId) {
        getVehicle(job.vehicleId)
          .then(data => setVehicle(data))
          .catch(err => console.error(err));
      } else {
        setVehicle(null);
      }
      // Initialize invoice fields based on any existing invoice
      const existing = getInvoiceByJob(job.id);
      setInvoiceNumber(existing?.invoiceNumber ?? newInvoiceNumber());
      setDate(existing?.date ?? new Date().toISOString().slice(0, 10));
      setMileage(existing?.mileage ?? "");
      setNotesTop(existing?.notesTop ?? "");
      setGstEnabled(existing?.gstEnabled ?? true);
      setBankChargeEnabled(existing?.bankChargeEnabled ?? false);
      setLines(existing?.lines ?? [createEmptyLine()]);
    } else {
      setCustomer(null);
      setVehicle(null);
    }
  }, [job]);

  const printRef = React.useRef<HTMLDivElement | null>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: invoiceNumber || "Invoice",
  });

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-sm text-muted-foreground">
        Loading invoice...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-4 sm:p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/jobs")} className="-ml-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>
        <Card className="mt-4 border-destructive/40">
          <CardHeader><CardTitle>Job not found</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The job you’re looking for doesn’t exist.
          </CardContent>
        </Card>
      </div>
    );
  }

  const j = job;
  const jobNo = j.jobNumber ?? j.id.slice(0, 6).toUpperCase();
  const statusLabel = statusText[j.status] ?? "In Workshop";

  const existing = getInvoiceByJob(j.id);
  const { subtotal, taxTotal, total } = calcTotals(lines, gstEnabled);
  const bankCharge = calcBankCharge(total, bankChargeEnabled);
  const grandTotal = Number((total + bankCharge).toFixed(2));

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
      jobId: j.id,
      customerId: customer?.id,
      invoiceNumber: invoiceNumber.trim(),
      date,
      mileage: mileage.trim() || undefined,
      rego: j.vehicleRego || "",
      notesTop: notesTop.trim() || undefined,
      gstEnabled,

      bankChargeEnabled,
      bankCharge,

      lines,
      subtotal: Number(subtotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      total: Number(total.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),

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
          <Button variant="ghost" size="sm" onClick={() => router.push(`/app/jobs/${j.id}`)} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Invoice for {jobNo}</h1>
          <JobStatusBadge status={statusLabel as JobStatus} />
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
          {/* Job Card */}
          <Card>
            <CardHeader><CardTitle>Job Card</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Customer">
                {customer ? (
                  <Link href={`/app/customers/${customer.id}`} className="font-medium hover:underline">
                    {customer.name}
                  </Link>
                ) : (
                  j.customerName ?? "—"
                )}
              </Row>
              {customer?.phone && <Row label="Phone">{customer.phone}</Row>}
              {customer?.email && <Row label="Email">{customer.email}</Row>}
              <Separator />
              <Row label="Vehicle">
                {vehicle
                  ? `${vehicle.make ?? "—"} ${vehicle.model ?? ""} ${vehicle.year ? `(${vehicle.year})` : ""}`.trim()
                  : j.vehicleRego ?? "—"}
              </Row>
              <Row label="Rego">{j.vehicleRego ?? "—"}</Row>
              <Separator />
              <Row label="Job Status">{statusLabel}</Row>

              {/* Date */}
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

              {/* Mileage */}
              <div className="pt-2">
                <Label htmlFor="mileage" className="mb-1 block">Mileage</Label>
                <Input
                  id="mileage"
                  placeholder="e.g. 185,387 km"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                />
              </div>

              {/* Invoice # */}
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

          {/* Right column: Notes + Items + totals */}
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

                {/* Toggles (GST + Bank charge) */}
                <div className="flex flex-wrap items-center justify-end gap-4 print:hidden">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={gstEnabled} onCheckedChange={(v) => setGstEnabled(Boolean(v))} />
                    <span>Apply GST</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={bankChargeEnabled} onCheckedChange={(v) => setBankChargeEnabled(Boolean(v))} />
                    <span>Apply bank charge (2%)</span>
                  </label>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal (ex GST)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">GST{gstEnabled ? "" : " (disabled)"}</span>
                    <span>${taxTotal.toFixed(2)}</span>
                  </div>

                  {/* Show bank charge row only when enabled */}
                  {bankChargeEnabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bank charge (2%)</span>
                      <span>${bankCharge.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex items-center justify-between text-base font-medium">
                    <span>Total</span>
                    {/* Grand total includes bank charge when enabled */}
                    <span>${grandTotal.toFixed(2)}</span>
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
