import { NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { pool, isDatabaseConfigured } from "@/lib/db";

/**
 * GET /api/admin/stats
 * Returns today / this week / this month revenue + order counts, plus a
 * simple top-selling-items breakdown, for the admin dashboard's Sales tab.
 *
 * Only counts orders with status != 'cancelled' as revenue — a cancelled
 * order was never actually fulfilled, so it shouldn't count as sales.
 */
export async function GET() {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      success: true,
      today: { revenue: 0, orders: 0 },
      week: { revenue: 0, orders: 0 },
      month: { revenue: 0, orders: 0 },
      topItems: [],
    });
  }

  try {
    const periodQuery = async (interval: string) => {
      const result = await pool.query(
        `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
         FROM orders
         WHERE status != 'cancelled' AND created_at >= now() - $1::interval`,
        [interval]
      );
      return {
        revenue: Number(result.rows[0].revenue),
        orders: Number(result.rows[0].orders),
      };
    };

    const [today, week, month] = await Promise.all([
      periodQuery("1 day"),
      periodQuery("7 days"),
      periodQuery("30 days"),
    ]);

    const statusResult = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM orders
       WHERE created_at >= now() - interval '30 days'
       GROUP BY status`
    );

    const statusCounts = {
      new: 0,
      preparing: 0,
      outForDelivery: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const row of statusResult.rows) {
      const count = Number(row.count);
      if (row.status === "new") statusCounts.new = count;
      else if (row.status === "preparing") statusCounts.preparing = count;
      else if (row.status === "out_for_delivery") statusCounts.outForDelivery = count;
      else if (row.status === "completed") statusCounts.completed = count;
      else if (row.status === "cancelled") statusCounts.cancelled = count;
    }

    // Top-selling items over the last 30 days, derived from the JSONB
    // items column (each order stores its line items as JSON, not a
    // separate order_items table, since order line items never need to
    // be queried/edited independently of their order).
    const topItemsResult = await pool.query(
      `SELECT
        item -> 'name' AS name,
        SUM((item ->> 'quantity')::int) AS qty
       FROM orders, jsonb_array_elements(items) AS item
       WHERE status != 'cancelled' AND created_at >= now() - interval '30 days'
       GROUP BY item -> 'name'
       ORDER BY qty DESC
       LIMIT 8`
    );

    const topItems = topItemsResult.rows.map((row) => ({
      name: typeof row.name === "string" ? row.name.replace(/^"|"$/g, "") : String(row.name),
      quantity: Number(row.qty),
    }));

    return NextResponse.json({ success: true, today, week, month, status: statusCounts, topItems });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ success: false, message: "Failed to load stats." }, { status: 500 });
  }
}
