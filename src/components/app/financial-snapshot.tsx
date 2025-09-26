// src/components/app/financial-snapshot.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { revenueSeries } from "@/lib/dummy";

export function FinancialSnapshot() {
  const max = Math.max(...revenueSeries.map((d) => d.value)) || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue (Last 7 days)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Fixed chart height */}
        <div className="flex h-40 items-end gap-3">
          {revenueSeries.map((d) => {
            const pct = (d.value / max) * 100;
            return (
              <div key={d.day} className="flex h-full flex-col items-center gap-2">
                {/* Track with definite height */}
                <div className="relative h-full w-8 overflow-hidden rounded border bg-muted">
                  {/* Fill from bottom using percentage */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: `${Math.max(2, pct)}%`, // keep tiny values visible
                      // Use color-mix so it works with OKLCH theme tokens:
                      background: "color-mix(in oklch, var(--primary) 28%, transparent)",
                    }}
                    title={`${d.day}: $${d.value.toLocaleString()}`}
                    aria-label={`${d.day} revenue ${d.value}`}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{d.day}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Total: ${revenueSeries.reduce((a, b) => a + b.value, 0).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
