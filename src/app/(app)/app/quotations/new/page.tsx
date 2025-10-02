"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CUSTOMERS, type CustomerRow } from "@/lib/dummy-customers";
import { VEHICLES, type VehicleRow } from "@/lib/dummy-vehicles";
import {
  upsertQuotation,
  newQuotationNumber,
  calcQuotationTotals,
  createEmptyQuotationLine,
  type Quotation,
  type QuotationLine,
} from "@/lib/dummy-quotations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";
import { InvoiceLinesTable } from "@/components/app/invoices/invoice-lines-table";
import { VehiclePickerDialog } from "@/components/app/quotations/vehicle-picker-dialog";
import { toast } from "sonner";

const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

export default function NewQuotationPage() {
  const router = useRouter();

  type Step = 1 | 2;
  const [step, setStep] = React.useState<Step>(1);

  // selection (existing vehicle) — when set, we lock the form
  const [pickedVehicle, setPickedVehicle] = React.useState<VehicleRow | null>(null);
  const pickedCustomer: CustomerRow | undefined = React.useMemo(
    () => (pickedVehicle ? CUSTOMERS.find(c => c.id === pickedVehicle.customerId) : undefined),
    [pickedVehicle]
  );

  const [pickerOpen, setPickerOpen] = React.useState(false);

  // Customer form
  const [custName, setCustName] = React.useState(pickedCustomer?.name ?? "");
  const [custEmail, setCustEmail] = React.useState(pickedCustomer?.email ?? "");
  const [custPhone, setCustPhone] = React.useState(pickedCustomer?.phone ?? "");

  // Vehicle form
  const [rego, setRego] = React.useState(pickedVehicle?.rego ?? "");
  const [make, setMake] = React.useState(pickedVehicle?.make ?? "");
  const [model, setModel] = React.useState(pickedVehicle?.model ?? "");
  const [year, setYear] = React.useState<string>(pickedVehicle?.year ?? YEARS[0]);

  // Quotation meta (step 2)
  const [quotationNumber] = React.useState<string>(newQuotationNumber());
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10));
  const [notesTop, setNotesTop] = React.useState<string>("");

  const [gstEnabled, setGstEnabled] = React.useState<boolean>(true);
  const [bankEnabled, setBankEnabled] = React.useState<boolean>(false);

  // Lines (reuse invoice lines table)
  const [lines, setLines] = React.useState<QuotationLine[]>([createEmptyQuotationLine()]);

  // Validation helpers
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted1, setSubmitted1] = React.useState(false);
  const markTouched = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  function issuesStep1() {
    const m: Record<string, string> = {};
    if (!pickedVehicle) {
      // manual entry must have ALL required
      if (!custName.trim()) m.custName = "Customer name is required.";
      if (!rego.trim()) m.rego = "Vehicle rego is required.";
    }
    // When pickedVehicle is set, we accept locked values (no additional required).
    return m;
  }
  const show1 = (k: string) => (submitted1 || touched[k]) && issuesStep1()[k];

  function nextFromDetails(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted1(true);
    if (Object.keys(issuesStep1()).length) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearPickedVehicle() {
    setPickedVehicle(null);
    setCustName("");
    setCustEmail("");
    setCustPhone("");
    setRego("");
    setMake("");
    setModel("");
    setYear(YEARS[0]);
  }

  // totals (live)
  const { subtotal, gstTotal, bankCharge, total, estimatedProfit } = React.useMemo(
    () => calcQuotationTotals(lines, gstEnabled, bankEnabled),
    [lines, gstEnabled, bankEnabled]
  );

  function saveQuotation() {
    // build the quotation record; if pickedVehicle, link ids; else leave undefined (we’ll create records in backend later)
    const q: Quotation = {
      id: crypto.randomUUID(),
      quotationNumber,
      customerId: pickedVehicle ? pickedVehicle.customerId : undefined,
      vehicleId: pickedVehicle ? pickedVehicle.id : undefined,
      jobId: undefined,

      date,
      notesTop: notesTop?.trim() || undefined,

      gstEnabled,
      bankChargeEnabled: bankEnabled,

      lines,
      subtotal: Number(subtotal.toFixed(2)),
      gstTotal: Number(gstTotal.toFixed(2)),
      bankCharge: Number(bankCharge.toFixed(2)),
      total: Number(total.toFixed(2)),

      estimatedProfit: Number(estimatedProfit.toFixed(2)),

      gotJob: false,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertQuotation(q);

    // UX note for manual entry path
    if (!pickedVehicle) {
      toast.message(
        "Quotation saved",
        { description: "Customer/Vehicle will be created and linked once backend (Supabase) is connected." }
      );
    } else {
      toast.success("Quotation saved");
    }

    router.push("/app/quotations");
  }

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">New Quotation</h1>
        </div>

        <StepHeader steps={["Details", "Quote"]} current={step} />

        {/* STEP 1: Customer & Vehicle Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Customer & Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing vehicle picker */}
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
                  Pick existing vehicle
                </Button>
                {pickedVehicle && (
                  <>
                    <span className="text-sm text-muted-foreground">
                      Selected: <b>{pickedVehicle.rego}</b> · Owner: <b>{pickedCustomer?.name ?? "—"}</b>
                    </span>
                    <Button type="button" variant="ghost" className="text-red-600" onClick={clearPickedVehicle}>
                      Clear selection
                    </Button>
                  </>
                )}
              </div>

              <Separator />

              {/* Customer */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cust-name">
                    Customer name {pickedVehicle ? null : <RequiredAsterisk />}
                  </Label>
                  <Input
                    id="cust-name"
                    value={custName}
                    placeholder="Jane Doe"
                    onChange={(e) => setCustName(e.target.value)}
                    onBlur={() => markTouched("custName")}
                    aria-invalid={Boolean(show1("custName"))}
                    aria-describedby={show1("custName") ? "custName-error" : undefined}
                    disabled={!!pickedVehicle}
                    required={!pickedVehicle}
                  />
                  {show1("custName") && <FieldHint id="custName-error">{issuesStep1().custName}</FieldHint>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-email">Email</Label>
                  <Input
                    id="cust-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    disabled={!!pickedVehicle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cust-phone">Phone</Label>
                  <Input
                    id="cust-phone"
                    placeholder="+64 21 000 0000"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    disabled={!!pickedVehicle}
                  />
                </div>
              </div>

              {/* Vehicle */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="rego">
                    Rego {pickedVehicle ? null : <RequiredAsterisk />}
                  </Label>
                  <Input
                    id="rego"
                    placeholder="ABC123"
                    value={rego}
                    onChange={(e) => setRego(e.target.value)}
                    onBlur={() => markTouched("rego")}
                    aria-invalid={Boolean(show1("rego"))}
                    aria-describedby={show1("rego") ? "rego-error" : undefined}
                    disabled={!!pickedVehicle}
                    required={!pickedVehicle}
                  />
                  {show1("rego") && <FieldHint id="rego-error">{issuesStep1().rego}</FieldHint>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    placeholder="Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    disabled={!!pickedVehicle}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="Corolla"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={!!pickedVehicle}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={year} onValueChange={setYear} disabled={!!pickedVehicle}>
                    <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Quotation builder */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Build Quotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Quotation #</Label>
                  <Input value={quotationNumber} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-date">Date</Label>
                  <Input id="q-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Charges</Label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={gstEnabled} onCheckedChange={(v) => setGstEnabled(Boolean(v))} />
                      <span>Apply GST</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox checked={bankEnabled} onCheckedChange={(v) => setBankEnabled(Boolean(v))} />
                      <span>Bank charge 2%</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Visible to customer (e.g., scope, assumptions, exclusions)"
                  value={notesTop}
                  onChange={(e) => setNotesTop(e.target.value)}
                  rows={3}
                />
              </div>

              <InvoiceLinesTable
                lines={lines as any}
                onChange={setLines as any}
                showCost
                showControls
              />

              <Separator />

              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Subtotal (ex GST)</div>
                  <div className="font-medium">${subtotal.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">GST</div>
                  <div className="font-medium">${gstTotal.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Bank charge {bankEnabled ? "(2%)" : "(off)"} </div>
                  <div className="font-medium">${bankCharge.toFixed(2)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Estimated profit</div>
                  <div className="font-medium">${estimatedProfit.toFixed(2)}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {pickedVehicle ? (
                    <>This quotation will be linked to <b>{pickedCustomer?.name ?? "—"}</b> ({pickedVehicle.rego}).</>
                  ) : (
                    <>On backend hookup, we’ll create a new Customer & Vehicle from these details and link this quotation.</>
                  )}
                </div>
                <div className="text-base font-semibold">
                  Total: ${total.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <StickyActions
        left={
          step > 1 ? (
            <button
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setStep((step - 1) as Step)}
            >
              ← Back
            </button>
          ) : null
        }
        right={
          step === 1 ? (
            <>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={nextFromDetails}>Continue</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={saveQuotation}>Save quotation</Button>
            </>
          )
        }
      />

      {/* vehicle picker */}
      <VehiclePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(v) => {
          setPickedVehicle(v);
          const c = CUSTOMERS.find((x) => x.id === v.customerId);
          setCustName(c?.name ?? "");
          setCustEmail(c?.email ?? "");
          setCustPhone(c?.phone ?? "");
          setRego(v.rego ?? "");
          setMake(v.make ?? "");
          setModel(v.model ?? "");
          setYear(v.year ?? YEARS[0]);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
