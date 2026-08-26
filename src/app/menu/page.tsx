import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuPageClient } from "@/components/menu/MenuPageClient";
import { getMenuItems } from "@/lib/data";

export const metadata: Metadata = {
  title: "Menu | Da Pizza Hub",
  description:
    "Browse the complete Da Pizza Hub menu featuring premium 100% Pure Veg pizzas, burgers, pasta, wraps, garlic bread, shakes, beverages and more.",
};

// Fetched server-side from the database (falls back to the static menu
// files if DATABASE_URL isn't configured — see src/lib/data.ts) so items
// added, priced, or 86'd from /admin/menu show up here without a
// redeploy.
export default async function MenuPage() {
  const items = await getMenuItems();

  return (
    <Suspense fallback={<div className="min-h-screen bg-bg pt-28" />}>
      <MenuPageClient items={items} />
    </Suspense>
  );
}