// src/components/marketing/pricing.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "for 14 days",
    features: ["1 location", "Up to 3 users", "Jobs & customers", "AI invoice suggestions"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    cadence: "/month per location",
    features: ["Unlimited users", "Advanced automations", "Xero-ready exports", "Priority support"],
    cta: "Upgrade",
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b">
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">Simple pricing</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">Start free. Grow when you’re ready.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tiers.map(tier => (
            <Card key={tier.name} className={tier.highlighted ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{tier.name}</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{tier.cadence}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild><a href="/signup">{tier.cta}</a></Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
