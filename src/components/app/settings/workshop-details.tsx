// src/components/app/settings/workshop-details.tsx
"use client";

import * as React from "react";
import {
  getWorkshop,
  updateWorkshop,
  type WorkshopSettings,
} from "@/lib/dummy-settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export function WorkshopDetailsPanel() {
  const [view, setView] = React.useState<WorkshopSettings>(getWorkshop());
  const [edit, setEdit] = React.useState<WorkshopSettings | null>(null);

  const isEditing = edit != null;
  const model = isEditing ? edit! : view;

  function startEdit() {
    setEdit({ ...view });
  }
  function cancel() {
    setEdit(null);
  }
  function save() {
    if (!edit) return;
    const next = updateWorkshop(edit);
    setView(next);
    setEdit(null);
    toast.success("Workshop details saved");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Workshop Details</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Logo, registration info, and booking reminder preferences.
          </p>
        </div>

        {isEditing ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={cancel}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        ) : (
          <Button className="shrink-0" onClick={startEdit}>
            Edit
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {/* Layout: logo rail (left) + form (right) on md+, stacked on mobile */}
        <div className="grid gap-8 md:grid-cols-[220px,1fr]">
          {/* Logo rail */}
          <div className="space-y-3 md:border-r md:pr-6">
            <div className="space-y-2">
              <div className="text-sm font-medium">Logo</div>
              <LogoUploader
                url={model.logoDataUrl || model.logoUrl}
                onChange={(dataUrl) => {
                  if (isEditing) setEdit({ ...model, logoDataUrl: dataUrl });
                  else {
                    const next = updateWorkshop({ logoDataUrl: dataUrl });
                    setView(next);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                PNG / JPG / GIF. ~3 MB max recommended. (In production this will
                upload to Supabase Storage.)
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="space-y-8 md:pl-2">
            {/* Identity */}
            <section className="space-y-4">
              <SectionTitle>Identity</SectionTitle>

              <FieldBlock>
                <Field label="Name">
                  {isEditing ? (
                    <Input
                      value={model.name}
                      onChange={(e) =>
                        setEdit({ ...model, name: e.target.value })
                      }
                    />
                  ) : (
                    <FieldValue>{model.name || "—"}</FieldValue>
                  )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="GST Registration No.">
                    {isEditing ? (
                      <Input
                        value={model.gstRegNo ?? ""}
                        onChange={(e) =>
                          setEdit({ ...model, gstRegNo: e.target.value })
                        }
                      />
                    ) : (
                      <FieldValue>{model.gstRegNo || "—"}</FieldValue>
                    )}
                  </Field>

                  <Field label="WOF Organisation No.">
                    {isEditing ? (
                      <Input
                        value={model.wofOrgNo ?? ""}
                        onChange={(e) =>
                          setEdit({ ...model, wofOrgNo: e.target.value })
                        }
                      />
                    ) : (
                      <FieldValue>{model.wofOrgNo || "—"}</FieldValue>
                    )}
                  </Field>
                </div>

                <Field label="Licence Details">
                  {isEditing ? (
                    <Textarea
                      rows={4}
                      value={model.licenceDetails ?? ""}
                      onChange={(e) =>
                        setEdit({
                          ...model,
                          licenceDetails: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {model.licenceDetails || "—"}
                    </pre>
                  )}
                </Field>
              </FieldBlock>
            </section>

            <Separator />

            {/* Reminders */}
            <section className="space-y-4">
              <SectionTitle>Booking Reminders</SectionTitle>

              <FieldBlock>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Registered for GST">
                    <Toggle
                      checked={model.registeredForGst}
                      onChange={(v) =>
                        isEditing
                          ? setEdit({ ...model, registeredForGst: v })
                          : setView(updateWorkshop({ registeredForGst: v }))
                      }
                      disabled={!isEditing}
                    />
                  </Field>

                  <Field label="Reminder channel">
                    {isEditing ? (
                      <div className="flex gap-4">
                        <Radio
                          name="rem-by"
                          label="Email"
                          checked={model.bookingReminderBy === "email"}
                          onChange={() =>
                            setEdit({ ...model, bookingReminderBy: "email" })
                          }
                        />
                        <Radio
                          name="rem-by"
                          label="SMS"
                          checked={model.bookingReminderBy === "sms"}
                          onChange={() =>
                            setEdit({ ...model, bookingReminderBy: "sms" })
                          }
                        />
                      </div>
                    ) : (
                      <FieldValue>
                        {model.bookingReminderBy.toUpperCase()}
                      </FieldValue>
                    )}
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Send booking reminder">
                    <Toggle
                      checked={model.sendBookingReminder}
                      onChange={(v) =>
                        isEditing
                          ? setEdit({ ...model, sendBookingReminder: v })
                          : setView(updateWorkshop({ sendBookingReminder: v }))
                      }
                      disabled={!isEditing}
                    />
                  </Field>

                  <Field label="Send booking confirmation">
                    <Toggle
                      checked={model.sendBookingConfirmation}
                      onChange={(v) =>
                        isEditing
                          ? setEdit({
                              ...model,
                              sendBookingConfirmation: v,
                            })
                          : setView(
                              updateWorkshop({ sendBookingConfirmation: v })
                            )
                      }
                      disabled={!isEditing}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First reminder">
                    {isEditing ? (
                      <NumberWithSuffix
                        value={model.firstReminderDays}
                        onChange={(n) =>
                          setEdit({ ...model, firstReminderDays: n })
                        }
                      />
                    ) : (
                      <FieldValue>
                        {model.firstReminderDays != null
                          ? `${model.firstReminderDays} day(s) before booking date`
                          : "—"}
                      </FieldValue>
                    )}
                  </Field>

                  <Field label="Second reminder">
                    {isEditing ? (
                      <NumberWithSuffix
                        value={model.secondReminderDays}
                        onChange={(n) =>
                          setEdit({ ...model, secondReminderDays: n })
                        }
                      />
                    ) : (
                      <FieldValue>
                        {model.secondReminderDays != null
                          ? `${model.secondReminderDays} day(s) before booking date`
                          : "—"}
                      </FieldValue>
                    )}
                  </Field>
                </div>
              </FieldBlock>
            </section>

            <Separator />

            {/* Export */}
            <section className="space-y-4">
              <SectionTitle>Data Export</SectionTitle>

              <FieldBlock>
                <Field label="Send exported data to">
                  {isEditing ? (
                    <Input
                      type="email"
                      placeholder="you@garage.co.nz"
                      value={model.exportEmail ?? ""}
                      onChange={(e) =>
                        setEdit({ ...model, exportEmail: e.target.value })
                      }
                    />
                  ) : (
                    <FieldValue>{model.exportEmail || "—"}</FieldValue>
                  )}
                </Field>
              </FieldBlock>

              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {new Date(model.updatedAt).toLocaleString("en-NZ")}
              </p>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- Small building blocks ---------- */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium">{children}</div>;
}

function FieldBlock({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div>{children}</div>
    </div>
  );
}

function FieldValue({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(Boolean(v))}
        disabled={disabled}
      />
      <span>{checked ? "Yes" : "No"}</span>
    </label>
  );
}

function Radio({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5"
      />
      {label}
    </label>
  );
}

function NumberWithSuffix({
  value,
  onChange,
}: {
  value?: number;
  onChange: (n: number | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        className="w-24"
        value={value ?? value === 0 ? String(value) : ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? undefined : Number(raw));
        }}
      />
      <span className="text-sm text-muted-foreground">
        days before booking date
      </span>
    </div>
  );
}

function LogoUploader({
  url,
  onChange,
}: {
  url?: string;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, GIF).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-16 w-28 overflow-hidden rounded border bg-muted">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Logo" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No logo
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Upload
        </Button>
        {url && (
          <Button variant="ghost" onClick={() => onChange(undefined)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
