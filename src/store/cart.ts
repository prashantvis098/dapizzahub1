"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartLine, PizzaCustomization } from "@/types";

interface AppliedCoupon {
  code: string;
  discount: number;
  description: string;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  couponLoading: boolean;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (code: string) => Promise<void>;
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
      couponLoading: false,

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

      // Validated server-side (see /api/coupons/validate) rather than
      // against the static src/data/coupons.ts list — this is what makes
      // discounts actually trustworthy: a tampered client request can no
      // longer claim a discount that wasn't really earned, since the
      // order API re-runs this same server-side check when the order is
      // saved regardless of what the cart displays.
      applyCoupon: async (code) => {
        const subtotal = get().subtotal();
        set({ couponLoading: true, couponError: null });
        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, subtotal }),
          });
          const data = await res.json();

          if (data.success) {
            set({
              appliedCoupon: {
                code: code.trim().toUpperCase(),
                discount: data.discount,
                description: data.description,
              },
              couponError: null,
              couponLoading: false,
            });
          } else {
            set({ appliedCoupon: null, couponError: data.message, couponLoading: false });
          }
        } catch {
          set({
            appliedCoupon: null,
            couponError: "Couldn't check that coupon — please try again.",
            couponLoading: false,
          });
        }
      },

      removeCoupon: () => set({ appliedCoupon: null, couponError: null }),

      subtotal: () => {
        return get().lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      },

      // Uses the discount amount captured when the coupon was applied
      // (from the server). If the cart total drops below the coupon's
      // minimum order after items are removed, the checkout step
      // re-validates via the same API before letting the order through,
      // so a stale display value here can't result in an under-charged
      // order actually being placed.
      discount: () => {
        return get().appliedCoupon?.discount ?? 0;
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