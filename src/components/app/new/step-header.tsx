// src/components/app/new/step-header.tsx
"use client";

import { cn } from "@/lib/utils";

export function StepHeader({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number; // 1-based
  className?: string;
}) {
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center gap-3 text-sm">
        {steps.map((label, i) => {
          const step = i + 1;
          const active = step === current;
          const done = step < current;
          return (
            <div key={label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-xs",
                  done && "bg-primary text-primary-foreground border-primary",
                  active && "bg-primary/10 text-foreground border-primary",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
                aria-current={active ? "step" : undefined}
              >
                {step}
              </div>
              <div
                className={cn(
                  "font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </div>
              {i < steps.length - 1 && (
                <div className="h-px w-8 bg-border hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
