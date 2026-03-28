"use client";

import { useStore } from "@/store/posStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MobileNav from "@/components/layout/MobileNav";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // If not authenticated, we return null to prevent flashing the protected content
  if (!isAuthenticated) return null;

  return (
    <div className="pb-24 md:pb-0 min-h-screen">
      {children}
      <MobileNav />
    </div>
  );
}
