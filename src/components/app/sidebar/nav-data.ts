// src/components/app/sidebar/nav-data.ts
import {
  LayoutDashboard,
  Wrench,
  Users,
  CarFront,
  FileText,
  BarChart3,
  Settings,
  Package,              // 👈 add this
} from "lucide-react";

export const NAV = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Jobs", href: "/app/jobs", icon: Wrench },
  { label: "Customers", href: "/app/customers", icon: Users },
  { label: "Vehicles", href: "/app/vehicles", icon: CarFront },
  { label: "Stocks", href: "/app/stocks", icon: Package },        // 👈 new
  { label: "Invoices", href: "/app/invoices", icon: FileText },
  { label: "Reports", href: "/app/reports", icon: BarChart3 },
];

export const NAV_FOOTER = [
  { label: "Settings", href: "/app/settings", icon: Settings },
];
