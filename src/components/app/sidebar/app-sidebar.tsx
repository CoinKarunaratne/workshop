// src/components/app/sidebar/app-sidebar.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar-content";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppTopbar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background/75 px-3 backdrop-blur lg:hidden",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          {/* ✅ Add accessible title inside SheetContent */}
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>

            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="inline-block size-5 rounded bg-primary" />
          WrenchFlow
        </div>
      </div>

      <div className="flex items-center gap-2" />
    </div>
  );
}

export function DesktopSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 border-r lg:block">
      <SidebarContent />
    </aside>
  );
}
