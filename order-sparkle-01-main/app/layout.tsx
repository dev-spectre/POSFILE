"use client"

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Fast Billing - Restaurant POS System",
  description: "A professional SaaS Restaurant POS (Point of Sale) system with menu management, billing, payments, and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
