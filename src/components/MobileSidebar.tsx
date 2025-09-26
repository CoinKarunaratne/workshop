"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/Sidebar"

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle>Workshop SaaS</SheetTitle>
        </SheetHeader>
        {/* Sidebar is a full-height column; inside the sheet we let it grow */}
        <div className="mt-2">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  )
}
