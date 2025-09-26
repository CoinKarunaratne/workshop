// src/components/app/new/required.tsx
"use client";

import { cn } from "@/lib/utils";

export function RequiredAsterisk({ className }: { className?: string }) {
  return <span className={cn("ml-1 text-destructive", className)} aria-hidden="true">*</span>;
}

export function FieldHint({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <p id={id} className={cn("mt-1 text-xs text-destructive", className)}>
      {children}
    </p>
  );
}
