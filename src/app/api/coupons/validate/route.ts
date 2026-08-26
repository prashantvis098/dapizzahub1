import { NextRequest, NextResponse } from "next/server";
import { validateCouponServerSide } from "@/lib/coupons";

/**
 * POST /api/coupons/validate
 * Body: { code: string, subtotal: number }
 *
 * Server-side coupon validation. This used to happen entirely client-side
 * (src/data/coupons.ts's validateCoupon), which meant anyone could open
 * devtools and apply any discount amount before submitting an order,
 * since nothing re-checked it server-side. The order API also calls this
 * same logic when saving an order, so a tampered client request can't
 * get a discount that wasn't actually earned.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code : "";
  const subtotal = typeof body?.subtotal === "number" ? body.subtotal : 0;

  const result = await validateCouponServerSide(code, subtotal);

  if (!result.valid) {
    return NextResponse.json({ success: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    discount: result.discount,
    description: result.description,
  });
}
