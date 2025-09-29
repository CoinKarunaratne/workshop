import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobStatus } from "@/lib/dummy-jobs";

const styles: Record<JobStatus, string> = {
  "In Workshop": "bg-muted text-foreground",
  "Waiting Parts": "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100",
  "Waiting for Concent": "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
  "Completed": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
  "Invoice Sent": "bg-muted text-foreground",
  "Payment completed": "bg-muted text-foreground",
  "Collected": "bg-muted text-foreground",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge className={cn("font-normal", styles[status])}>{status}</Badge>;
}
