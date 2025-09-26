// src/components/app/new/sticky-actions.tsx
"use client";

import { cn } from "@/lib/utils";

export function StickyActions({
  left,
  right,
  className,
}: {
  left?: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) {
  // Sits above content; slight backdrop + border; safe for mobile thumbs
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/80 backdrop-blur",
        "px-4 py-3 sm:px-6",
        className
      )}
      role="region"
      aria-label="Page actions"
    >
      <div className="mx-auto flex max-w-screen-lg items-center justify-between gap-3">
        <div className="min-h-9">{left}</div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </div>
  );
}
