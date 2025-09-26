import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/dummy-jobs";

const styles: Record<JobStatus, string> = {
  "Booked": "bg-muted text-foreground",
  "In Workshop": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100",
  "Waiting Parts": "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
  "Completed": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
  "Collected": "bg-muted text-foreground",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge className={cn("font-normal", styles[status])}>{status}</Badge>;
}
