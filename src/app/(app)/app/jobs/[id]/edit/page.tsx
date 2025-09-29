"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { TECHS } from "@/lib/dummy-jobs";
import { getJob, updateJob } from "@/lib/data/jobs.client";

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = React.useState(true);
  const [rego, setRego] = React.useState("");
  const [customer, setCustomer] = React.useState("");
  const [tech, setTech] = React.useState<string>(TECHS[0] ?? "");
  const [service, setService] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    (async () => {
      const j = await getJob(id);
      if (!j) {
        toast.error("Job not found");
        router.push("/app/jobs");
        return;
      }
      setRego(j.rego);
      setCustomer(j.customer);
      setTech(j.technician);
      setService(""); // no service field in schema; keep as UI-only memo if needed
      setLoading(false);
    })();
  }, [id, router]);

  async function save() {
    await updateJob(id, { rego, customer, technician: tech });
    toast.success("Job updated");
    router.push(`/app/jobs/${id}`);
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-screen-lg">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Edit Job</h1>
        </div>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rego">Vehicle rego</Label>
                <Input id="rego" value={rego} onChange={(e) => setRego(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Technician</Label>
              <Select value={tech} onValueChange={setTech}>
                <SelectTrigger><SelectValue placeholder="Assign technician" /></SelectTrigger>
                <SelectContent>{TECHS.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Service (optional, UI only)</Label>
              <Input id="service" value={service} onChange={(e) => setService(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (UI only)</Label>
              <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={save}>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
