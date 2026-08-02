import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuPageClient } from "@/components/menu/MenuPageClient";

export const metadata: Metadata = {
  title: "Menu | Da Pizza Hub",
  description:
    "Browse the complete Da Pizza Hub menu featuring premium 100% Pure Veg pizzas, burgers, pasta, wraps, garlic bread, shakes, beverages and more.",
};

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg pt-28" />}>
      <MenuPageClient />
    </Suspense>
  );
}