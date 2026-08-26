import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { pool, isDatabaseConfigured } from "@/lib/db";

const VALID_STATUSES = ["new", "preparing", "out_for_delivery", "completed", "cancelled"];

/**
 * GET /api/admin/orders
 * Returns recent orders, newest first. Supports `?since=<id>` so the
 * admin page can poll cheaply and know whether there's anything new
 * (used to trigger the sound alert) without re-fetching everything.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: true, orders: [] });
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  try {
    const params: unknown[] = [];
    let query = "SELECT * FROM orders";
    if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
      params.push(statusFilter);
      query += ` WHERE status = $${params.length}`;
    }
    query += " ORDER BY created_at DESC LIMIT 100";

    const result = await pool.query(query, params);

    const orders = result.rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      branchId: row.branch_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      orderType: row.order_type,
      deliveryAddress: row.delivery_address,
      items: row.items,
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      deliveryFee: Number(row.delivery_fee),
      total: Number(row.total),
      couponCode: row.coupon_code,
      paymentMethod: row.payment_method,
      scheduleMode: row.schedule_mode,
      scheduledFor: row.scheduled_for,
      status: row.status,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("[GET /api/admin/orders]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load orders." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Body: { id: number, status: string }
 * Updates a single order's status (e.g. "new" -> "preparing").
 */
export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;
  const status = body?.status;

  if (typeof id !== "number" || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  try {
    await pool.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/orders]", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order." },
      { status: 500 }
    );
  }
}
