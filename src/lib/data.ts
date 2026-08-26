import { pool, isDatabaseConfigured } from "@/lib/db";
import { branches as fallbackBranches, brand } from "@/data/branches";
import { pizzas as fallbackPizzas, pizzaCombos as fallbackCombos } from "@/data/pizzas";
import {
  burgers as fbBurgers,
  fries as fbFries,
  pastas as fbPastas,
  wraps as fbWraps,
  breads as fbBreads,
  otherSides as fbOtherSides,
  shakes as fbShakes,
  mocktails as fbMocktails,
  desserts as fbDesserts,
} from "@/data/food";
import type { Branch, PizzaItem, SimpleItem, MenuItem, MenuCategory } from "@/types";

/**
 * ============================================================
 *  LIVE DATA LAYER — menu, branches, coupons
 * ============================================================
 *
 * Reads from the database (tables created by src/lib/schema.sql,
 * populated by `npm run db:seed`) so edits made in /admin/menu,
 * /admin/branches, and /admin/coupons show up on the live site
 * immediately.
 *
 * If DATABASE_URL isn't configured yet (e.g. first-time local setup),
 * every function here falls back to the original hardcoded data in
 * src/data/*.ts, so the site still renders — but admin edits obviously
 * won't persist until a database is connected. This mirrors how
 * src/lib/petpooja.ts degrades gracefully without credentials.
 *
 * Cached in-memory for a short time per server instance to avoid a
 * database round-trip on every single page render — cheap for a
 * single-restaurant site's traffic level, and cache entries are cleared
 * immediately whenever an admin saves a change (see the admin API
 * routes), so edits still feel instant to staff.
 */

const CACHE_TTL_MS = 30_000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return undefined;
  return entry.value as T;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function invalidateDataCache(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
}

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

function rowToBranch(row: Record<string, unknown>): Branch {
  return {
    id: row.id as string,
    name: row.name as string,
    address: row.address as string,
    phone: row.phone as string,
    whatsapp: row.whatsapp as string,
    mapsUrl: row.maps_url as string,
    swiggyUrl: (row.swiggy_url as string | null) ?? undefined,
    zomatoUrl: (row.zomato_url as string | null) ?? undefined,
    lat: Number(row.lat),
    lng: Number(row.lng),
  };
}

export async function getBranches(): Promise<Branch[]> {
  const cached = getCached<Branch[]>("branches");
  if (cached) return cached;

  if (!isDatabaseConfigured()) return fallbackBranches;

  try {
    const result = await pool.query(
      "SELECT * FROM branches WHERE is_active = true ORDER BY sort_order ASC"
    );
    if (result.rows.length === 0) return fallbackBranches;
    const branches = result.rows.map(rowToBranch);
    setCached("branches", branches);
    return branches;
  } catch (err) {
    console.error("[getBranches] falling back to static data:", err);
    return fallbackBranches;
  }
}

export async function getPrimaryBranch(): Promise<Branch> {
  const all = await getBranches();
  return all.find((b) => b.id === "Panki") ?? all[0];
}

export { brand };

// ---------------------------------------------------------------------------
// Menu items
// ---------------------------------------------------------------------------

function rowToMenuItem(row: Record<string, unknown>): MenuItem {
  const base = {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    category: row.category as MenuCategory,
    image: (row.image as string) ?? "",
    isBestSeller: Boolean(row.is_best_seller),
    isNew: Boolean(row.is_new),
  };

  if (row.item_type === "pizza") {
    return {
      ...base,
      type: "pizza",
      prices: {
        regular: Number(row.price_regular ?? 0),
        medium: Number(row.price_medium ?? 0),
        large: Number(row.price_large ?? 0),
      },
    } satisfies PizzaItem;
  }

  return {
    ...base,
    type: "simple",
    price: Number(row.price ?? 0),
  } satisfies SimpleItem;
}

function fallbackMenuItems(): MenuItem[] {
  const combosAsMenuItems: SimpleItem[] = fallbackCombos.map((combo) => ({
    id: combo.id,
    name: combo.name,
    description: "",
    category: "combo",
    type: "simple",
    price: combo.price,
    image: "",
    isBestSeller: false,
    isNew: false,
  }));

  return [
    ...fallbackPizzas,
    ...fbBurgers,
    ...fbFries,
    ...fbPastas,
    ...fbWraps,
    ...fbBreads,
    ...fbOtherSides,
    ...fbShakes,
    ...fbMocktails,
    ...fbDesserts,
    ...combosAsMenuItems,
  ];
}

/** All available (in-stock) menu items — what customers should see. */
export async function getMenuItems(): Promise<MenuItem[]> {
  const cached = getCached<MenuItem[]>("menu_items");
  if (cached) return cached;

  if (!isDatabaseConfigured()) return fallbackMenuItems();

  try {
    const result = await pool.query(
      "SELECT * FROM menu_items WHERE is_available = true ORDER BY sort_order ASC"
    );
    if (result.rows.length === 0) return fallbackMenuItems();
    const items = result.rows.map(rowToMenuItem);
    setCached("menu_items", items);
    return items;
  } catch (err) {
    console.error("[getMenuItems] falling back to static data:", err);
    return fallbackMenuItems();
  }
}

/** Every menu item including unavailable ones — for the admin menu page. */
export async function getAllMenuItemsForAdmin(): Promise<
  (MenuItem & { isAvailable: boolean })[]
> {
  if (!isDatabaseConfigured()) {
    return fallbackMenuItems().map((item) => ({ ...item, isAvailable: true }));
  }

  const result = await pool.query("SELECT * FROM menu_items ORDER BY sort_order ASC");
  return result.rows.map((row) => ({
    ...rowToMenuItem(row),
    isAvailable: Boolean(row.is_available),
  }));
}

export async function getPizzas(): Promise<PizzaItem[]> {
  const items = await getMenuItems();
  return items.filter((i): i is PizzaItem => i.type === "pizza");
}
