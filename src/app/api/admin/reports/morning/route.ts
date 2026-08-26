import { NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { pool, isDatabaseConfigured } from "@/lib/db";

/**
 * GET /api/admin/reports/morning
 *
 * Yesterday's business summary — revenue, orders, new vs repeat
 * customers, cancellations, top items, best branch. Built for the
 * "Morning Report" admin page: staff/owner opens it each morning, reviews
 * the numbers, and taps "Send to WhatsApp" to forward it to themselves —
 * this endpoint just prepares the data; sending is a real wa.me link the
 * user still taps themselves (see README/lib/whatsapp.ts for why this
 * isn't automatic).
 *
 * All date boundaries use Asia/Kolkata (IST), not UTC — Da Pizza Hub
 * operates in Kanpur, and "yesterday" needs to mean the IST calendar
 * day, not whatever day it happens to be in UTC at query time (which,
 * for late-evening India orders, would be the wrong day roughly a third
 * of the time).
 */
export async function GET() {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      reportDate: null,
      revenue: 0,
      orders: 0,
      averageOrderValue: 0,
      newCustomers: 0,
      repeatCustomers: 0,
      cancelledOrders: 0,
      topItems: [],
      branchBreakdown: [],
    });
  }

  try {
    // "Yesterday" in IST, as a date. E.g. if it's 2026-08-26 03:00 IST
    // right now, this resolves to 2026-08-25.
    const dateResult = await pool.query(
      `SELECT (now() AT TIME ZONE 'Asia/Kolkata')::date - 1 AS report_date`
    );
    const reportDate: string = dateResult.rows[0].report_date;

    // Every subsequent query filters on the same IST calendar day using
    // this shared WHERE clause fragment, so all numbers below describe
    // exactly the same 24-hour window.
    const dayFilter = `(created_at AT TIME ZONE 'Asia/Kolkata')::date = $1::date`;

    const [summary, cancelled, customerMix, topItems, branchBreakdown] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
         FROM orders
         WHERE status != 'cancelled' AND ${dayFilter}`,
        [reportDate]
      ),
      pool.query(
        `SELECT COUNT(*) AS cancelled
         FROM orders
         WHERE status = 'cancelled' AND ${dayFilter}`,
        [reportDate]
      ),
      // A customer (by phone) counts as "new" for the report if
      // yesterday's order was the first order ever placed on that phone
      // number — determined by comparing against that phone's earliest
      // order timestamp across the whole orders table, not just
      // yesterday's data.
      pool.query(
        `WITH yesterday_orders AS (
           SELECT DISTINCT customer_phone
           FROM orders
           WHERE status != 'cancelled' AND ${dayFilter}
         ),
         first_order_per_customer AS (
           SELECT customer_phone, MIN(created_at) AS first_order_at
           FROM orders
           WHERE status != 'cancelled'
           GROUP BY customer_phone
         )
         SELECT
           COUNT(*) FILTER (
             WHERE (f.first_order_at AT TIME ZONE 'Asia/Kolkata')::date = $1::date
           ) AS new_customers,
           COUNT(*) FILTER (
             WHERE (f.first_order_at AT TIME ZONE 'Asia/Kolkata')::date != $1::date
           ) AS repeat_customers
         FROM yesterday_orders y
         JOIN first_order_per_customer f ON f.customer_phone = y.customer_phone`,
        [reportDate]
      ),
      pool.query(
        `SELECT
          item -> 'name' AS name,
          SUM((item ->> 'quantity')::int) AS qty
         FROM orders, jsonb_array_elements(items) AS item
         WHERE status != 'cancelled' AND ${dayFilter}
         GROUP BY item -> 'name'
         ORDER BY qty DESC
         LIMIT 5`,
        [reportDate]
      ),
      pool.query(
        `SELECT branch_id, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
         FROM orders
         WHERE status != 'cancelled' AND ${dayFilter}
         GROUP BY branch_id
         ORDER BY revenue DESC`,
        [reportDate]
      ),
    ]);

    const revenue = Number(summary.rows[0].revenue);
    const orders = Number(summary.rows[0].orders);

    return NextResponse.json({
      success: true,
      reportDate,
      revenue,
      orders,
      averageOrderValue: orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0,
      newCustomers: Number(customerMix.rows[0]?.new_customers ?? 0),
      repeatCustomers: Number(customerMix.rows[0]?.repeat_customers ?? 0),
      cancelledOrders: Number(cancelled.rows[0].cancelled),
      topItems: topItems.rows.map((row) => ({
        name: typeof row.name === "string" ? row.name.replace(/^"|"$/g, "") : String(row.name),
        quantity: Number(row.qty),
      })),
      branchBreakdown: branchBreakdown.rows.map((row) => ({
        branchId: row.branch_id as string,
        revenue: Number(row.revenue),
        orders: Number(row.orders),
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/reports/morning]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load the morning report." },
      { status: 500 }
    );
  }
}
