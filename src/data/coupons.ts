export interface Coupon {
  code: string;
  type: "percent" | "flat";
  value: number; // percent (0-100) or flat rupee amount
  minOrder: number;
  description: string;
  maxDiscount?: number; // caps percent-based discounts
}

// Sample launch coupons — client can add/edit/remove entries here directly.
// No backend needed since these are just validated client-side against
// the cart total; once a database exists this can move server-side with
// usage limits, expiry dates, and per-user tracking.
export const coupons: Coupon[] = [
  {
    code: "WELCOME50",
    type: "flat",
    value: 50,
    minOrder: 300,
    description: "₹50 off on your first order",
  },
  {
    code: "PIZZA20",
    type: "percent",
    value: 20,
    minOrder: 500,
    maxDiscount: 150,
    description: "20% off (up to ₹150) on orders above ₹500",
  },
  {
    code: "FAMILY100",
    type: "flat",
    value: 100,
    minOrder: 800,
    description: "₹100 off on orders above ₹800",
  },
];

export function validateCoupon(
  code: string,
  subtotal: number
): { valid: true; coupon: Coupon; discount: number } | { valid: false; message: string } {
  const trimmed = code.trim().toUpperCase();
  const coupon = coupons.find((c) => c.code === trimmed);

  if (!coupon) {
    return { valid: false, message: "Invalid coupon code." };
  }

  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      message: `Add items worth ₹${coupon.minOrder - subtotal} more to use this coupon.`,
    };
  }

  let discount =
    coupon.type === "flat" ? coupon.value : Math.round((subtotal * coupon.value) / 100);

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  // Never let a coupon discount more than the subtotal itself.
  discount = Math.min(discount, subtotal);

  return { valid: true, coupon, discount };
}