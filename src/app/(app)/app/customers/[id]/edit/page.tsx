"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { VEHICLES } from "@/lib/dummy-vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StepHeader } from "@/components/app/new/step-header";
import { StickyActions } from "@/components/app/new/sticky-actions";
import { ValidationSummary } from "@/components/app/new/validation-summary";
import { RequiredAsterisk, FieldHint } from "@/components/app/new/required";
import { VehiclesRepeater, type VehicleDraft } from "@/components/app/customers/vehicle-repeater";
import { toast } from "sonner";
import { getCustomer, updateCustomer } from "@/lib/data/customers.db";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [vehicles, setVehicles] = React.useState<VehicleDraft[]>([{ rego: "", make: "", model: "", year: "" }]);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted1, setSubmitted1] = React.useState(false);
  const [submitted2, setSubmitted2] = React.useState(false);
  const markTouched = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  React.useEffect(() => {
    (async () => {
      const existing = await getCustomer(params.id);
      if (!existing) {
        router.push("/app/customers");
        return;
      }
      setName(existing.name);
      setEmail(existing.email ?? "");
      setPhone(existing.phone ?? "");
      // prefill vehicles from dummy vehicles list
      const v = VEHICLES.filter(x => x.customerId === existing.id).map(x => ({
        rego: x.rego ?? "",
        make: x.make ?? "",
        model: x.model ?? "",
        year: x.year ?? "",
      }));
      setVehicles(v.length ? v : [{ rego: "", make: "", model: "", year: "" }]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const steps = ["Customer", "Vehicles", "Review"];
  function issuesStep1() {
    const m: Record<string, string> = {};
    if (!name.trim()) m.name = "Name is required.";
    return m;
  }
  function issuesStep2() {
    const m: Record<string, string> = {};
    if (!vehicles.length) m.vehicles = "At least one vehicle is required.";
    vehicles.forEach((v, idx) => {
      if (!v.rego.trim()) m[`rego-${idx}`] = `Vehicle ${idx + 1}: rego is required.`;
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

  async function saveEdits() {
await updateCustomer(params.id, { name, email, phone });
    toast.success("Customer updated");
    router.push(`/app/customers/${params.id}`);
  }
  function cancel() {
    router.back();
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Edit Customer</h1>
          <Button asChild variant="outline" size="sm">
            <Link href={`/app/customers/${params.id}`}>Back to customer</Link>
          </Button>
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
                  {show1("name") && <FieldHint id="name-error">{issuesStep1().name}</FieldHint>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jane@garage.co.nz" value={email} onChange={(e)=>setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+64 21 000 0000" value={phone} onChange={(e)=>setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" rows={4} placeholder="VIP, prefers morning drop-offs…" value={notes} onChange={(e)=>setNotes(e.target.value)} />
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
                  ...Object.entries(issuesStep1()).map(([field, message]) => ({ field, message })),
                  ...Object.entries(issuesStep2()).map(([field, message]) => ({ field, message })),
                ]}
                className="mb-4"
              />
              <div className="space-y-6 text-sm">
                <div>
                  <div className="mb-2 font-medium">Customer</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name" value={name} />
                    <Field label="Email" value={email || "—"} />
                    <Field label="Phone" value={phone || "—"} />
                  </div>
                  <div className="mt-2">
                    <div className="mb-1 text-muted-foreground">Notes</div>
                    <div className="min-h-12 rounded-md border bg-card px-3 py-2">
                      {notes ? notes : <span className="text-muted-foreground">No notes</span>}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="mt-6 space-y-2 text-sm">
                  <div className="font-medium">Vehicles</div>
                  {vehicles.map((v, i) => (
                    <div key={i} className="grid gap-3 sm:grid-cols-4">
                      <span className="text-muted-foreground">#{i + 1}</span>
                      <span>{v.rego || "—"}</span>
                      <span>{[v.make, v.model].filter(Boolean).join(" ") || "—"}</span>
                      <span>{v.year || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />
              <div className="text-xs text-muted-foreground">Tip: You can go back to edit fields before saving.</div>
            </CardContent>
          </Card>
        )}
      </div>

      <StickyActions
        left={step > 1 ? (
          <button className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
            ← Back
          </button>
        ) : null}
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
              <Button onClick={saveEdits}>Save changes</Button>
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
