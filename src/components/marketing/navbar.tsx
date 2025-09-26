// src/components/marketing/navbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features", kind: "hash" },
  { href: "#how", label: "How it works", kind: "hash" },
  { href: "#pricing", label: "Pricing", kind: "hash" },
  { href: "#faq", label: "FAQ", kind: "hash" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/75 backdrop-blur transition-shadow",
        scrolled ? "shadow-sm" : "shadow-none"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden className="inline-block size-6 rounded bg-primary" />
          WrenchFlow
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm transition-colors",
                "text-muted-foreground hover:text-foreground",
                // crude active state if you're on "/" and clicked hash anchors
                pathname === "/" ? "aria-[current=page]:text-foreground" : ""
              )}
            >
              {l.label}
            </a>
          ))}
          <div className="ml-4 flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="mt-8 flex flex-col gap-4">
                {links.map((l) => (
                  <a key={l.href} href={l.href} className="text-base text-foreground">
                    {l.label}
                  </a>
                ))}
                <Button asChild className="mt-2">
                  <Link href="/signup">Start free</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign in</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Thin gradient underline */}
      <div className="gradient-bar" aria-hidden />
    </header>
  );
}
