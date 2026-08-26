import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { pool, isDatabaseConfigured } from "@/lib/db";

async function requireAuth() {
  if (!(await isAdminRequestAuthenticated())) {
    return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  }
  return null;
}

function requireDb() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 503 });
  }
  return null;
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  try {
    const result = await pool.query("SELECT * FROM coupons ORDER BY created_at DESC");
    return NextResponse.json({ success: true, coupons: result.rows });
  } catch (error) {
    console.error("[GET /api/admin/coupons]", error);
    return NextResponse.json({ success: false, message: "Failed to load coupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await request.json().catch(() => null);
  const { code, type, value, minOrder, maxDiscount, description, usageLimit, expiresAt } = body ?? {};

  if (!code || !type || value == null) {
    return NextResponse.json({ success: false, message: "Code, type, and value are required." }, { status: 400 });
  }
  if (type !== "flat" && type !== "percent") {
    return NextResponse.json({ success: false, message: "Type must be 'flat' or 'percent'." }, { status: 400 });
  }
  if (type === "percent" && (value <= 0 || value > 100)) {
    return NextResponse.json({ success: false, message: "Percent discounts must be between 1 and 100." }, { status: 400 });
  }

  const normalizedCode = String(code).trim().toUpperCase();

  try {
    const existing = await pool.query("SELECT code FROM coupons WHERE code = $1", [normalizedCode]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, message: "A coupon with this code already exists." }, { status: 409 });
    }

    await pool.query(
      `INSERT INTO coupons (code, type, value, min_order, max_discount, description, usage_limit, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [normalizedCode, type, value, minOrder ?? 0, maxDiscount ?? null, description ?? "", usageLimit ?? null, expiresAt ?? null]
    );

    return NextResponse.json({ success: true, code: normalizedCode });
  } catch (error) {
    console.error("[POST /api/admin/coupons]", error);
    return NextResponse.json({ success: false, message: "Failed to create coupon." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await request.json().catch(() => null);
  const { code, type, value, minOrder, maxDiscount, description, isActive, usageLimit, expiresAt } = body ?? {};

  if (!code) {
    return NextResponse.json({ success: false, message: "Coupon code is required." }, { status: 400 });
  }

  try {
    await pool.query(
      `UPDATE coupons SET
        type = COALESCE($2, type),
        value = COALESCE($3, value),
        min_order = COALESCE($4, min_order),
        max_discount = $5,
        description = COALESCE($6, description),
        is_active = COALESCE($7, is_active),
        usage_limit = $8,
        expires_at = $9
       WHERE code = $1`,
      [
        String(code).toUpperCase(),
        type,
        value,
        minOrder,
        maxDiscount === undefined ? null : maxDiscount,
        description,
        isActive,
        usageLimit === undefined ? null : usageLimit,
        expiresAt === undefined ? null : expiresAt,
      ]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/coupons]", error);
    return NextResponse.json({ success: false, message: "Failed to update coupon." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ success: false, message: "Coupon code is required." }, { status: 400 });
  }

  try {
    await pool.query("DELETE FROM coupons WHERE code = $1", [code.toUpperCase()]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/coupons]", error);
    return NextResponse.json({ success: false, message: "Failed to delete coupon." }, { status: 500 });
  }
}
