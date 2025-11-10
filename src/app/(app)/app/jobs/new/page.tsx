"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

import { SelectCustomerDialog } from "@/components/app/vehicles/select-customer-dialog";
import { listVehicles, getVehicle, updateVehicle } from "@/lib/data/vehicles.db";
import { createJob, isJobNumberAvailable } from "@/lib/data/jobs.db";

import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";

const UI_STATUSES = [
  "In Workshop",
  "Waiting Parts",
  "Waiting for Concent",
  "Completed",
  "Invoice Sent",
  "Payment completed",
  "Collected",
] as const;
type UIStatus = typeof UI_STATUSES[number];

const uiToDb: Record<UIStatus, string> = {
  "In Workshop": "in_workshop",
  "Waiting Parts": "waiting_parts",
  "Waiting for Concent": "waiting_concent",
  "Completed": "completed",
  "Invoice Sent": "invoice_sent",
  "Payment completed": "payment_completed",
  "Collected": "collected",
};

function todayISO() {
  const d = new Date();
  const tz = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return tz.toISOString().slice(0, 10);
}

function genJobNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `JOB-${y}${m}${dd}-${rand}`;
}

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);

  const [customer, setCustomer] = React.useState<{ id: string; name: string } | null>(null);
  const [vehicleId, setVehicleId] = React.useState<string | null>(null);
  const [vehicleOptions, setVehicleOptions] = React.useState<Array<{ id: string; rego: string }>>([]);
  const [vehLoading, setVehLoading] = React.useState(false);

  const [jobNo, setJobNo] = React.useState(genJobNo());
  const [jobNoTaken, setJobNoTaken] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<UIStatus>("In Workshop");
  const [date, setDate] = React.useState<string>(todayISO());
  const [notes, setNotes] = React.useState<string>("");

  // new: editable vehicle info fields
  const [mileage, setMileage] = React.useState<string>("");
  const [wofExpiry, setWofExpiry] = React.useState<string>("");
  const [serviceDue, setServiceDue] = React.useState<string>("");

  const [initialVehicleData, setInitialVehicleData] = React.useState<{ mileage: string; wofExpiry: string; serviceDue: string } | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!customer) {
        setVehicleOptions([]); setVehicleId(null);
        return;
      }
      try {
        setVehLoading(true);
        const res = await listVehicles({ customerId: customer.id, page: 1, pageSize: 200 });
        const opts = (res.items ?? res).map((v: any) => ({ id: v.id, rego: v.rego }));
        setVehicleOptions(opts);
        setVehicleId((prev) => (prev && opts.some(o => o.id === prev) ? prev : null));
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load vehicles");
      } finally {
        setVehLoading(false);
      }
    })();
  }, [customer]);

  React.useEffect(() => {
    if (!vehicleId) return;
    (async () => {
      try {
        const vehicle = await getVehicle(vehicleId);
        if (!vehicle) return;
        const vMileage = vehicle.mileage ?? "";
        const vWof = vehicle.wofExpiry ?? "";
        const vService = vehicle.serviceDue ?? "";
        setMileage(vMileage);
        setWofExpiry(vWof);
        setServiceDue(vService);
        setInitialVehicleData({ mileage: vMileage, wofExpiry: vWof, serviceDue: vService });
      } catch (e: any) {
        toast.error("Failed to fetch vehicle details");
      }
    })();
  }, [vehicleId]);

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const markTouched = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  function getIssuesMap() {
    const m: Record<string, string> = {};
    if (!customer) m.customer = "Customer is required.";
    if (!title.trim()) m.title = "Title is required.";
    if (!jobNo.trim()) m.jobNo = "Job No. is required.";
    if (jobNoTaken) m.jobNo = "This Job No. already exists.";
    return m;
  }
  const issues = getIssuesMap();
  const show = (k: string) => (submitted || touched[k]) && issues[k];

  async function checkJobNo() {
    if (!jobNo.trim()) return;
    try {
      const ok = await isJobNumberAvailable(jobNo);
      setJobNoTaken(!ok);
    } catch {
      setJobNoTaken(false);
    }
  }

  function goReview(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(getIssuesMap()).length) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCreate() {
    setSubmitted(true);
    if (Object.keys(getIssuesMap()).length) return;

    try {
      const job = await createJob({
        jobNumber: jobNo.trim(),
        customerId: customer!.id,
        vehicleId: vehicleId ?? null,
        title: title.trim(),
        description: description.trim() || null,
        status: uiToDb[status],
        startDate: date ? new Date(date).toISOString() : null,
        notes: notes.trim() || null,
      });

      // check and update vehicle fields if changed
      if (vehicleId && initialVehicleData) {
        const hasChanges = mileage !== initialVehicleData.mileage || wofExpiry !== initialVehicleData.wofExpiry || serviceDue !== initialVehicleData.serviceDue;
        if (hasChanges) {
          await updateVehicle(vehicleId, {
            mileage,
            wofExpiry,
            serviceDue,
          });
        }
      }

      toast.success("Job created");
      router.push(`/app/jobs/${job.id}`);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to create job";
      if (/job number.*exists/i.test(msg)) setJobNoTaken(true);
      toast.error(msg);
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <StepHeader steps={["Details", "Review"]} current={step} />

        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>New Job</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* Job No. */}
              <div className="space-y-2">
                <Label htmlFor="jobNo">Job No. <RequiredAsterisk /></Label>
                <Input id="jobNo" value={jobNo} onChange={(e) => setJobNo(e.target.value)} onBlur={() => { markTouched("jobNo"); void checkJobNo(); }} aria-invalid={Boolean(show("jobNo"))} />
                {show("jobNo") && <FieldHint>{issues.jobNo}</FieldHint>}
              </div>

              {/* Customer */}
              <div className="space-y-2">
                <Label>Customer <RequiredAsterisk /></Label>
                <div className="flex gap-2">
                  <Input value={customer?.name ?? "No customer selected"} readOnly />
                  <SelectCustomerDialog onSelect={(c) => setCustomer({ id: c.id, name: c.name })} />
                </div>
                {show("customer") && <FieldHint>{issues.customer}</FieldHint>}
              </div>

              {/* Vehicle */}
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={vehicleId ?? ""} onValueChange={(v) => setVehicleId(v || null)} disabled={!customer || vehLoading || vehicleOptions.length === 0}>
                  <SelectTrigger>
                    <SelectValue placeholder={!customer ? "Pick customer first" : vehLoading ? "Loading..." : (vehicleOptions.length ? "Select vehicle" : "No vehicles")} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOptions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.rego}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle fields */}
              {vehicleId && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mileage</Label>
                    <Input value={mileage} onChange={(e) => setMileage(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>WOF Expiry</Label>
                    <Input type="date" value={wofExpiry} onChange={(e) => setWofExpiry(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Service Due</Label>
                    <Input type="date" value={serviceDue} onChange={(e) => setServiceDue(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title <RequiredAsterisk /></Label>
                <Input id="title" placeholder="e.g. Full service + WOF" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => markTouched("title")} aria-invalid={Boolean(show("title"))} />
                {show("title") && <FieldHint>{issues.title}</FieldHint>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" placeholder="Work details, observations…" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              {/* Status / Date */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v: UIStatus) => setStatus(v)}>
                    <SelectTrigger><SelectValue placeholder="Pick status" /></SelectTrigger>
                    <SelectContent>
                      {UI_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Review & confirm</CardTitle></CardHeader>
            <CardContent>
              <ValidationSummary
                issues={Object.entries(issues).map(([field, message]) => ({ field, message }))}
                className="mb-4"
              />
              <div className="space-y-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Job No." value={jobNo} />
                  <Field label="Customer" value={customer?.name ?? "—"} />
                  <Field label="Vehicle" value={vehicleOptions.find(v => v.id === vehicleId)?.rego ?? "—"} />
                  <Field label="Title" value={title || "—"} />
                  <Field label="Status" value={status} />
                  <Field label="Date" value={date || "—"} />
                  <Field label="Mileage" value={mileage || "—"} />
                  <Field label="WOF Expiry" value={wofExpiry || "—"} />
                  <Field label="Service Due" value={serviceDue || "—"} />
                  <Field label="Notes" value={notes || "—"} />
                  <div className="sm:col-span-2">
                    <Field label="Description" value={description || "—"} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <StickyActions
        left={step === 2 ? (
          <button className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setStep(1)}>
            ← Back to Details
          </button>
        ) : null}
        right={step === 1 ? (
          <>
            <Button variant="outline" onClick={() => router.push("/app/jobs")}>Cancel</Button>
            <Button onClick={goReview}>Review</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleCreate} disabled={jobNoTaken}>Create job</Button>
          </>
        )}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
