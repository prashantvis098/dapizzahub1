import { NextRequest, NextResponse } from "next/server";
import { generateOrderNumber } from "@/lib/utils";
import { findNearestBranch } from "@/lib/delivery";
import { pool, isDatabaseConfigured } from "@/lib/db";
import { getBranches, getMenuItems, brand } from "@/lib/data";
import { validateCouponServerSide } from "@/lib/coupons";
import { verifyLinePrices } from "@/lib/pricing";
import { CartLine } from "@/types";

/**
 * POST /api/orders
 *
 * This route receives the finalized order from the checkout page and:
 *   1. Independently re-derives branch, distance, delivery fee and
 *      deliverability from the customer's coordinates (never trusts the
 *      client's numbers for pricing/acceptance — see comments below).
 *   2. Re-verifies every cart line's unitPrice against the real menu
 *      catalog and customization pricing (see src/lib/pricing.ts), then
 *      recomputes subtotal/total from those verified prices — never the
 *      client-submitted ones.
 *   3. Generates an order number and saves the order to Postgres (see
 *      src/lib/db.ts) so it appears on /admin/orders in real time.
 *   4. Returns the order number + authoritative total immediately.
 *
 * Petpooja is intentionally NOT called here. This restaurant does not have
 * a Petpooja API integration, so the Neon database + Admin Dashboard is the
 * source of truth for incoming orders.
 *
 * If DATABASE_URL isn't configured yet, the order is NOT silently
 * dropped — the request fails with a clear error instead, since an order
 * that isn't saved anywhere is worse than an order that visibly fails
 * with "try again" (or, better, "call us to order").
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branchId: clientBranchId,
      customerLat,
      customerLng,
      customerName,
      customerPhone,
      deliveryAddress,
      orderType,
      items,
      couponCode,
      discount: clientDiscount,
      paymentMethod,
      scheduleMode,
      scheduledFor,
      idempotencyKey,
    } = body;

    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required order fields." },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      console.error("[POST /api/orders] DATABASE_URL is not set — cannot save order.");
      return NextResponse.json(
        {
          success: false,
          message:
            "Online ordering isn't fully set up yet — please call or WhatsApp us to place your order instead.",
        },
        { status: 503 }
      );
    }

    // ---- Idempotency: dropped connections / retried submissions must not
    // create duplicate orders. The client generates one key per checkout
    // attempt (see CheckoutClient.tsx) and resends the same key on retry.
    // If an order with this key already exists, return it as-is instead of
    // inserting again — this covers double-clicks past the client-side
    // guard, timeouts where the first request actually succeeded, and
    // browser/network-level automatic retries.
    if (typeof idempotencyKey === "string" && idempotencyKey.trim()) {
      try {
        const existing = await pool.query(
          `SELECT order_number, subtotal, discount, delivery_fee, total, branch_id
           FROM orders WHERE idempotency_key = $1`,
          [idempotencyKey.trim()]
        );
        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          return NextResponse.json({
            success: true,
            orderId: row.order_number,
            subtotal: Number(row.subtotal),
            discount: Number(row.discount),
            deliveryFee: Number(row.delivery_fee),
            total: Number(row.total),
            branchId: row.branch_id,
          });
        }
      } catch (err) {
        // If the lookup itself fails, fall through and attempt a normal
        // insert rather than blocking the order entirely.
        console.error("[POST /api/orders] idempotency lookup failed:", err);
      }
    }

    const isPickup = orderType === "pickup";

    // ---- Server-side recomputation of branch / distance / fee ----
    // Never trust client-computed distance, fee, or deliverability for
    // pricing or acceptance — a modified client request could otherwise
    // claim free delivery from anywhere.
    let resolvedBranchId: string = clientBranchId;
    let deliveryFee = 0;

    if (!isPickup) {
      if (typeof customerLat !== "number" || typeof customerLng !== "number") {
        return NextResponse.json(
          { success: false, message: "A delivery location is required for delivery orders." },
          { status: 400 }
        );
      }

      // Use the DB-backed branch list (falls back to the static list if
      // DATABASE_URL isn't set — see getBranches()) so that branches
      // added/edited/deactivated from /admin/branches are actually
      // reflected in delivery routing, not just in the pickup dropdown.
      const deliveryBranches = await getBranches();
      const nearest = findNearestBranch(customerLat, customerLng, deliveryBranches);
      if (!nearest.deliverable) {
        return NextResponse.json(
          { success: false, message: "Sorry, this address is outside our delivery area." },
          { status: 400 }
        );
      }
      resolvedBranchId = nearest.branch.id;
      deliveryFee = nearest.fee;
    } else {
      // Pickup: honor the branch the customer picked for pickup, but
      // validate it actually exists rather than trusting it blindly.
      const allBranches = await getBranches();
      const branchExists = allBranches.some((b) => b.id === clientBranchId);
      resolvedBranchId = branchExists ? clientBranchId : allBranches[0].id;
    }

    // ---- Server-side recomputation of pricing ----
    // Never trust the client's per-line unitPrice — verify every line
    // against the real menu catalog (and pizza customization pricing)
    // before computing the subtotal. Without this, a modified request
    // could set any unitPrice it wanted and have it charged verbatim.
    const submittedLines: CartLine[] = items;
    const menuItems = await getMenuItems();
    const { verifiedLines: lines, hadMismatch, errors: priceErrors } = verifyLinePrices(
      submittedLines,
      menuItems
    );

    if (priceErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Some items in your cart are no longer available: ${priceErrors.join(" ")} Please refresh your cart and try again.`,
        },
        { status: 409 }
      );
    }

    if (hadMismatch) {
      // Not a hard failure — could just be a menu price change since the
      // item was added to the cart. Log it for visibility (e.g. repeated
      // mismatches from the same source might indicate tampering) and
      // proceed at the correct, server-verified price.
      console.warn(
        `[POST /api/orders] price mismatch on submitted cart for phone ${customerPhone} — charged the verified menu price instead of the client-submitted one.`
      );
    }

    const subtotal = lines.reduce(
      (sum, line) => sum + line.unitPrice * line.quantity,
      0
    );

    // Coupon discount is independently re-verified server-side (never
    // trust a client-submitted discount amount — a tampered request could
    // otherwise claim any discount it likes). If the client didn't send a
    // coupon code, there's simply no discount.
    let discount = 0;
    if (couponCode) {
      const couponResult = await validateCouponServerSide(couponCode, subtotal);
      if (couponResult.valid) {
        discount = couponResult.discount;
      }
      // If the coupon is no longer valid (e.g. expired between checkout
      // steps), we silently apply no discount rather than failing the
      // whole order — the confirmation total will reflect this correctly
      // either way since it's built from this server-computed total.
    }
    void clientDiscount; // client's own discount figure is informational only, never trusted

    const total = Math.max(0, subtotal - discount) + deliveryFee;

    if (!isPickup && subtotal < brand.minOrder) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order value for delivery is ₹${brand.minOrder}.`,
        },
        { status: 400 }
      );
    }

    // ---- Generate a unique order number, retrying on the rare collision ----
    let orderId = generateOrderNumber();
    let insertedRow: { id: number; created_at: string } | null = null;
    const MAX_ATTEMPTS = 5;
    const normalizedIdempotencyKey =
      typeof idempotencyKey === "string" && idempotencyKey.trim()
        ? idempotencyKey.trim()
        : null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS && !insertedRow; attempt++) {
      try {
        const result = await pool.query(
          `INSERT INTO orders (
            order_number, branch_id, customer_name, customer_phone,
            order_type, delivery_address, items, subtotal, discount,
            delivery_fee, total, coupon_code, payment_method,
            schedule_mode, scheduled_for, status, idempotency_key
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'new',$16)
          RETURNING id, created_at`,
          [
            orderId,
            resolvedBranchId,
            customerName,
            customerPhone,
            isPickup ? "pickup" : "delivery",
            isPickup ? null : deliveryAddress ?? null,
            JSON.stringify(lines),
            subtotal,
            discount,
            deliveryFee,
            total,
            couponCode ?? null,
            paymentMethod === "upi" ? "upi" : "cod",
            scheduleMode === "scheduled" ? "later" : "now",
            scheduleMode === "scheduled" ? scheduledFor ?? null : null,
            normalizedIdempotencyKey,
          ]
        );
        insertedRow = result.rows[0];
      } catch (err: unknown) {
        // Postgres unique_violation error code is '23505'.
        const pgErr = err as { code?: string; constraint?: string };
        if (pgErr?.code === "23505") {
          // A concurrent request with the SAME idempotency key won the
          // race between our earlier SELECT check and this INSERT — fetch
          // and return that order instead of erroring or duplicating it.
          if (
            normalizedIdempotencyKey &&
            pgErr.constraint === "idx_orders_idempotency_key"
          ) {
            const existing = await pool.query(
              `SELECT order_number, subtotal, discount, delivery_fee, total, branch_id
               FROM orders WHERE idempotency_key = $1`,
              [normalizedIdempotencyKey]
            );
            if (existing.rows.length > 0) {
              const row = existing.rows[0];
              return NextResponse.json({
                success: true,
                orderId: row.order_number,
                subtotal: Number(row.subtotal),
                discount: Number(row.discount),
                deliveryFee: Number(row.delivery_fee),
                total: Number(row.total),
                branchId: row.branch_id,
              });
            }
          }
          // Otherwise it's an order_number collision (extremely rare) —
          // regenerate and retry.
          orderId = generateOrderNumber();
          continue;
        }
        throw err;
      }
    }

    if (!insertedRow) {
      throw new Error("Failed to generate a unique order number after several attempts.");
    }

    if (discount > 0 && couponCode) {
      // Best-effort — a failure here shouldn't fail the whole order, since
      // the order is already saved. Worst case, usage_limit tracking is
      // slightly off for this one coupon, which staff can still see and
      // deactivate manually from /admin/coupons if needed.
      pool
        .query("UPDATE coupons SET times_used = times_used + 1 WHERE code = $1", [
          couponCode.trim().toUpperCase(),
        ])
        .catch((err) => console.error("[POST /api/orders] failed to increment coupon usage:", err));
    }

    return NextResponse.json({
      success: true,
      orderId,
      subtotal,
      discount,
      deliveryFee,
      total,
      branchId: resolvedBranchId,
    });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong placing your order. Please try again or call us." },
      { status: 500 }
    );
  }
}