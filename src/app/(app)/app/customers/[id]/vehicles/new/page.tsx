// src/app/(app)/customers/[id]/vehicles/new/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { CUSTOMERS } from "@/lib/dummy-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";
import { toast } from "sonner";

const YEARS = Array.from({ length: 35 }, (_, i) => String(new Date().getFullYear() - i));

export default function NewVehicleForCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const customer = CUSTOMERS.find((c) => c.id === params.id);

  // Early return: if customer not found, show a small message + link
  if (!customer) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          Customer not found.{" "}
          <Link href="/app/customers" className="underline underline-offset-4">
            Back to customers
          </Link>
        </p>
      </div>
    );
  }

  // Narrowed alias so TS knows it's non-null from here on
  const c = customer!;

  const [step, setStep] = React.useState<1 | 2>(1);
  const [rego, setRego] = React.useState("");
  const [make, setMake] = React.useState("");
  const [model, setModel] = React.useState("");
  const [year, setYear] = React.useState(YEARS[0]);

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const markTouched = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const steps: string[] = ["Details", "Review"];

  function getIssuesMap() {
    const m: Record<string, string> = {};
    if (!rego.trim()) m.rego = "Rego is required.";
    return m;
  }
  const issues = getIssuesMap();
  const show = (k: string) => (submitted || touched[k]) && issues[k];

  function continueToReview(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(getIssuesMap()).length) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function createVehicle() {
    toast.success(`Vehicle added for ${c.name} (demo)`);
    router.push(`/app/customers/${c.id}?tab=vehicles`);
  }

  function cancel() {
    router.push(`/app/customers/${c.id}`);
  }

  return (
    <div className="pb-20">
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-screen-lg">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Add vehicle</h1>
            <Button asChild variant="outline" size="sm">
              <Link href={`/app/customers/${c.id}`}>Back to {c.name}</Link>
            </Button>
          </div>

          <StepHeader steps={steps} current={step} />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={continueToReview} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Owner</Label>
                    <Input value={c.name} readOnly />
                    <p className="text-xs text-muted-foreground">
                      Vehicles can only be added from a customer context.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rego">
                        Rego <RequiredAsterisk />
                      </Label>
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
                      <Label htmlFor="make">Make</Label>
                      <Input id="make" placeholder="Toyota" value={make} onChange={(e) => setMake(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" placeholder="Corolla" value={model} onChange={(e) => setModel(e.target.value)} />
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
                    <Info label="Owner" value={c.name} />
                    <Info label="Rego" value={rego} />
                    <Info label="Make" value={make || "—"} />
                    <Info label="Model" value={model || "—"} />
                    <Info label="Year" value={year} />
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

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
