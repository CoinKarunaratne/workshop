// src/components/app/new/validation-summary.tsx
"use client";

type Issue = { field: string; message: string };

export function ValidationSummary({
  issues,
  className = "",
  title = "Please fix the following",
}: {
  issues: Issue[];
  className?: string;
  title?: string;
}) {
  if (!issues.length) return null;
  return (
    <div className={`rounded-md border border-destructive/30 bg-destructive/5 p-3 ${className}`}>
      <div className="mb-2 text-sm font-medium text-destructive">{title}</div>
      <ul className="space-y-1 text-sm text-destructive">
        {issues.map((i) => (
          <li key={i.field}>• {i.message}</li>
        ))}
      </ul>
    </div>
  );
}
