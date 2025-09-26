"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { aiInsights } from "@/lib/dummy";
import { toast } from "sonner";

export function AiInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm">
          {aiInsights.map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 size-1.5 rounded-full bg-primary" />
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.message("Sent reminders (demo)")}
          >
            Run suggested actions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
