// src/components/app/bookings-list.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookings } from "@/lib/dummy";

export function BookingsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today’s Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bookings.map((b, i) => (
          <div key={i} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="text-sm font-medium">{b.time} • {b.rego}</div>
              <div className="text-xs text-muted-foreground">{b.customer} — {b.service}</div>
            </div>
            <span className="rounded bg-muted px-2 py-1 text-xs">{b.status}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
