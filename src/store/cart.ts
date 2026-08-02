"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartLine, PizzaCustomization } from "@/types";
import { validateCoupon, Coupon } from "@/data/coupons";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  subtotal: () => number;
  discount: () => number;
  total: () => number;
  itemCount: () => number;
}

function genId() {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      appliedCoupon: null,
      couponError: null,

      addLine: (line) =>
        set((state) => ({
          lines: [...state.lines, { ...line, lineId: genId() }],
        })),

      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        })),

      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.lineId === lineId ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),

      clearCart: () => set({ lines: [], appliedCoupon: null, couponError: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyCoupon: (code) => {
        const subtotal = get().subtotal();
        const result = validateCoupon(code, subtotal);
        if (result.valid) {
          set({ appliedCoupon: result.coupon, couponError: null });
        } else {
          set({ appliedCoupon: null, couponError: result.message });
        }
      },

      removeCoupon: () => set({ appliedCoupon: null, couponError: null }),

      subtotal: () => {
        return get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      },

      discount: () => {
        const { appliedCoupon } = get();
        if (!appliedCoupon) return 0;
        const subtotal = get().subtotal();
        const result = validateCoupon(appliedCoupon.code, subtotal);
        // Re-validate every time in case cart contents changed and the
        // cart no longer meets the coupon's minOrder threshold.
        return result.valid ? result.discount : 0;
      },

      total: () => {
        return Math.max(0, get().subtotal() - get().discount());
      },

      itemCount: () => {
        return get().lines.reduce((sum, l) => sum + l.quantity, 0);
      },
    }),
    {
      name: "dph-cart", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist actual cart contents — never persist isOpen (drawer
      // shouldn't reopen on a fresh page load) or the derived functions.
      partialize: (state) => ({ lines: state.lines, appliedCoupon: state.appliedCoupon }),
    }
  )
);

// ---- Pricing helpers ----

import { pizzaAddOns, vegVegetablePricing } from "@/data/pizzas";

export function calculatePizzaUnitPrice(
  basePrice: number,
  customization: PizzaCustomization
): number {
  let price = basePrice;
  const size = customization.size;

  if (customization.extraCheese) price += pizzaAddOns.extraCheese[size];
  if (customization.cheeseBurst) price += pizzaAddOns.cheeseBurst[size];
  if (customization.panBase) price += pizzaAddOns.panBase[size];
  price += customization.extraToppings.length * vegVegetablePricing[size];

  return price;
}

export function buildCustomizationSummary(customization: PizzaCustomization, toppingNames: string[]): string {
  const parts: string[] = [];
  if (customization.extraCheese) parts.push("Extra Cheese");
  if (customization.cheeseBurst) parts.push("Cheese Burst");
  if (customization.panBase) parts.push("Pan Base");
  if (toppingNames.length) parts.push(`+${toppingNames.join(", ")}`);
  return parts.join(" · ") || "Classic";
}