import { CartLine } from "@/types";

/**
 * ============================================================
 *  PETPOOJA INTEGRATION — INTEGRATION POINT (NOT LIVE)
 * ============================================================
 *
 * Petpooja is a restaurant POS / order-management platform. To push
 * orders from this website into your Petpooja dashboard automatically,
 * you need:
 *
 *   1. A Petpooja Partner/Restaurant API key (from your Petpooja account
 *      manager or the Petpooja Partner Portal).
 *   2. Your Petpooja "restaurant ID" / outlet ID for each branch.
 *   3. A server-side environment (this function must run on a server —
 *      an API route, not in the browser — because the API key must
 *      never be exposed to customers).
 *
 * WHY THIS FILE ONLY SIMULATES THE CALL RIGHT NOW:
 * Placing a real order requires your live Petpooja credentials, which
 * only you (or your developer) can obtain and store securely as
 * environment variables. This function is written so that wiring up
 * the real integration later is a matter of:
 *
 *   1. Adding PETPOOJA_API_KEY and PETPOOJA_RESTAURANT_ID to your
 *      hosting environment's secrets (e.g. Vercel Environment Variables).
 *   2. Uncommenting the real fetch() call below.
 *   3. Confirming the payload shape against Petpooja's current API docs
 *      (endpoint paths and field names do change between API versions,
 *      so check https://docs.petpooja.com or your Petpooja integration
 *      contact before going live).
 *
 * This function is called from /api/orders/route.ts, which is itself
 * only ever invoked from the server side (Next.js Route Handler),
 * keeping any future API key server-only and out of client bundles.
 */

export interface PetpoojaOrderPayload {
  orderId: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: CartLine[];
  subtotal: number;
  paymentMethod: "cod" | "upi";
}

export interface PetpoojaOrderResult {
  success: boolean;
  petpoojaOrderId?: string;
  message: string;
}

export async function pushOrderToPetpooja(
  payload: PetpoojaOrderPayload
): Promise<PetpoojaOrderResult> {
  const apiKey = process.env.PETPOOJA_API_KEY;
  const restaurantId = process.env.PETPOOJA_RESTAURANT_ID;

  if (!apiKey || !restaurantId) {
    // Expected in development / demo — credentials aren't configured yet.
    console.warn(
      "[Petpooja] Skipping live push — PETPOOJA_API_KEY / PETPOOJA_RESTAURANT_ID not set."
    );
    return {
      success: true,
      message: "Order recorded locally. Petpooja push skipped (no credentials configured).",
    };
  }

  // ---- Real integration (uncomment and adapt once credentials exist) ----
  //
  // const response = await fetch("https://api.petpooja.com/v1/orders", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${apiKey}`,
  //   },
  //   body: JSON.stringify({
  //     restaurant_id: restaurantId,
  //     order_id: payload.orderId,
  //     customer: {
  //       name: payload.customerName,
  //       phone: payload.customerPhone,
  //       address: payload.deliveryAddress,
  //     },
  //     items: payload.items.map((item) => ({
  //       name: item.name,
  //       quantity: item.quantity,
  //       price: item.unitPrice,
  //       notes: item.customizationSummary,
  //     })),
  //     total: payload.subtotal,
  //     payment_method: payload.paymentMethod,
  //   }),
  // });
  //
  // if (!response.ok) {
  //   const errorText = await response.text();
  //   return { success: false, message: `Petpooja API error: ${errorText}` };
  // }
  //
  // const data = await response.json();
  // return { success: true, petpoojaOrderId: data.order_id, message: "Order pushed to Petpooja." };

  return {
    success: true,
    message: "Order recorded locally. Petpooja push skipped (no credentials configured).",
  };
}
