import { NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthenticated } from "@/lib/adminAuth";
import { pool, isDatabaseConfigured } from "@/lib/db";
import { invalidateDataCache } from "@/lib/data";

/**
 * GET /api/admin/menu — list every menu item (available or not)
 * POST /api/admin/menu — create a new item
 * PATCH /api/admin/menu — update an existing item (by id)
 * DELETE /api/admin/menu?id=xxx — delete an item
 */

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
    const result = await pool.query("SELECT * FROM menu_items ORDER BY sort_order ASC, name ASC");
    return NextResponse.json({ success: true, items: result.rows });
  } catch (error) {
    console.error("[GET /api/admin/menu]", error);
    return NextResponse.json({ success: false, message: "Failed to load menu." }, { status: 500 });
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await request.json().catch(() => null);
  const { name, description, category, itemType, priceRegular, priceMedium, priceLarge, price, image, isBestSeller, isNew } = body ?? {};

  if (!name || !category || !itemType) {
    return NextResponse.json({ success: false, message: "Name, category, and type are required." }, { status: 400 });
  }

  if (itemType === "pizza" && (priceRegular == null || priceMedium == null || priceLarge == null)) {
    return NextResponse.json({ success: false, message: "Pizza items need regular, medium, and large prices." }, { status: 400 });
  }
  if (itemType === "simple" && price == null) {
    return NextResponse.json({ success: false, message: "This item needs a price." }, { status: 400 });
  }

  let id = slugify(name);
  if (!id) {
    return NextResponse.json({ success: false, message: "Please enter a valid name." }, { status: 400 });
  }

  try {
    // Ensure a unique id if this name already exists (append a short suffix).
    const existing = await pool.query("SELECT id FROM menu_items WHERE id = $1", [id]);
    if (existing.rows.length > 0) {
      id = `${id}-${Date.now().toString(36).slice(-4)}`;
    }

    const maxOrder = await pool.query("SELECT COALESCE(MAX(sort_order), 0) AS max FROM menu_items");
    const sortOrder = Number(maxOrder.rows[0].max) + 1;

    await pool.query(
      `INSERT INTO menu_items (id, name, description, category, item_type, price_regular, price_medium, price_large, price, image, is_best_seller, is_new, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        id,
        name,
        description ?? "",
        category,
        itemType,
        itemType === "pizza" ? priceRegular : null,
        itemType === "pizza" ? priceMedium : null,
        itemType === "pizza" ? priceLarge : null,
        itemType === "simple" ? price : null,
        image ?? "",
        !!isBestSeller,
        !!isNew,
        sortOrder,
      ]
    );

    invalidateDataCache("menu_items");
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("[POST /api/admin/menu]", error);
    return NextResponse.json({ success: false, message: "Failed to create item." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const body = await request.json().catch(() => null);
  const { id, name, description, category, priceRegular, priceMedium, priceLarge, price, image, isBestSeller, isNew, isAvailable } = body ?? {};

  if (!id) {
    return NextResponse.json({ success: false, message: "Item id is required." }, { status: 400 });
  }

  try {
    const existing = await pool.query("SELECT item_type FROM menu_items WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ success: false, message: "Item not found." }, { status: 404 });
    }
    const itemType = existing.rows[0].item_type;

    await pool.query(
      `UPDATE menu_items SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        price_regular = CASE WHEN $5::text = 'pizza' THEN COALESCE($6, price_regular) ELSE price_regular END,
        price_medium = CASE WHEN $5::text = 'pizza' THEN COALESCE($7, price_medium) ELSE price_medium END,
        price_large = CASE WHEN $5::text = 'pizza' THEN COALESCE($8, price_large) ELSE price_large END,
        price = CASE WHEN $5::text = 'simple' THEN COALESCE($9, price) ELSE price END,
        image = COALESCE($10, image),
        is_best_seller = COALESCE($11, is_best_seller),
        is_new = COALESCE($12, is_new),
        is_available = COALESCE($13, is_available),
        updated_at = now()
       WHERE id = $1`,
      [id, name, description, category, itemType, priceRegular, priceMedium, priceLarge, price, image, isBestSeller, isNew, isAvailable]
    );

    invalidateDataCache("menu_items");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/menu]", error);
    return NextResponse.json({ success: false, message: "Failed to update item." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAuth();
  if (authError) return authError;
  const dbError = requireDb();
  if (dbError) return dbError;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, message: "Item id is required." }, { status: 400 });
  }

  try {
    await pool.query("DELETE FROM menu_items WHERE id = $1", [id]);
    invalidateDataCache("menu_items");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/menu]", error);
    return NextResponse.json({ success: false, message: "Failed to delete item." }, { status: 500 });
  }
}
