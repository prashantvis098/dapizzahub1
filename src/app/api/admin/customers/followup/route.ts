import { NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { pool, isDatabaseConfigured } from "@/lib/db";

/**
 * GET /api/admin/customers/followup
 *
 * Surfaces two lists for the admin "Follow Up" page:
 *   - `lapsed`: customers who have ordered before (2+ orders) but whose
 *     most recent order was 4+ days ago — "don't let them drift away".
 *   - `newSingleOrder`: customers with exactly one order ever, placed
 *     1+ days ago — "convert first-timers into repeat customers".
 *
 * This is a *list to review*, not an auto-sender — each entry gets a
 * prefilled WhatsApp link (see src/lib/whatsapp.ts) that staff reviews
 * and taps to send themselves. Nothing here sends a message on its own.
 *
 * A customer is identified by phone number, matching how orders are
 * already keyed (see src/lib/schema.sql — there's no separate customers
 * table; a customer's identity IS their phone number across orders).
 */

const LAPSED_MIN_DAYS = 4;
const NEW_CUSTOMER_MIN_DAYS = 1;
// Customers inactive far longer than this are a different problem
// (dormant reactivation, not a routine follow-up nudge) — capped here so
// this list stays focused on the "about to lose them" window rather than
// growing forever with customers from a year ago.
const LAPSED_MAX_DAYS = 45;

export async function GET() {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, lapsed: [], newSingleOrder: [] });
  }

  try {
    // One row per customer (phone), with their order count, most recent
    // order info, and (via a lateral join) their single most-ordered
    // item by quantity — used to personalize the follow-up message.
    const result = await pool.query(
      `WITH customer_orders AS (
         SELECT
           customer_phone,
           customer_name,
           created_at,
           items,
           ROW_NUMBER() OVER (PARTITION BY customer_phone ORDER BY created_at DESC) AS rn,
           COUNT(*) OVER (PARTITION BY customer_phone) AS order_count
         FROM orders
         WHERE status != 'cancelled'
       ),
       latest_per_customer AS (
         SELECT customer_phone, customer_name, created_at, order_count
         FROM customer_orders
         WHERE rn = 1
       ),
       item_totals AS (
         SELECT
           customer_phone,
           item ->> 'name' AS name,
           SUM((item ->> 'quantity')::int) AS qty
         FROM orders, jsonb_array_elements(items) AS item
         WHERE status != 'cancelled'
         GROUP BY customer_phone, item ->> 'name'
       ),
       favorite_item AS (
         SELECT DISTINCT ON (customer_phone)
           customer_phone,
           name
         FROM item_totals
         ORDER BY customer_phone, qty DESC
       )
       SELECT
         l.customer_phone,
         l.customer_name,
         l.created_at AS last_order_at,
         l.order_count,
         EXTRACT(DAY FROM now() - l.created_at)::int AS days_since_last_order,
         f.name AS favorite_item
       FROM latest_per_customer l
       LEFT JOIN favorite_item f ON f.customer_phone = l.customer_phone
       ORDER BY l.created_at ASC`
    );

    const lapsed: Array<{
      phone: string;
      name: string;
      lastOrderAt: string;
      orderCount: number;
      daysSinceLastOrder: number;
      favoriteItem: string | null;
    }> = [];
    const newSingleOrder: typeof lapsed = [];

    for (const row of result.rows) {
      const entry = {
        phone: row.customer_phone as string,
        name: row.customer_name as string,
        lastOrderAt: row.last_order_at as string,
        orderCount: Number(row.order_count),
        daysSinceLastOrder: Number(row.days_since_last_order),
        favoriteItem: (row.favorite_item as string | null) ?? null,
      };

      if (entry.orderCount === 1 && entry.daysSinceLastOrder >= NEW_CUSTOMER_MIN_DAYS) {
        newSingleOrder.push(entry);
      } else if (
        entry.orderCount >= 2 &&
        entry.daysSinceLastOrder >= LAPSED_MIN_DAYS &&
        entry.daysSinceLastOrder <= LAPSED_MAX_DAYS
      ) {
        lapsed.push(entry);
      }
    }

    // Most overdue first — the customers most at risk of being lost
    // entirely should be at the top of staff's list.
    lapsed.sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder);
    newSingleOrder.sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder);

    return NextResponse.json({ success: true, lapsed, newSingleOrder });
  } catch (error) {
    console.error("[GET /api/admin/customers/followup]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load follow-up list." },
      { status: 500 }
    );
  }
}
