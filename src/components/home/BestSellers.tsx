"use client";

import { useState } from "react";
import { Reveal, StaggerContainer, staggerItem } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/menu/ProductCard";
import { CustomizeModal } from "@/components/menu/CustomizeModal";
import { pizzas } from "@/data/pizzas";
import { burgers, pastas, breads, desserts } from "@/data/food";
import { PizzaItem } from "@/types";
import { motion } from "framer-motion";

const bestSellerItems = [
  ...pizzas.filter((p) => p.isBestSeller),
  ...burgers.filter((b) => b.isBestSeller),
  ...pastas.filter((p) => p.isBestSeller),
  ...breads.filter((b) => b.isBestSeller),
  ...desserts.filter((d) => d.isBestSeller),
];

export function BestSellers() {
  const [customizeItem, setCustomizeItem] = useState<PizzaItem | null>(null);

  return (
    <section className="py-24 lg:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
            <div>
              <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
                Fan Favourites
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">Best Sellers</h2>
            </div>
          </div>
        </Reveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {bestSellerItems.slice(0, 5).map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <ProductCard item={item} onCustomize={setCustomizeItem} />
            </motion.div>
          ))}
        </StaggerContainer>
      </div>

      <CustomizeModal item={customizeItem} onClose={() => setCustomizeItem(null)} />
    </section>
  );
}
