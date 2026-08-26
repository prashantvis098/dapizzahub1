import { pool, isDatabaseConfigured } from "@/lib/db";
import { validateCoupon as validateCouponFallback } from "@/data/coupons";

/**
 * Server-side coupon validation, shared by:
 *   - POST /api/coupons/validate (checkout's "Apply Coupon" button)
 *   - POST /api/orders (re-verifies the discount when the order is saved)
 *
 * This used to happen entirely client-side, which meant anyone could open
 * devtools and apply any discount amount before submitting an order.
 */
export async function validateCouponServerSide(
  code: string,
  subtotal: number
): Promise<
  | { valid: true; discount: number; description: string }
  | { valid: false; message: string }
> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { valid: false, message: "Enter a coupon code." };

  if (!isDatabaseConfigured()) {
    const fallback = validateCouponFallback(trimmed, subtotal);
    if (!fallback.valid) return fallback;
    return {
      valid: true,
      discount: fallback.discount,
      description: fallback.coupon.description,
    };
  }

  const result = await pool.query(
    `SELECT * FROM coupons WHERE code = $1 AND is_active = true`,
    [trimmed]
  );

  const coupon = result.rows[0];
  if (!coupon) {
    return { valid: false, message: "Invalid coupon code." };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, message: "This coupon has expired." };
  }

  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, message: "This coupon has reached its usage limit." };
  }

  const minOrder = Number(coupon.min_order);
  if (subtotal < minOrder) {
    return {
      valid: false,
      message: `Add items worth ₹${Math.ceil(minOrder - subtotal)} more to use this coupon.`,
    };
  }

  let discount =
    coupon.type === "flat"
      ? Number(coupon.value)
      : Math.round((subtotal * Number(coupon.value)) / 100);

  if (coupon.max_discount !== null) {
    discount = Math.min(discount, Number(coupon.max_discount));
  }

  discount = Math.min(discount, subtotal);

  return { valid: true, discount, description: coupon.description };
}
