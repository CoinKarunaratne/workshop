"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { toast } from "sonner";

import { createVehicle } from "@/lib/data/vehicles.db";
import type { Vehicle } from "@/lib/types";
import { SelectCustomerDialog } from "@/components/app/vehicles/select-customer-dialog";

function toIsoOrNull(d: string | null | undefined) {
  if (!d) return null;
  const ms = Date.parse(d);
  return isNaN(ms) ? null : new Date(ms).toISOString();
}

export type VehicleDraft = {
  customerId?: string;
  ownerName?: string;
  rego?: string;
  make?: string | null;
  model?: string | null;
  /** year is stored as TEXT in DB, but must be exactly 4 digits in UI */
  year?: string | null;
  /** mileage stored as TEXT in DB, but UI enforces digits only */
  mileage?: string | null;
  wofExpiry?: string | null;   // ISO
  serviceDue?: string | null;  // ISO
};

type CreateProps = {
  mode: "create";
  lockedCustomer?: { id: string; name: string } | null;
  onCreated: (vehicleId: string) => void;
};

type EditProps = {
  mode: "edit";
  initialData: Vehicle;
  onSubmit: (updates: VehicleDraft) => Promise<void> | void;
};

type Props = CreateProps | EditProps;

export function VehicleForm(props: Props) {
  const isCreate = props.mode === "create";
  const lockedCustomer = isCreate ? (props.lockedCustomer ?? null) : null;

  // customer selection (create/global or edit -> prefilled)
  const [customer, setCustomer] = React.useState<{ id: string; name: string } | null>(
    isCreate
      ? lockedCustomer
      : { id: (props as EditProps).initialData.customerId, name: (props as EditProps).initialData.ownerName ?? "" }
  );
  const customerLocked = !isCreate || Boolean(lockedCustomer);

  // form values (prefill if edit)
  const seed = !isCreate ? (props as EditProps).initialData : undefined;
  const [rego, setRego] = React.useState(seed?.rego ?? "");
  const [make, setMake] = React.useState(seed?.make ?? "");
  const [model, setModel] = React.useState(seed?.model ?? "");

  // ✅ YEAR: manual numeric input (4 digits)
  const [year, setYear] = React.useState<string>(seed?.year ?? "");

  // ✅ MILEAGE: numeric only
  const [mileage, setMileage] = React.useState<string>(seed?.mileage ?? "");

  // Dates (keep as yyyy-mm-dd in input, convert to ISO on save)
  const [wofExpiry, setWofExpiry] = React.useState<string>(seed?.wofExpiry ? seed.wofExpiry.slice(0, 10) : "");
  const [serviceDue, setServiceDue] = React.useState<string>(seed?.serviceDue ? seed.serviceDue.slice(0, 10) : "");

  const [step, setStep] = React.useState<1 | 2>(1);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const markTouched = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  function issues() {
    const m: Record<string, string> = {};
    if (!customer) m.customer = "Please pick a customer.";
    if (!rego.trim()) m.rego = "Rego is required.";
    if (!make.trim()) m.make = "Make is required.";
    if (!model.trim()) m.model = "Model is required.";
    // ✅ year must be exactly 4 digits
    if (!/^\d{4}$/.test(year)) m.year = "Year must be a 4-digit number (e.g. 2020).";
    // (optional) you could also validate plausible range:
    // const y = Number(year); if (y < 1950 || y > new Date().getFullYear() + 1) m.year = "Year looks invalid.";
    return m;
  }
  const errs = issues();
  const show = (k: string) => (submitted || touched[k]) && errs[k];

  function continueToReview(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(issues()).length) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleCreate() {
    if (!customer) return;
    try {
      const res = await createVehicle({
        customerId: customer.id,
        ownerName: customer.name,
        rego: rego.trim(),
        make: make || null,
        model: model || null,
        // ✅ year enforced as exactly 4 digits string
        year: year || null,
        // ✅ mileage numeric-only (store as text in DB for now)
        mileage: mileage ? String(Number(mileage)) : null,
        wofExpiry: toIsoOrNull(wofExpiry),
        serviceDue: toIsoOrNull(serviceDue),
      });
      toast.success("Vehicle created");
      (props as CreateProps).onCreated(res.id);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to create vehicle");
    }
  }

  async function handleEditSubmit() {
    const draft: VehicleDraft = {
      customerId: customer?.id,
      ownerName: customer?.name,
      rego: rego.trim(),
      make: make || null,
      model: model || null,
      year: year || null,
      mileage: mileage ? String(Number(mileage)) : null,
      wofExpiry: toIsoOrNull(wofExpiry),
      serviceDue: toIsoOrNull(serviceDue),
    };
    await (props as EditProps).onSubmit(draft);
  }

  return (
    <div className="pb-20">
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-screen-lg">
          <StepHeader steps={["Details", "Review"]} current={step} />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>{isCreate ? "Vehicle details" : "Edit vehicle"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={continueToReview} className="space-y-6">
                  {/* Owner */}
                  <div className="space-y-2">
                    <Label>
                      Owner <RequiredAsterisk />
                    </Label>
                    <div className="flex gap-2">
                      <Input value={customer?.name ?? "No customer selected"} readOnly />
                      {!customerLocked && (
                        <SelectCustomerDialog
                          onSelect={(c) => setCustomer({ id: c.id, name: c.name })}
                        />
                      )}
                    </div>
                    {show("customer") && <FieldHint>{errs.customer}</FieldHint>}
                  </div>

                  {/* Rego / Make */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rego">
                        Rego <RequiredAsterisk />
                      </Label>
                      <Input
                        id="rego"
                        placeholder="ABC123"
                        value={rego}
                        onChange={(e) => setRego(e.target.value)}
                        onBlur={() => markTouched("rego")}
                        aria-invalid={Boolean(show("rego"))}
                        aria-describedby={show("rego") ? "rego-error" : undefined}
                      />
                      {show("rego") && <FieldHint id="rego-error">{errs.rego}</FieldHint>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="make">
                        Make <RequiredAsterisk />
                      </Label>
                      <Input
                        id="make"
                        placeholder="Toyota"
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        onBlur={() => markTouched("make")}
                      />
                      {show("make") && <FieldHint>{errs.make}</FieldHint>}
                    </div>
                  </div>

                  {/* Model / Year (manual numeric) */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="model">
                        Model <RequiredAsterisk />
                      </Label>
                      <Input
                        id="model"
                        placeholder="Corolla"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        onBlur={() => markTouched("model")}
                      />
                      {show("model") && <FieldHint>{errs.model}</FieldHint>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">
                        Year <RequiredAsterisk />
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 2020"
                        value={year}
                        onChange={(e) => {
                          const v = e.target.value;
                          // allow only digits and enforce max length 4
                          if (/^\d*$/.test(v) && v.length <= 4) setYear(v);
                        }}
                        onBlur={() => markTouched("year")}
                        aria-invalid={Boolean(show("year"))}
                        aria-describedby={show("year") ? "year-error" : undefined}
                      />
                      {show("year") && <FieldHint id="year-error">{errs.year}</FieldHint>}
                    </div>
                  </div>

                  {/* Mileage / WOF / Service due */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage (km)</Label>
                      <Input
                        id="mileage"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 120000"
                        value={mileage}
                        onChange={(e) => {
                          const v = e.target.value;
                          // digits only; allow empty string
                          if (/^\d*$/.test(v)) setMileage(v);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wof">WOF Expiry</Label>
                      <Input
                        id="wof"
                        type="date"
                        value={wofExpiry}
                        onChange={(e) => setWofExpiry(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="svc">Service Due</Label>
                      <Input
                        id="svc"
                        type="date"
                        value={serviceDue}
                        onChange={(e) => setServiceDue(e.target.value)}
                      />
                    </div>
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
                  issues={Object.entries(errs).map(([field, message]) => ({ field, message }))}
                  className="mb-4"
                />
                <div className="space-y-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Info label="Owner" value={customer?.name ?? "—"} />
                    <Info label="Rego" value={rego} />
                    <Info label="Make" value={make || "—"} />
                    <Info label="Model" value={model || "—"} />
                    <Info label="Year" value={year || "—"} />
                    <Info label="Mileage" value={mileage || "—"} />
                    <Info label="WOF Expiry" value={wofExpiry || "—"} />
                    <Info label="Service Due" value={serviceDue || "—"} />
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="text-xs text-muted-foreground">You can go back to edit details.</div>
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
              <Button variant="outline" onClick={() => history.back()}>
                Cancel
              </Button>
              <Button onClick={continueToReview}>{isCreate ? "Review" : "Review changes"}</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              {isCreate ? (
                <Button onClick={handleCreate}>Add vehicle</Button>
              ) : (
                <Button onClick={handleEditSubmit}>Save changes</Button>
              )}
            </>
          )
        }
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
