// src/components/form/form-message.tsx
import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormMessage({
  type = "error",
  id,
  children,
  className,
}: {
  type?: "error" | "hint";
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const styles =
    type === "error"
      ? "text-red-600"
      : "text-muted-foreground";
  const Icon = type === "error" ? AlertCircle : Info;

  return (
    <p
      id={id}
      role={type === "error" ? "alert" : undefined}
      aria-live={type === "error" ? "polite" : undefined}
      className={cn("mt-1.5 flex items-center gap-1.5 text-xs", styles, className)}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
