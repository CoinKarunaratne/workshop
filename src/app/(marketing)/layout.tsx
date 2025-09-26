// app/(marketing)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MechanicAI — AI Workshop Management",
  description: "Run your auto repair workshop smarter with AI.",
  robots: { index: true, follow: true },
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      {/* <Navbar /> if you want it on every marketing page */}
      {children}
      {/* <Footer /> */}
    </div>
  );
}
