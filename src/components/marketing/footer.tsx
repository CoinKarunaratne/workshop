// src/components/marketing/footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto grid gap-6 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <span className="inline-block size-5 rounded bg-primary" />
            WrenchFlow
          </div>
          <p className="text-sm text-muted-foreground">AI‑powered workshop management for modern garages.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/signin">Sign in</Link></li>
            <li><Link href="/signup">Start free</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} WrenchFlow. All rights reserved.
      </div>
    </footer>
  );
}
