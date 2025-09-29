"use client";

import * as React from "react";
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
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";
import { SelectCustomerDialog } from "./select-customer-dialog";

const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

export type VehicleDraft = {
  rego: string;
  customerId: string;
  ownerName: string;
  make: string;
  model: string;
  year: string;
  mileage?: string;
  wofExpiry?: string;
  serviceDue?: string;
};

export function VehicleForm({
  mode,
  initialData,
  onSubmit,
}: {
  mode: "new" | "edit";
  initialData?: Partial<VehicleDraft>;
  onSubmit: (data: VehicleDraft) => Promise<void>;
}) {
  const [step, setStep] = React.useState<1 | 2>(1);

  const [rego, setRego] = React.useState(initialData?.rego ?? "");
  const [customerId, setCustomerId] = React.useState(initialData?.customerId ?? "");
  const [ownerName, setOwnerName] = React.useState(initialData?.ownerName ?? "");
  const [make, setMake] = React.useState(initialData?.make ?? "");
  const [model, setModel] = React.useState(initialData?.model ?? "");
  const [year, setYear] = React.useState(initialData?.year ?? YEARS[0]);
  const [mileage, setMileage] = React.useState(initialData?.mileage ?? "");
  const [wofExpiry, setWofExpiry] = React.useState(initialData?.wofExpiry ?? "");
  const [serviceDue, setServiceDue] = React.useState(initialData?.serviceDue ?? "");

  const [submitted, setSubmitted] = React.useState(false);

  function getIssues() {
    const m: Record<string, string> = {};
    if (!customerId) m.owner = "Owner is required.";
    if (!rego.trim()) m.rego = "Rego is required.";
    if (!make.trim()) m.make = "Make is required.";
    if (!model.trim()) m.model = "Model is required.";
    if (!year.trim()) m.year = "Year is required.";
    return m;
  }
  const issues = getIssues();

  async function handleSubmit() {
    setSubmitted(true);
    if (Object.keys(getIssues()).length) return;
    await onSubmit({
      rego,
      customerId,
      ownerName,
      make,
      model,
      year,
      mileage,
      wofExpiry,
      serviceDue,
    });
  }

  return (
    <div className="pb-20">
      <StepHeader steps={["Details", "Review"]} current={step} />

      {step === 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Vehicle details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Owner */}
            <div className="space-y-2">
              <Label>Owner <RequiredAsterisk /></Label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input readOnly value={ownerName} placeholder="No customer selected" />
                <SelectCustomerDialog
                  onSelect={(c) => {
                    setCustomerId(c.id);
                    setOwnerName(c.name);
                  }}
                />
              </div>
              {submitted && issues.owner && <FieldHint>{issues.owner}</FieldHint>}
            </div>

            {/* Rego / Make */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Rego <RequiredAsterisk /></Label>
                <Input value={rego} onChange={(e) => setRego(e.target.value)} />
                {submitted && issues.rego && <FieldHint>{issues.rego}</FieldHint>}
              </div>
              <div className="space-y-2">
                <Label>Make <RequiredAsterisk /></Label>
                <Input value={make} onChange={(e) => setMake(e.target.value)} />
                {submitted && issues.make && <FieldHint>{issues.make}</FieldHint>}
              </div>
            </div>

            {/* Model / Year */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Model <RequiredAsterisk /></Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} />
                {submitted && issues.model && <FieldHint>{issues.model}</FieldHint>}
              </div>
              <div className="space-y-2">
                <Label>Year <RequiredAsterisk /></Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Year" /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Mileage (km)</Label>
                <Input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} />
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
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Review &amp; confirm</CardTitle>
          </CardHeader>
          <CardContent>
            <ValidationSummary
              issues={Object.entries(issues).map(([field, message]) => ({ field, message }))}
              className="mb-4"
            />
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><b>Owner:</b> {ownerName}</div>
              <div><b>Rego:</b> {rego}</div>
              <div><b>Make:</b> {make}</div>
              <div><b>Model:</b> {model}</div>
              <div><b>Year:</b> {year}</div>
              <div><b>Mileage:</b> {mileage || "—"}</div>
              <div><b>WOF Expiry:</b> {wofExpiry || "—"}</div>
              <div><b>Service Due:</b> {serviceDue || "—"}</div>
            </div>
            <Separator className="my-6" />
            <div className="text-xs text-muted-foreground">Tip: You can go back to edit details.</div>
          </CardContent>
        </Card>
      )}

      <StickyActions
        left={step === 2 ? (
          <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
        ) : null}
        right={step === 1 ? (
          <Button onClick={() => setStep(2)}>Review</Button>
        ) : (
          <Button onClick={handleSubmit}>
            {mode === "edit" ? "Save changes" : "Add vehicle"}
          </Button>
        )}
      />
    </div>
  );
}
