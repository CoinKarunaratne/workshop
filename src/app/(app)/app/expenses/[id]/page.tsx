// src/app/(app)/expenses/[id]/page.tsx
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { getExpenseById, upsertExpense, deleteExpense } from "@/lib/dummy-expenses";
import { expenseTypeEnum, type ExpenseType, type Expense } from "@/lib/types";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const existing = getExpenseById(id);
  if (!existing) {
    return (
      <div className="p-4 sm:p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/app/expenses")} className="-ml-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Expenses
        </Button>
        <Card className="mt-4 border-destructive/40">
          <CardHeader><CardTitle>Expense not found</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The expense you’re looking for doesn’t exist or was removed.
          </CardContent>
        </Card>
      </div>
    );
  }

  const [draft, setDraft] = React.useState<Expense>({ ...existing });
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [delOpen, setDelOpen] = React.useState(false);

  const mark = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const issues = React.useMemo(() => {
    const errs: Record<string, string> = {};
    if (!draft.description.trim()) errs.description = "Description is required.";
    if (!(String(draft.amount).trim().length && !Number.isNaN(Number(draft.amount)) && Number(draft.amount) >= 0)) {
      errs.amount = "Enter a valid amount.";
    }
    if (!draft.date) errs.date = "Date is required.";
    if (!draft.type) errs.type = "Expense type is required.";
    return errs;
  }, [draft.description, draft.amount, draft.date, draft.type]);

  function save(e?: React.FormEvent) {
    e?.preventDefault();
    setSubmitted(true);
    if (Object.keys(issues).length) return;

    const updated: Expense = {
      ...draft,
      amount: Number(draft.amount),
      updatedAt: new Date().toISOString(),
    };
    upsertExpense(updated);
    toast.success("Expense saved");
    router.push("/app/expenses");
  }

  function confirmDelete() {
    deleteExpense(draft.id);
    toast.success("Expense deleted");
    setDelOpen(false);
    router.push("/app/expenses");
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/app/expenses")} className="-ml-1">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-semibold">Edit Expense</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={() => setDelOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
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
                  min="0"
                  step="0.01"
                  value={String(draft.amount)}
                  onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
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
                <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as ExpenseType })}>
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
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
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
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete expense</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Are you sure you want to delete <b>{existing.description}</b>?
          </div>
          <Separator className="my-2" />
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
