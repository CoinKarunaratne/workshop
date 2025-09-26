// src/components/app/job-pipeline.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pipeline } from "@/lib/dummy";
import { cn } from "@/lib/utils";

const colorByStage: Record<string, string> = {
  "Booked": "bg-muted text-foreground",
  "In Workshop": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100",
  "Waiting Parts": "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
  "Completed": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
  "Collected": "bg-muted text-foreground",
};

export function JobPipeline() {
  const total = pipeline.reduce((a, b) => a + b.count, 0);

  return (
    <Card id="pipeline">
      <CardHeader>
        <CardTitle>Job Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* segmented bar */}
        <div className="flex h-3 w-full overflow-hidden rounded">
          {pipeline.map((p) => (
            <div
              key={p.stage}
              title={`${p.stage}: ${p.count}`}
              className={cn("h-full", colorByStage[p.stage])}
              style={{ width: `${(p.count / total) * 100}%` }}
            />
          ))}
        </div>

        {/* legend */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {pipeline.map((p) => (
            <div key={p.stage} className="flex items-center justify-between rounded border p-2">
              <span className="text-sm">{p.stage}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs">{p.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
