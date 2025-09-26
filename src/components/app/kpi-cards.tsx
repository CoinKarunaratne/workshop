// src/components/app/kpi-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, CheckCircle2, Package, FileWarning, DollarSign } from "lucide-react";
import { metrics } from "@/lib/dummy";

const items = [
  { label: "Jobs in Progress", value: metrics.jobsInProgress, Icon: Wrench },
  { label: "Completed Today", value: metrics.completedToday, Icon: CheckCircle2 },
  { label: "Awaiting Parts", value: metrics.awaitingParts, Icon: Package },
  { label: "Unpaid Invoices", value: metrics.unpaidInvoices, Icon: FileWarning },
  { label: "Revenue (This Week)", value: `$${metrics.revenueWeek.toLocaleString()}`, Icon: DollarSign },
];

export function KpiCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(({ label, value, Icon }) => (
        <Card key={label} className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <Badge variant="secondary" className="mt-2">Live</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
