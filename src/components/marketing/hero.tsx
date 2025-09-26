// src/components/marketing/hero.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-2 md:items-center">
        <div>
          <Badge className="mb-4">Built for NZ workshops</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Run your workshop on autopilot with <span className="text-primary">AI</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Create jobs, keep customers updated, and get smart invoice suggestions—without the admin grind.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg"><a href="/signup">Start free</a></Button>
            <Button asChild size="lg" variant="outline"><a href="#pricing">See pricing</a></Button>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li>• 14‑day free trial</li>
            <li>• No credit card required</li>
            <li>• Cancel anytime</li>
            <li>• Works on desktop & mobile</li>
          </ul>
        </div>

        {/* Illustration placeholder */}
        <div className="relative rounded-lg border bg-muted/30 p-6">
          <div className="aspect-[16/10] w-full rounded-md border bg-background shadow-sm" />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Dashboard mockup (replace with real screenshot later)
          </p>
        </div>
      </div>
    </section>
  );
}
