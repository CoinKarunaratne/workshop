"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";


const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

export default function NewVehiclePage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);

  // Local state (no drafts)
  const [rego, setRego] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [year, setYear] = React.useState(YEARS[0]);

  const [touched, setTouched] = React.useState<{[k: string]: boolean}>({});
const [submitted, setSubmitted] = React.useState(false);
const markTouched = (k: string) => setTouched(t => ({ ...t, [k]: true }));

function getIssuesMap() {
  const m: Record<string, string> = {};
  if (!rego.trim()) m.rego = "Rego is required.";
  return m;
}
const issues = getIssuesMap();
const show = (k: string) => (submitted || touched[k]) && issues[k];


  const steps = ["Details", "Review"];

  function getIssues() {
    const issues: { field: string; message: string }[] = [];
    if (!rego.trim()) issues.push({ field: "rego", message: "Rego is required." });
    return issues;
  }

  function continueToReview(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(getIssuesMap()).length) { setStep(1); return; }
    setStep(2); window.scrollTo({ top: 0, behavior: "smooth" });
  }
  

  function createVehicle() {
    toast.success("Vehicle added (demo)");
    router.push("/app/vehicles");
  }

  function cancel() {
    router.back();
  }

  return (
    <div className="pb-20">
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-screen-lg">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">New Vehicle</h1>
          </div>

          <StepHeader steps={steps} current={step} />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={continueToReview} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
  <Label htmlFor="rego">Rego <RequiredAsterisk /></Label>
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
                      <Label htmlFor="owner">Owner (optional)</Label>
                      <Input
                        id="owner"
                        placeholder="Jane Doe"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        placeholder="Toyota"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        placeholder="Corolla"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Review &amp; confirm</CardTitle>
              </CardHeader>
              <CardContent>
              <ValidationSummary
  issues={Object.entries(issues).map(([field, message]) => ({ field, message }))}
  className="mb-4"
/>

                <div className="space-y-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Rego" value={rego} />
                    <Field label="Owner" value={owner || "—"} />
                    <Field label="Make" value={make || "—"} />
                    <Field label="Model" value={model || "—"} />
                    <Field label="Year" value={year} />
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
            <button
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setStep(1)}
            >
              ← Back to Details
            </button>
          ) : null
        }
        right={
          step === 1 ? (
            <>
              <Button variant="outline" onClick={cancel}>
                Cancel
              </Button>
              <Button onClick={continueToReview}>Review</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={createVehicle}>Add vehicle</Button>
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
