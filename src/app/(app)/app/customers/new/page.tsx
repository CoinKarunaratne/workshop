// app/customers/new/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";
import { createCustomer as createCustomerDB } from "@/lib/data/customers.db";
import { VehiclesRepeater, type VehicleDraft } from "@/components/app/customers/vehicle-repeater";
import { createVehicle } from "@/lib/data/vehicles.db";

// Helper to convert date string (YYYY-MM-DD) to ISO format or null
function toIsoOrNull(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const ms = Date.parse(dateStr);
  return isNaN(ms) ? null : new Date(ms).toISOString();
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");

  // Initialize with one empty vehicle (including all fields)
  const [vehicles, setVehicles] = React.useState<VehicleDraft[]>([
    { rego: "", make: "", model: "", year: "", mileage: "", wofExpiry: "", serviceDue: "" },
  ]);

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted1, setSubmitted1] = React.useState(false);
  const [submitted2, setSubmitted2] = React.useState(false);
  const markTouched = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const steps = ["Customer", "Vehicles", "Review"];

  function issuesStep1() {
    const m: Record<string, string> = {};
    if (!name.trim()) m.name = "Name is required.";
    return m;
  }
  function issuesStep2() {
    const m: Record<string, string> = {};
    if (!vehicles.length) {
      m.vehicles = "At least one vehicle is required.";
    }
    vehicles.forEach((v, idx) => {
      if (!v.rego.trim()) {
        m[`rego-${idx}`] = `Vehicle ${idx + 1}: rego is required.`;
      }
      if (!v.make?.trim()) {
        m[`make-${idx}`] = `Vehicle ${idx + 1}: make is required.`;
      }
      if (!v.model?.trim()) {
        m[`model-${idx}`] = `Vehicle ${idx + 1}: model is required.`;
      }
      if (!/^\d{4}$/.test(v.year ?? "")) {
        m[`year-${idx}`] = `Vehicle ${idx + 1}: Year must be a 4-digit number (e.g. 2020).`;
      }
    });
    return m;
  }

  const show1 = (k: string) => (submitted1 || touched[k]) && issuesStep1()[k];

  function nextFromCustomer(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted1(true);
    if (Object.keys(issuesStep1()).length) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextFromVehicles(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted2(true);
    if (Object.keys(issuesStep2()).length) return;
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function createCustomer() {
    try {
      const customer = await createCustomerDB({ name, email, phone, address });
      // Save each vehicle for the new customer, including all fields
      for (const v of vehicles) {
        if (!v.rego.trim()) continue;  // skip any completely empty entry
        await createVehicle({
          customerId: customer.id,
          ownerName: name,
          rego: v.rego.trim(),
          make: v.make || null,
          model: v.model || null,
          year: v.year || null,
          mileage: v.mileage ? String(Number(v.mileage)) : null,
          wofExpiry: toIsoOrNull(v.wofExpiry),
          serviceDue: toIsoOrNull(v.serviceDue),
        });
      }
      toast.success("Customer created");
      router.push("/app/customers");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to create customer");
    }
  }

  function cancel() {
    router.back();
  }

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">New Customer</h1>
        </div>

        <StepHeader steps={steps} current={step} />

        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Customer details</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={nextFromCustomer} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <RequiredAsterisk />
                  </Label>
                  <Input
                    id="name"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched("name")}
                    aria-invalid={Boolean(show1("name"))}
                    aria-describedby={show1("name") ? "name-error" : undefined}
                  />
                  {show1("name") && (
                    <FieldHint id="name-error">{issuesStep1().name}</FieldHint>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@garage.co.nz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="+64 21 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Example St, Auckland"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Vehicle(s) for this customer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {submitted2 && !vehicles.length && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  At least one vehicle is required.
                </div>
              )}
              <VehiclesRepeater items={vehicles} onChange={setVehicles} />
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Review &amp; confirm</CardTitle></CardHeader>
            <CardContent>
              <ValidationSummary
                issues={[
                  ...Object.entries(issuesStep1()).map(([field, msg]) => ({ field, message: msg })),
                  ...Object.entries(issuesStep2()).map(([field, msg]) => ({ field, message: msg })),
                ]}
                className="mb-4"
              />

              <div className="space-y-6 text-sm">
                {/* Customer info review */}
                <div>
                  <div className="mb-2 font-medium">Customer</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name" value={name} />
                    <Field label="Email" value={email || "—"} />
                    <Field label="Phone" value={phone || "—"} />
                    <Field label="Address" value={address || "—"} />
                  </div>
                </div>

                <Separator />

                {/* Vehicles info review */}
                <div className="mt-6 space-y-4 text-sm">
                  <div className="font-medium">Vehicles</div>
                  {vehicles.map((v, i) => (
                    <div key={i}>
                      <div className="text-sm text-muted-foreground mb-1">Vehicle {i + 1}</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Rego" value={v.rego || "—"} />
                        <Field label= "Make" value={v.make || "—"} />
                        <Field label="Model" value={v.model || "—"} />
                        <Field label="Year" value={v.year || "—"} />
                        <Field label="Mileage" value={v.mileage || "—"} />
                        <Field label="WOF Expiry" value={v.wofExpiry || "—"} />
                        <Field label="Service Due" value={v.serviceDue || "—"} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />
              <div className="text-xs text-muted-foreground">
                Tip: You can edit fields by going back to <b>Customer</b> or <b>Vehicles</b>.
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
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
            >
              ← Back
            </button>
          ) : null
        }
        right={
          step === 1 ? (
            <>
              <Button variant="outline" onClick={cancel}>Cancel</Button>
              <Button onClick={nextFromCustomer}>Continue</Button>
            </>
          ) : step === 2 ? (
            <>
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={nextFromVehicles}>Review</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={createCustomer}>Create customer</Button>
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
