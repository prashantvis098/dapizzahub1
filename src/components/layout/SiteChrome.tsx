"use client";

import { usePathname } from "next/navigation";
import type { Branch } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileOrderBar } from "@/components/cart/MobileOrderBar";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";
import { AIAssistant } from "@/components/assistant/AIAssistant";

export function SiteChrome({
  children,
  branches,
}: {
  children: React.ReactNode;
  branches: Branch[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      <Navbar />
      <main>{children}</main>
      <Footer branches={branches} />
      <CartDrawer />
      <MobileOrderBar />
      <FloatingWhatsApp branches={branches} />
      <AIAssistant />
    </SmoothScrollProvider>
  );
}
