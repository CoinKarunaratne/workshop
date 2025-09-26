// src/components/marketing/feature-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, FileText, Users, Bot } from "lucide-react";

const features = [
  { icon: Wrench, title: "Job workflows", desc: "From booking to pickup with statuses, notes, and parts." },
  { icon: Users, title: "Customer updates", desc: "Auto-send SMS/email when jobs move stages." },
  { icon: FileText, title: "AI‑assisted invoices", desc: "Line suggestions & labor estimates from job notes." },
  { icon: Bot, title: "Smart insights", desc: "Daily prompts about overdue jobs, margins, and upsells." },
];

export function FeatureCards() {
  return (
    <section id="features" className="border-b">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Everything you need, less clicking</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Designed for speed at the counter and clarity on the floor.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="h-full">
              <CardHeader>
                <f.icon className="mb-2 size-6" />
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.desc}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
