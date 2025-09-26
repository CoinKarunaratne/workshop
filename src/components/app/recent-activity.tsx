// src/components/app/recent-activity.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivity } from "@/lib/dummy";

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivity.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1 size-2 rounded-full bg-primary" />
            <div className="text-sm leading-tight">
              <div>{a.text}</div>
              <div className="text-xs text-muted-foreground">{a.when} ago</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
