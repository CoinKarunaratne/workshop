"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";

import { TECHS, createJob } from "@/lib/dummy-jobs";
import { getQuotationById, linkQuotationToJob } from "@/lib/dummy-quotations";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { VEHICLES } from "@/lib/dummy-vehicles";

const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

export default function NewJobPage() {
  const router = useRouter();
  const qs = useSearchParams();
  const fromQuote = qs.get("fromQuote") ?? undefined;

  const [step, setStep] = React.useState<1 | 2>(1);

  // Local form state
  const [rego, setRego] = React.useState("");
  const [customer, setCustomer] = React.useState("");
  const [service, setService] = React.useState("General Service");
  const [tech, setTech] = React.useState<string>(TECHS[0] ?? "");
  const [notes, setNotes] = React.useState("");

  // Prefill from quotation (if provided)
  React.useEffect(() => {
    if (!fromQuote) return;
    const q = getQuotationById(fromQuote);
    if (!q) return;

    // Prefer linked entities
    let prefillCustomer = q.snapshotCustomerName ?? "";
    let prefillRego = q.snapshotRego ?? "";

    if (q.customerId) {
      prefillCustomer = CUSTOMERS.find(c => c.id === q.customerId)?.name ?? prefillCustomer;
    }
    if (q.vehicleId) {
      prefillRego = VEHICLES.find(v => v.id === q.vehicleId)?.rego ?? prefillRego;
    }

    setCustomer(prefillCustomer);
    setRego(prefillRego);
    // lightweight hint
    if (q.notesTop) setNotes(q.notesTop);
    // optionally reflect quotation context in service
    if (!service || service === "General Service") setService("From Quotation");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromQuote]);

  // Validation (same as yours)
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const markTouched = (k: string) => setTouched(t => ({ ...t, [k]: true }));

  function getIssuesMap() {
    const m: Record<string, string> = {};
    if (!rego.trim()) m.rego = "Vehicle rego is required.";
    if (!customer.trim()) m.customer = "Customer is required.";
    return m;
  }
  const issues = getIssuesMap();
  const show = (k: string) => (submitted || touched[k]) && issues[k];

  function continueToReview(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(getIssuesMap()).length) { setStep(1); return; }
    setStep(2); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createJobAndGo() {
    // create job in demo store
    const job = createJob({
      rego: rego.trim(),
      customer: customer.trim(),
      status: "In Workshop",
      technician: tech,
      amount: 0,
    });

    // link quotation → job (if applicable)
    if (fromQuote) {
      linkQuotationToJob(fromQuote, job.id);
    }

    toast.success("Job created");
    router.push(`/app/jobs/${job.id}`);
  }

  function cancel() {
    router.back();
  }

  return (
    <div className="pb-20">
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-screen-lg">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">New Job</h1>
          </div>

          <StepHeader steps={["Details", "Review"]} current={step} />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Job details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={continueToReview} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rego">Vehicle rego <RequiredAsterisk /></Label>
                      <Input
                        id="rego"
                        required
                        placeholder="ABC123"
                        value={rego}
                        onChange={(e) => setRego(e.target.value)}
                        onBlur={() => markTouched("rego")}
                        aria-invalid={Boolean(show("rego"))}
                        aria-describedby={show("rego") ? "rego-error" : undefined}
                      />
                      {show("rego") && <FieldHint id="rego-error">{issues.rego}</FieldHint>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer <RequiredAsterisk /></Label>
                      <Input
                        id="customer"
                        required
                        placeholder="John Smith"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        onBlur={() => markTouched("customer")}
                        aria-invalid={Boolean(show("customer"))}
                        aria-describedby={show("customer") ? "customer-error" : undefined}
                      />
                      {show("customer") && <FieldHint id="customer-error">{issues.customer}</FieldHint>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Input
                      id="service"
                      placeholder="WOF + Oil Change"
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tech">Technician</Label>
                    <Select value={tech} onValueChange={setTech}>
                      <SelectTrigger id="tech"><SelectValue placeholder="Assign technician" /></SelectTrigger>
                      <SelectContent>
                        {TECHS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      rows={4}
                      placeholder="Any special instructions…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader><CardTitle>Review &amp; confirm</CardTitle></CardHeader>
              <CardContent>
                <ValidationSummary
                  issues={Object.entries(issues).map(([field, message]) => ({ field, message }))}
                  className="mb-4"
                />
                <div className="space-y-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Vehicle rego" value={rego} />
                    <Field label="Customer" value={customer} />
                    <Field label="Technician" value={tech} />
                    <Field label="Service" value={service || "—"} />
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="text-xs text-muted-foreground">
                  Tip: You can edit fields by going back to <b>Details</b>.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <StickyActions
        left={
          step === 2 ? (
            <button className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setStep(1)}>
              ← Back to Details
            </button>
          ) : null
        }
        right={
          step === 1 ? (
            <>
              <Button variant="outline" onClick={cancel}>Cancel</Button>
              <Button onClick={continueToReview}>Review</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={createJobAndGo}>Create job</Button>
            </>
          )
        }
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
