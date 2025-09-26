// src/app/(auth)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Account — WrenchFlow", template: "%s — WrenchFlow" },
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-cols-1 md:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Right: visual panel */}
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-muted" />
        <div className="absolute inset-10 rounded-lg border bg-background shadow-2xl" />
      </div>
    </div>
  );
}
