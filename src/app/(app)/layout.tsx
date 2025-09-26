// src/app/(app)/layout.tsx
import type { Metadata } from "next";
import { DesktopSidebar, AppTopbar } from "@/components/app/sidebar/app-sidebar";

export const metadata: Metadata = {
  title: { default: "Dashboard — WrenchFlow", template: "%s — WrenchFlow" },
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      {/* Mobile topbar with hamburger */}
      <AppTopbar />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <DesktopSidebar />

        {/* Main content area */}
        <main className="min-h-[calc(100dvh-56px)] lg:min-h-dvh">

            {children}

        </main>
      </div>
    </div>
  );
}
