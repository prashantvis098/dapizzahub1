// Run once (after `npm run db:init`) to load the site's existing
// hardcoded menu/branches/coupons data into the database, so the admin
// panel has something to show and edit from day one.
//
// Usage: npm run db:seed
//
// Safe to re-run — uses ON CONFLICT DO UPDATE, so re-running just
// refreshes rows to match the source files again (handy in dev). In
// production you'd normally run this once, then manage everything from
// the admin panel from then on.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

// tsx lets this script import the actual .ts data files directly, so the
// seed data can never drift from what's really in the codebase.
import { branches, brand } from "../src/data/branches.ts";
import { pizzas, pizzaCombos } from "../src/data/pizzas.ts";
import {
  burgers,
  fries,
  pastas,
  wraps,
  breads,
  otherSides,
  shakes,
  mocktails,
  desserts,
} from "../src/data/food.ts";
import { coupons } from "../src/data/coupons.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const envPath = path.join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("\n❌ DATABASE_URL is not set. See .env.example.\n");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

async function seedBranches() {
  let i = 0;
  for (const b of branches) {
    await pool.query(
      `INSERT INTO branches (id, name, address, phone, whatsapp, maps_url, swiggy_url, zomato_url, lat, lng, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, address = EXCLUDED.address, phone = EXCLUDED.phone,
         whatsapp = EXCLUDED.whatsapp, maps_url = EXCLUDED.maps_url,
         swiggy_url = EXCLUDED.swiggy_url, zomato_url = EXCLUDED.zomato_url,
         lat = EXCLUDED.lat, lng = EXCLUDED.lng, sort_order = EXCLUDED.sort_order,
         updated_at = now()`,
      [b.id, b.name, b.address, b.phone, b.whatsapp, b.mapsUrl, b.swiggyUrl ?? null, b.zomatoUrl ?? null, b.lat, b.lng, i]
    );
    i++;
  }
  console.log(`✅ Seeded ${branches.length} branches`);
}

async function seedMenuItems() {
  let sortOrder = 0;

  for (const p of pizzas) {
    await pool.query(
      `INSERT INTO menu_items (id, name, description, category, item_type, price_regular, price_medium, price_large, image, is_best_seller, is_new, sort_order)
       VALUES ($1,$2,$3,$4,'pizza',$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category,
         price_regular = EXCLUDED.price_regular, price_medium = EXCLUDED.price_medium, price_large = EXCLUDED.price_large,
         image = EXCLUDED.image, is_best_seller = EXCLUDED.is_best_seller, is_new = EXCLUDED.is_new,
         sort_order = EXCLUDED.sort_order, updated_at = now()`,
      [p.id, p.name, p.description, p.category, p.prices.regular, p.prices.medium, p.prices.large, p.image, !!p.isBestSeller, !!p.isNew, sortOrder++]
    );
  }

  const simpleGroups = [burgers, fries, pastas, wraps, breads, otherSides, shakes, mocktails, desserts];
  for (const group of simpleGroups) {
    for (const item of group) {
      await pool.query(
        `INSERT INTO menu_items (id, name, description, category, item_type, price, image, is_best_seller, is_new, sort_order)
         VALUES ($1,$2,$3,$4,'simple',$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category,
           price = EXCLUDED.price, image = EXCLUDED.image, is_best_seller = EXCLUDED.is_best_seller,
           is_new = EXCLUDED.is_new, sort_order = EXCLUDED.sort_order, updated_at = now()`,
        [item.id, item.name, item.description ?? "", item.category, item.price, item.image ?? "", !!item.isBestSeller, !!item.isNew, sortOrder++]
      );
    }
  }

  // Combos have no per-item description/image in the source data — give
  // them a minimal one so they render sensibly wherever menu items are
  // listed generically.
  for (const combo of pizzaCombos) {
    await pool.query(
      `INSERT INTO menu_items (id, name, description, category, item_type, price, image, sort_order)
       VALUES ($1,$2,$3,'combo','simple',$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, price = EXCLUDED.price, sort_order = EXCLUDED.sort_order, updated_at = now()`,
      [combo.id, combo.name, "", combo.price, "", sortOrder++]
    );
  }

  const total = pizzas.length + simpleGroups.reduce((sum, g) => sum + g.length, 0) + pizzaCombos.length;
  console.log(`✅ Seeded ${total} menu items (including ${pizzaCombos.length} combos)`);
}

async function seedCoupons() {
  for (const c of coupons) {
    await pool.query(
      `INSERT INTO coupons (code, type, value, min_order, max_discount, description)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (code) DO UPDATE SET
         type = EXCLUDED.type, value = EXCLUDED.value, min_order = EXCLUDED.min_order,
         max_discount = EXCLUDED.max_discount, description = EXCLUDED.description`,
      [c.code, c.type, c.value, c.minOrder, c.maxDiscount ?? null, c.description]
    );
  }
  console.log(`✅ Seeded ${coupons.length} coupons`);
}

try {
  await seedBranches();
  await seedMenuItems();
  await seedCoupons();
  console.log("\n🎉 Database seeded successfully.\n");
} catch (err) {
  console.error("❌ Seeding failed:\n", err);
  process.exit(1);
} finally {
  await pool.end();
}
