"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { JobStatusBadge } from "@/components/app/jobs/job-status";
import { ArrowLeft } from "lucide-react";
import { getInvoiceByJob } from "@/lib/dummy-invoices";

import { getJob, updateJob, type JobRecord } from "@/lib/data/jobs.db";
import { getCustomer } from "@/lib/data/customers.db";
import { getVehicle } from "@/lib/data/vehicles.db";
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

export default function JobDetailPage() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = React.useState<JobRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null);

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
    } else {
      setCustomer(null);
      setVehicle(null);
    }
  }, [job]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-sm text-muted-foreground">
        Loading job details...
      </div>
    );
  }

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
          <CardHeader><CardTitle>Job not found</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The job you’re looking for doesn’t exist or may have been removed.
          </CardContent>
        </Card>
      </div>
    );
  }

  const j = job;  // narrowed alias
  const jobNo = j.jobNumber ?? j.id.slice(0, 6).toUpperCase();
  const statusLabel = statusText[j.status] ?? "In Workshop";
  const amount = typeof j.estimatedTotal === "number" ? j.estimatedTotal : 0;

  async function onComplete() {
    try {
      await updateJob(j.id, { status: "completed" });
      setJob(prev => (prev ? { ...prev, status: "completed" } : prev));
      toast.success(`Job ${jobNo} marked completed`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to mark job complete");
    }
  }

  const existingInvoice = getInvoiceByJob(j.id);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/jobs")} className="-ml-2">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">{jobNo}</h1>
          <JobStatusBadge status={statusLabel as JobStatus} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onComplete}>Complete</Button>
          <Button
            asChild
            variant="outline"
            disabled={j.status !== "completed"}
            aria-disabled={j.status !== "completed"}
            title={j.status !== "completed" ? "Finish the job to generate an invoice" : undefined}
          >
            <Link href={`/app/jobs/${j.id}/invoice`}>Invoice</Link>
          </Button>

          {/* Confirm Delete */}
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete job {jobNo}?</DialogTitle>
                <DialogDescription>
                  This will permanently remove the job record. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setConfirmOpen(false);
                    // Demo behavior: toast + navigate.
                    // (Real deletion will be wired to Supabase later.)
                    toast.success(`Job ${jobNo} deleted`);
                    router.push("/app/jobs");
                  }}
                >
                  Yes, delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Job Details</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Status"><JobStatusBadge status={statusLabel as JobStatus} /></Row>
                <Row label="Created">{j.startDate ? new Date(j.startDate).toLocaleString("en-NZ") : "—"}</Row>
                <Row label="Amount"><span className="font-medium">${amount.toFixed(2)}</span></Row>
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
                    j.customerName ?? "—"
                  )}
                </Row>
                {customer?.email && <Row label="Email">{customer.email}</Row>}
                {customer?.phone && <Row label="Phone">{customer.phone}</Row>}
                <Separator className="my-2" />
                <Row label="Rego">{j.vehicleRego ?? "—"}</Row>
                <Row label="Vehicle">
                  {vehicle
                    ? `${vehicle.make ?? "—"} ${vehicle.model ?? ""} ${vehicle.year ? `(${vehicle.year})` : ""}`.trim()
                    : "—"}
                </Row>
                {vehicle?.lastService && (
                  <Row label="Last service">{new Date(vehicle.lastService).toLocaleDateString("en-NZ")}</Row>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Invoice</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              {existingInvoice ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    Existing invoice <b>{existingInvoice.invoiceNumber}</b> total ${existingInvoice.total.toFixed(2)}
                  </div>
                  <Button asChild><Link href={`/app/jobs/${j.id}/invoice`}>Open invoice</Link></Button>
                </>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">No invoice yet.</div>
                  <Button asChild><Link href={`/app/jobs/${j.id}/invoice`}>Create invoice</Link></Button>
                </>
              )}
            </CardContent>
          </Card>
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
