import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { pool, isDatabaseConfigured } from "@/lib/db";
import { invalidateDataCache } from "@/lib/data";

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
    const result = await pool.query("SELECT * FROM branches ORDER BY sort_order ASC");
    return NextResponse.json({ success: true, branches: result.rows });
  } catch (error) {
    console.error("[GET /api/admin/branches]", error);
    return NextResponse.json({ success: false, message: "Failed to load branches." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await request.json().catch(() => null);
  const { id, name, address, phone, whatsapp, mapsUrl, swiggyUrl, zomatoUrl, lat, lng } = body ?? {};

  if (!id || !name || !address || !phone || !whatsapp || lat == null || lng == null) {
    return NextResponse.json({ success: false, message: "Missing required branch fields." }, { status: 400 });
  }

  try {
    const existing = await pool.query("SELECT id FROM branches WHERE id = $1", [id]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ success: false, message: "A branch with this id already exists." }, { status: 409 });
    }

    const maxOrder = await pool.query("SELECT COALESCE(MAX(sort_order), 0) AS max FROM branches");
    const sortOrder = Number(maxOrder.rows[0].max) + 1;

    await pool.query(
      `INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, swiggy_url, zomato_url, lat, lng, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, name, address, phone, whatsapp, mapsUrl ?? "", swiggyUrl ?? null, zomatoUrl ?? null, lat, lng, sortOrder]
    );

    invalidateDataCache("branches");
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[POST /api/admin/branches]", error);
    return NextResponse.json({ success: false, message: "Failed to create branch." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await request.json().catch(() => null);
  const { id, name, address, phone, whatsapp, mapsUrl, swiggyUrl, zomatoUrl, lat, lng, isActive, openingTime, closingTime } = body ?? {};

  if (!id) {
    return NextResponse.json({ success: false, message: "Branch id is required." }, { status: 400 });
  }

  try {
    await pool.query(
      `UPDATE branches SET
        name = COALESCE($2, name),
        address = COALESCE($3, address),
        phone = COALESCE($4, phone),
        whatsapp = COALESCE($5, whatsapp),
        maps_url = COALESCE($6, maps_url),
        swiggy_url = $7,
        zomato_url = $8,
        lat = COALESCE($9, lat),
        lng = COALESCE($10, lng),
        is_active = COALESCE($11, is_active),
        opening_time = COALESCE($12, opening_time),
        closing_time = COALESCE($13, closing_time),
        updated_at = now()
       WHERE id = $1`,
      [
        id, name, address, phone, whatsapp, mapsUrl,
        swiggyUrl === undefined ? null : swiggyUrl,
        zomatoUrl === undefined ? null : zomatoUrl,
        lat, lng, isActive, openingTime, closingTime,
      ]
    );

    invalidateDataCache("branches");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/branches]", error);
    return NextResponse.json({ success: false, message: "Failed to update branch." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, message: "Branch id is required." }, { status: 400 });
  }

  try {
    // Soft-delete (deactivate) rather than a hard DELETE — past orders
    // reference branch_id, and a branch could reasonably be reopened later.
    await pool.query("UPDATE branches SET is_active = false, updated_at = now() WHERE id = $1", [id]);
    invalidateDataCache("branches");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/branches]", error);
    return NextResponse.json({ success: false, message: "Failed to remove branch." }, { status: 500 });
  }
}
