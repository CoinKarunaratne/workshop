// src/app/(app)/jobs/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// src/app/(app)/jobs/[id]/page.tsx (or your path)
import { JOBS, type JobRow, type JobStatus } from "@/lib/dummy-jobs";
import { CUSTOMERS, type CustomerRow } from "@/lib/dummy-customers";
import { VEHICLES, type VehicleRow } from "@/lib/dummy-vehicles";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getQuotationByJob } from "@/lib/dummy-quotations";
import { QuotationSummary } from "@/components/app/quotes/quotation-summary";

import { JobStatusBadge } from "@/components/app/jobs/job-status";
import { ArrowLeft } from "lucide-react";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const job = JOBS.find((j) => j.id === id);

  // Not found guard
  if (!job) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/jobs")} className="-ml-1">
            <ArrowLeft className="mr-2 size-4" />
            Back to Jobs
          </Button>
        </div>
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle>Job not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The job you’re looking for doesn’t exist or may have been removed.
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ From here on, use a narrowed alias so closures don’t complain
  const j: JobRow = job;
  const existingQuote = getQuotationByJob(j.id) ?? null;

  // Lookups
  const vehicle: VehicleRow | undefined = VEHICLES.find(
    (v) => v.rego.toLowerCase() === j.rego.toLowerCase()
  );

  const customer: CustomerRow | undefined =
    (vehicle && CUSTOMERS.find((c) => c.id === vehicle.customerId)) ||
    CUSTOMERS.find((c) => c.name.trim().toLowerCase() === j.customer.trim().toLowerCase());

  // Handlers can safely reference `j`
  function onComplete() {
    toast.success(`Job ${j.number} marked completed (demo)`);
  }
  function onInvoice() {
    toast.success(`Created invoice for ${j.number} (demo)`);
    // router.push(`/app/invoices/new?jobId=${j.id}`)
  }
  function onDelete() {
    toast.error(`Job ${j.number} deleted (demo)`);
    router.push("/app/jobs");
  }

  return (
<div className="space-y-6 p-4 sm:p-6">
  {/* Top bar */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="sm" onClick={() => router.push("/app/jobs")} className="-ml-2">
        <ArrowLeft className="mr-2 size-4" />
        Back
      </Button>
      <h1 className="text-xl font-semibold tracking-tight">{j.number}</h1>
      <JobStatusBadge status={j.status as JobStatus} />
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={onComplete}>Complete</Button>
      <Button
        variant="outline"
        onClick={onInvoice}
        disabled={j.status !== "Completed"}       // gate invoicing until Completed
        aria-disabled={j.status !== "Completed"}
        title={j.status !== "Completed" ? "Finish the job to generate an invoice" : undefined}
      >
        Invoice
      </Button>
      <Button variant="destructive" onClick={onDelete}>Delete</Button>
    </div>
  </div>

  <Separator />

  {/* Tabs: Overview | Quotation */}
  <Tabs defaultValue="overview" className="space-y-4">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="quotation">Quotation</TabsTrigger>
    </TabsList>

    {/* === OVERVIEW (your existing two cards + timeline) === */}
    <TabsContent value="overview" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Status"><JobStatusBadge status={j.status as JobStatus} /></Row>
            <Row label="Technician">{j.technician}</Row>
            <Row label="Updated">{new Date(j.updatedAt).toLocaleString("en-NZ")}</Row>
            <Row label="Amount"><span className="font-medium">${j.amount.toFixed(2)}</span></Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Customer & Vehicle</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Customer">
              {customer ? (
                <Link href={`/app/customers/${customer.id}`} className="font-medium hover:underline">
                  {customer.name}
                </Link>
              ) : (
                j.customer
              )}
            </Row>
            {customer?.email && <Row label="Email">{customer.email}</Row>}
            {customer?.phone && <Row label="Phone">{customer.phone}</Row>}
            <Separator className="my-2" />
            <Row label="Rego">{j.rego}</Row>
            <Row label="Vehicle">
              {vehicle
                ? `${vehicle.make ?? "—"} ${vehicle.model ?? ""} ${vehicle.year ? `(${vehicle.year})` : ""}`.trim()
                : "—"}
            </Row>
            {vehicle?.lastService && (
              <Row label="Last service">
                {new Date(vehicle.lastService).toLocaleDateString("en-NZ")}
              </Row>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <ul className="space-y-2">
            <li>📌 Job {j.number} created (date unknown in dummy data)</li>
            <li>👷 Assigned to {j.technician}</li>
            <li>🔧 Status now: {j.status}</li>
            <li>🧾 Invoice: {j.amount > 0 ? "Pending/Unpaid" : "N/A"}</li>
            <li>⏱️ Last update: {new Date(j.updatedAt).toLocaleString("en-NZ")}</li>
          </ul>
        </CardContent>
      </Card>
    </TabsContent>

    {/* === QUOTATION tab (summary + CTA) === */}
    <TabsContent value="quotation" className="space-y-4">
      <QuotationSummary
        jobId={j.id}
        quote={
          existingQuote
            ? {
                number: existingQuote.number,
                status: existingQuote.status,
                date: existingQuote.date,
                subtotal: existingQuote.subtotal,
                taxTotal: existingQuote.taxTotal,
                total: existingQuote.total,
              }
            : null
        }
      />
    </TabsContent>
  </Tabs>
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
