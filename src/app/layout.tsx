// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner"; // <-- sonner toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MechanicAI",
  description: "AI-powered workshop management.",
  icons: { icon: "/favicon.ico" }, 
  robots: { index: false, follow: false }// keep your existing favicon
  // metadataBase: new URL("https://yourdomain.com"), // uncomment when you have a domain
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-background text-foreground antialiased antialiased`}>
        {children}
        <Toaster position="top-right" richColors /> {/* ✅ sonner toast root */}
      </body>
    </html>
  );
}
