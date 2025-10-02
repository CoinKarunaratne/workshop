// src/app/(app)/expenses/new/page.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/lib/dummy-expenses";
import { expenseTypeEnum, type ExpenseType } from "@/lib/types";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function NewExpensePage() {
  const router = useRouter();

  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState<string>("");
  const [type, setType] = React.useState<ExpenseType>("Internet & Telephone");
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10));

  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const mark = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const issues = React.useMemo(() => {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = "Description is required.";
    const val = Number(amount);
    if (!(amount.trim().length && !Number.isNaN(val) && val >= 0)) errs.amount = "Enter a valid amount.";
    if (!date) errs.date = "Date is required.";
    if (!type) errs.type = "Expense type is required.";
    return errs;
  }, [description, amount, date, type]);

  function onSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(issues).length) return;

    createExpense({
      description: description.trim(),
      amount: Number(amount),
      type,
      date,
    });

    toast.success("Expense created");
    router.push("/app/expenses");
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New Expense</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  placeholder="e.g., Fibre bill, courier, uniforms…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => mark("description")}
                  aria-invalid={Boolean((submitted || touched.description) && issues.description)}
                />
                {(submitted || touched.description) && issues.description && (
                  <p className="text-xs text-destructive">{issues.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onBlur={() => mark("amount")}
                  aria-invalid={Boolean((submitted || touched.amount) && issues.amount)}
                />
                {(submitted || touched.amount) && issues.amount && (
                  <p className="text-xs text-destructive">{issues.amount}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Expense type</Label>
                <Select value={type} onValueChange={(v) => setType(v as ExpenseType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick type" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypeEnum.options.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(submitted || touched.type) && issues.type && (
                  <p className="text-xs text-destructive">{issues.type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onBlur={() => mark("date")}
                  aria-invalid={Boolean((submitted || touched.date) && issues.date)}
                />
                {(submitted || touched.date) && issues.date && (
                  <p className="text-xs text-destructive">{issues.date}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Create expense</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
