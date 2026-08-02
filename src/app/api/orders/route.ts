import { NextRequest, NextResponse } from "next/server";
import { pushOrderToPetpooja } from "@/lib/petpooja";
import { generateOrderNumber } from "@/lib/utils";

/**
 * POST /api/orders
 *
 * This route receives the finalized order from the checkout page and:
 *   1. Generates an order number.
 *   2. Attempts to push the order to Petpooja (see src/lib/petpooja.ts —
 *      this is a safe no-op until real Petpooja credentials are added
 *      to the server environment).
 *   3. Returns the order number + delivery estimate so the confirmation
 *      screen can display it.
 *
 * In production you'd also want to persist orders to a database here
 * (Postgres, Supabase, etc.) — that isn't included since no database
 * was specified, but this is the correct place to add it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branchId, customerName, customerPhone, deliveryAddress, items, subtotal, paymentMethod } = body;

    if (!customerName || !customerPhone || !items?.length) {
      return NextResponse.json(
        { success: false, message: "Missing required order fields." },
        { status: 400 }
      );
    }

    const orderId = generateOrderNumber();

    const petpoojaResult = await pushOrderToPetpooja({
      orderId,
      branchId,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      subtotal,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      orderId,
      petpooja: petpoojaResult,
    });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong placing your order." },
      { status: 500 }
    );
  }
}
