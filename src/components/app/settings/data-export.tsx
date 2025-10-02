"use client";

import * as React from "react";
import { toast } from "sonner";
import { saveAs } from "file-saver";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// demo stores you already have
import { CUSTOMERS } from "@/lib/dummy-customers";
import { VEHICLES } from "@/lib/dummy-vehicles";
import { JOBS } from "@/lib/dummy-jobs";
import { INVOICES } from "@/lib/dummy-invoices";
import { QUOTATIONS } from "@/lib/dummy-quotations";
// If you added expenses:
import { EXPENSES } from "@/lib/dummy-expenses"; // optional, ignore if not present

// ---------- helpers (CSV only for now) ----------
function toCSV<T extends object>(rows: T[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0] as any);
  const escape = (v: any) =>
    v == null ? "" : String(v).includes(",") || String(v).includes('"') || String(v).includes("\n")
      ? `"${String(v).replace(/"/g, '""')}"`
      : String(v);
  const head = headers.join(",");
  const body = rows.map((r) => headers.map((h) => escape((r as any)[h])).join(",")).join("\n");
  return `${head}\n${body}`;
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename);
}

const ENTITIES = [
  { key: "customers", label: "Customers" },
  { key: "vehicles", label: "Vehicles" },
  { key: "jobs", label: "Jobs" },
  { key: "invoices", label: "Invoices" },
  { key: "quotations", label: "Quotations" },
  { key: "expenses", label: "Expenses" }, // optional
] as const;

type EntityKey = typeof ENTITIES[number]["key"];

type ExportState = {
  // which entities to include
  selected: Record<EntityKey, boolean>;
  // optional date range filter (applies to entities that have a `date` or `createdAt`)
  from?: string;
  to?: string;
  // format (csv for now)
  format: "csv";
};

type ImportState = {
  entity: EntityKey;
  // parsed preview
  headers: string[];
  rows: string[][];
  mapping: Record<string, string>; // header -> field
};

export function DataExportPanel() {
  // ------- EXPORT -------
  const [ex, setEx] = React.useState<ExportState>({
    selected: {
      customers: true,
      vehicles: true,
      jobs: false,
      invoices: false,
      quotations: false,
      expenses: false,
    },
    format: "csv",
  });

  function runExport() {
    const include = (k: EntityKey) => ex.selected[k];

    // naive date filter helper
    const inRange = (d?: string) => {
      if (!d) return true;
      const t = new Date(d).getTime();
      if (ex.from && t < new Date(ex.from).getTime()) return false;
      if (ex.to && t > new Date(ex.to).getTime()) return false;
      return true;
    };

    let files: { name: string; csv: string }[] = [];

    if (include("customers")) {
      const rows = CUSTOMERS.filter((c: any) => inRange(c.lastVisit));
      files.push({ name: "customers.csv", csv: toCSV(rows) });
    }
    if (include("vehicles")) {
      const rows = (VEHICLES as any[]).filter((v) => true);
      files.push({ name: "vehicles.csv", csv: toCSV(rows) });
    }
    if (include("jobs")) {
      const rows = (JOBS as any[]).filter((j) => inRange(j.createdAt));
      files.push({ name: "jobs.csv", csv: toCSV(rows) });
    }
    if (include("invoices")) {
      const rows = (INVOICES as any[]).filter((i) => inRange(i.date ?? i.createdAt));
      files.push({ name: "invoices.csv", csv: toCSV(rows) });
    }
    if (include("quotations")) {
      const rows = (QUOTATIONS as any[]).filter((q) => inRange(q.date ?? q.createdAt));
      files.push({ name: "quotations.csv", csv: toCSV(rows) });
    }
    try {
      // optional expenses dataset
      // @ts-ignore
      if (include("expenses") && typeof EXPENSES !== "undefined") {
        // @ts-ignore
        const rows = (EXPENSES as any[]).filter((e) => inRange(e.date));
        files.push({ name: "expenses.csv", csv: toCSV(rows) });
      }
    } catch {}

    if (!files.length) {
      toast.message("Nothing selected to export.");
      return;
    }

    if (files.length === 1) {
      downloadCSV(files[0].name, files[0].csv);
    } else {
      // simple multi-file: download each (ZIP could come later)
      files.forEach((f) => downloadCSV(f.name, f.csv));
    }
    toast.success("Export generated.");
  }

  // ------- IMPORT (front-end preview + mapping only) -------
  const [imp, setImp] = React.useState<ImportState>({
    entity: "customers",
    headers: [],
    rows: [],
    mapping: {},
  });

  function onPickFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) {
        toast.error("File appears empty.");
        return;
      }
      const headers = lines[0].split(",");
      const rows = lines.slice(1).map((l) => l.split(","));
      const mapping: Record<string, string> = {};
      headers.forEach((h) => (mapping[h] = h)); // naive default 1:1
      setImp((s) => ({ ...s, headers, rows, mapping }));
      toast.success(`Parsed ${rows.length} row(s). Map the fields and Import.`);
    };
    reader.readAsText(file);
  }

  function importRows() {
    const count = imp.rows.length;
    if (!count) {
      toast.message("No rows to import.");
      return;
    }
    // This is a stub; later you’ll send to Supabase RPC / server action.
    toast.success(`Pretended to import ${count} ${imp.entity} row(s).`);
  }

  return (
    <div className="space-y-6">
      {/* EXPORT */}
      <Card>
        <CardHeader>
          <CardTitle>Export data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Download CSV files for the entities you choose. You can filter by date where applicable.
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="font-medium">Entities</div>
              <div className="grid grid-cols-2 gap-2">
                {ENTITIES.map((e) => (
                  <label key={e.key} className="inline-flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={!!ex.selected[e.key]}
                      onCheckedChange={(v) =>
                        setEx((s) => ({
                          ...s,
                          selected: { ...s.selected, [e.key]: Boolean(v) },
                        }))
                      }
                    />
                    {e.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Date range (optional)</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={ex.from ?? ""}
                    onChange={(e) => setEx((s) => ({ ...s, from: e.target.value || undefined }))}
                  />
                </div>
                <div>
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={ex.to ?? ""}
                    onChange={(e) => setEx((s) => ({ ...s, to: e.target.value || undefined }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Format</Label>
              <Select
                value={ex.format}
                onValueChange={(v) => setEx((s) => ({ ...s, format: v as "csv" }))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  {/* future: <SelectItem value="xlsx">XLSX</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={runExport}>Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* IMPORT */}
      <Card>
        <CardHeader>
          <CardTitle>Import data (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Bring data from other systems. Upload a CSV, map the columns, preview, then import.
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Target entity</Label>
              <Select
                value={imp.entity}
                onValueChange={(v) => setImp((s) => ({ ...s, entity: v as EntityKey }))}
              >
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITIES.map((e) => (
                    <SelectItem key={e.key} value={e.key}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-3">
                <input
                  id="import-file"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />
                <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>
                  Choose CSV…
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => downloadCSV(`${imp.entity}-template.csv`, "name\n")}
                >
                  Download template
                </Button>
              </div>

              {imp.rows.length > 0 && (
                <div className="rounded-md border p-3 text-sm">
                  <div className="mb-2 font-medium">Preview ({imp.rows.length} rows)</div>
                  <div className="max-h-44 overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 bg-background">
                        <tr>
                          {imp.headers.map((h) => (
                            <th key={h} className="px-2 py-1 text-left font-medium">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {imp.rows.slice(0, 5).map((r, i) => (
                          <tr key={i} className="border-t">
                            {r.map((c, j) => (
                              <td key={j} className="px-2 py-1">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {imp.rows.length > 5 && (
                          <tr className="text-muted-foreground">
                            <td className="px-2 py-1" colSpan={imp.headers.length}>
                              …and {imp.rows.length - 5} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Mapping */}
            {imp.rows.length > 0 && (
              <div className="space-y-3">
                <Label>Field mapping</Label>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="p-2 text-left">CSV column</th>
                        <th className="p-2 text-left">Map to field</th>
                      </tr>
                    </thead>
                    <tbody>
                      {imp.headers.map((h) => (
                        <tr key={h} className="border-t">
                          <td className="p-2">{h}</td>
                          <td className="p-2">
                            <Input
                              value={imp.mapping[h] ?? ""}
                              onChange={(e) =>
                                setImp((s) => ({
                                  ...s,
                                  mapping: { ...s.mapping, [h]: e.target.value },
                                }))
                              }
                              placeholder="e.g. name, email, rego…"
                              className="h-8"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setImp({ ...imp, rows: [], headers: [], mapping: {} })}>
                    Clear
                  </Button>
                  <Button onClick={importRows}>Import</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
