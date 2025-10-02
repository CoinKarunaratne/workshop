// src/lib/dummy-expenses.ts
import { nanoid } from "nanoid";
import { type Expense, type ExpenseType } from "@/lib/types";

/** Demo in-memory store */
export const EXPENSES: Expense[] = [];

/** Create a new record (id + timestamps) */
export function createExpense(input: Omit<Expense, "id" | "createdAt" | "updatedAt">): Expense {
  const now = new Date().toISOString();
  const exp: Expense = {
    id: nanoid(),
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  EXPENSES.unshift(exp); // newest first
  return exp;
}

/** Upsert (by id) */
export function upsertExpense(expense: Expense) {
  const i = EXPENSES.findIndex((e) => e.id === expense.id);
  if (i === -1) EXPENSES.unshift(expense);
  else EXPENSES[i] = expense;
}

/** Delete by id */
export function deleteExpense(id: string) {
  const i = EXPENSES.findIndex((e) => e.id === id);
  if (i !== -1) EXPENSES.splice(i, 1);
}

/** Optional seed for local demos */
export function seedDemoExpenses() {
  if (EXPENSES.length) return;

  const seed: Array<{
    description: string;
    amount: number;
    type: ExpenseType;
    date: string; // YYYY-MM-DD
  }> = [
    { description: "Spark fibre (Sep)", amount: 129.0, type: "Internet & Telephone", date: "2025-09-05" },
    { description: "Facebook ads", amount: 220.0, type: "Marketing & Web design", date: "2025-09-10" },
    { description: "Shop towels & cleaner", amount: 58.5, type: "Consumables & Cleaning Materials", date: "2025-08-27" },
    { description: "Courier parts return", amount: 19.99, type: "Postage & Freights", date: "2025-07-18" },
    { description: "Fuel round trip (parts pickup)", amount: 46.2, type: "Fuel & Travel", date: "2025-07-04" },
    { description: "Uniform polos (2x)", amount: 78.0, type: "Uniforms", date: "2025-06-14" },
  ];

  for (const s of seed) {
    createExpense({
      description: s.description,
      amount: s.amount,
      type: s.type,
      date: s.date,
    });
  }
}

/** Helpers for grouping/filtering */
export function getYear(date: string) {
  return new Date(date).getFullYear();
}

export function getMonth(date: string) {
  // 1-12
  return new Date(date).getMonth() + 1;
}

/** Return unique years from store (DESC) */
export function listYears(): number[] {
  const ys = new Set<number>();
  for (const e of EXPENSES) ys.add(getYear(e.date));
  return [...ys].sort((a, b) => b - a);
}

// Get one expense by id (null if not found)
export function getExpenseById(id: string) {
    return EXPENSES.find((e) => e.id === id) ?? null;
  }
  
