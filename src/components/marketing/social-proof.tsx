// src/components/marketing/social-proof.tsx
export function SocialProof() {
    return (
      <section aria-label="Trusted by" className="border-b">
        <div className="container mx-auto px-4 py-10">
          <p className="mb-6 text-center text-sm text-muted-foreground">Trusted by independent mechanics & service centers</p>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 opacity-70 sm:grid-cols-3 md:grid-cols-5">
            {["TorqueCo", "Auto+,", "DriveHQ", "RotorLab", "KwikTyre"].map((n) => (
              <div key={n} className="flex items-center justify-center rounded border bg-muted/20 p-4 text-xs">{n}</div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  