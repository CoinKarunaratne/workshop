// src/components/app/settings/personal-details.tsx
"use client";

import * as React from "react";
import { getPersonalDetails, updatePersonalDetails } from "@/lib/dummy-settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function PersonalDetailsCard() {
  const [editing, setEditing] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const [form, setForm] = React.useState(() => getPersonalDetails());

  // refresh (in case other tabs update store)
  React.useEffect(() => {
    setForm(getPersonalDetails());
  }, []);

  function onCancel() {
    setForm(getPersonalDetails());
    setEditing(false);
  }

  async function onSave() {
    try {
      setBusy(true);
      const updated = updatePersonalDetails(form);
      setForm(updated);
      setEditing(false);
      toast.success("Personal details saved");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Details</CardTitle>
        {editing ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={busy}>
              Save
            </Button>
          </div>
        ) : (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Username"
            value={form.username}
            onChange={(v) => setForm((f) => ({ ...f, username: v }))}
            readOnly={!editing}
          />
          <Field
            label="Full name"
            value={form.fullName}
            onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
            readOnly={!editing}
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            readOnly={!editing}
            hint={editing ? "Changing email may require confirmation." : undefined}
          />
          <Field
            label="Mobile"
            value={form.mobile ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, mobile: v }))}
            readOnly={!editing}
            placeholder="+64 …"
          />
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Textarea
              value={form.address ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              readOnly={!editing}
              rows={3}
              className="mt-2"
              placeholder="Street, city, postcode"
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(form.updatedAt).toLocaleString("en-NZ")}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
