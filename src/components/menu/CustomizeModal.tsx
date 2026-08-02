"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Minus, Plus } from "lucide-react";
import { PizzaItem, SizeKey, PizzaCustomization } from "@/types";
import { pizzaAddOns, vegVegetableToppings, vegVegetablePricing, sizeLabels } from "@/data/pizzas";
import { formatINR } from "@/lib/utils";
import { useCartStore, calculatePizzaUnitPrice, buildCustomizationSummary } from "@/store/cart";

interface CustomizeModalProps {
  item: PizzaItem | null;
  onClose: () => void;
}

export function CustomizeModal({ item, onClose }: CustomizeModalProps) {
  const addLine = useCartStore((s) => s.addLine);
  const openCart = useCartStore((s) => s.openCart);

  const [size, setSize] = useState<SizeKey>("medium");
  const [extraCheese, setExtraCheese] = useState(false);
  const [cheeseBurst, setCheeseBurst] = useState(false);
  const [panBase, setPanBase] = useState(false);
  const [toppings, setToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const customization: PizzaCustomization = useMemo(
    () => ({ size, extraCheese, cheeseBurst, panBase, extraToppings: toppings }),
    [size, extraCheese, cheeseBurst, panBase, toppings]
  );

  if (!item) return null;

  const basePrice = item.prices[size];
  const unitPrice = calculatePizzaUnitPrice(basePrice, customization);
  const total = unitPrice * quantity;

  function toggleTopping(id: string) {
    setToppings((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleAddToCart() {
    if (!item) return;

    const toppingNames = vegVegetableToppings
      .filter((t) => toppings.includes(t.id))
      .map((t) => t.name);

    addLine({
      itemId: item.id,
      name: `${item.name} (${sizeLabels[size].label})`,
      image: item.image,
      basePrice,
      quantity,
      customization,
      customizationSummary: buildCustomizationSummary(customization, toppingNames),
      unitPrice,
    });

    onClose();
    openCart();
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-surface sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-card-hover"
          >
            {/* Header image */}
            <div className="relative h-44 sm:h-52 shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-white" />
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="font-display text-2xl font-semibold text-white">{item.name}</h2>
                <p className="text-sm text-white/70">{item.description}</p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-5 sm:px-6 py-5 flex-1 space-y-7">
              {/* Size */}
              <div>
                <h3 className="text-sm font-semibold text-ink-primary mb-3">Choose Size</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["regular", "medium", "large"] as SizeKey[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`relative py-3 px-2 rounded-xl border text-center transition-all duration-300 ${
                        size === s
                          ? "border-accent bg-accent/10 text-white"
                          : "border-white/10 text-ink-secondary hover:border-white/25"
                      }`}
                    >
                      <span className="block text-sm font-semibold">{sizeLabels[s].label}</span>
                      <span className="block text-[10px] text-ink-muted mt-0.5">{sizeLabels[s].note}</span>
                      <span className="block text-xs font-bold mt-1.5 text-gold">
                        {formatINR(item.prices[s])}
                      </span>
                      {size === s && (
                        <motion.div
                          layoutId="size-check"
                          className="absolute -top-1.5 -right-1.5 bg-accent rounded-full p-0.5"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <h3 className="text-sm font-semibold text-ink-primary mb-3">Add-ons</h3>
                <div className="space-y-2.5">
                  <AddOnRow
                    label="Extra Cheese"
                    price={pizzaAddOns.extraCheese[size]}
                    checked={extraCheese}
                    onToggle={() => setExtraCheese(!extraCheese)}
                  />
                  <AddOnRow
                    label="Cheese Burst"
                    price={pizzaAddOns.cheeseBurst[size]}
                    checked={cheeseBurst}
                    onToggle={() => setCheeseBurst(!cheeseBurst)}
                  />
                  <AddOnRow
                    label="Pan Base"
                    price={pizzaAddOns.panBase[size]}
                    checked={panBase}
                    onToggle={() => setPanBase(!panBase)}
                  />
                </div>
              </div>

              {/* Toppings */}
              <div>
                <h3 className="text-sm font-semibold text-ink-primary mb-1">Extra Toppings</h3>
                <p className="text-xs text-ink-muted mb-3">
                  {formatINR(vegVegetablePricing[size])} each
                </p>
                <div className="flex flex-wrap gap-2">
                  {vegVegetableToppings.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t.id)}
                      className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${
                        toppings.includes(t.id)
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-white/10 text-ink-secondary hover:border-white/25"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer: quantity + add to cart */}
            <div className="shrink-0 border-t border-white/5 px-5 sm:px-6 py-4 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 bg-card rounded-full px-2 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1.5 rounded-full hover:bg-hover transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1.5 rounded-full hover:bg-hover transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-ink-muted block leading-none mb-1">Total</span>
                  <span className="text-xl font-bold text-ink-primary">{formatINR(total)}</span>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="magnetic-btn w-full py-3.5 rounded-full bg-accent hover:bg-accent-bright text-white font-semibold transition-all duration-300 active:scale-95 shadow-accentGlow"
              >
                Add to Cart — {formatINR(total)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AddOnRow({
  label,
  price,
  checked,
  onToggle,
}: {
  label: string;
  price: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
        checked ? "border-accent bg-accent/10" : "border-white/10 hover:border-white/25"
      }`}
    >
      <span className="text-sm text-ink-primary">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gold font-semibold">+{formatINR(price)}</span>
        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            checked ? "bg-accent border-accent" : "border-white/25"
          }`}
        >
          {checked && <Check size={12} className="text-white" />}
        </div>
      </div>
    </button>
  );
}
