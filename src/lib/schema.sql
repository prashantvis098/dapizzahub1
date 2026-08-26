-- Da Pizza Hub — Orders table
-- Run once via `npm run db:init` (see scripts/init-db.mjs).
-- Safe to re-run: uses IF NOT EXISTS, so it won't wipe existing data.

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  branch_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type TEXT NOT NULL,              -- 'delivery' | 'pickup'
  delivery_address TEXT,
  items JSONB NOT NULL,                  -- array of { name, quantity, unitPrice, customizationSummary }
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  coupon_code TEXT,
  payment_method TEXT NOT NULL,          -- 'cod' | 'upi'
  schedule_mode TEXT NOT NULL DEFAULT 'now',  -- 'now' | 'later'
  scheduled_for TEXT,
  status TEXT NOT NULL DEFAULT 'new',    -- 'new' | 'preparing' | 'out_for_delivery' | 'completed' | 'cancelled'
  -- Client-generated key (one per checkout attempt — see CheckoutClient.tsx)
  -- used to make POST /api/orders safe to retry: a dropped connection or
  -- browser retry that resends the exact same submission returns the
  -- original order instead of inserting a duplicate. No inline UNIQUE here
  -- — uniqueness (for non-null keys only) is enforced by the partial
  -- index created below, which applies consistently whether this is a
  -- fresh database or an existing one gaining the column via migration.
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
-- Safe to re-run against an existing database created before this column
-- existed (additive migration — never drops or rewrites existing data).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_idempotency_key'
  ) THEN
    CREATE UNIQUE INDEX idx_orders_idempotency_key ON orders (idempotency_key)
    WHERE idempotency_key IS NOT NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Branches — editable from /admin/branches. Site reads from this table
-- (see src/lib/data.ts) instead of the old hardcoded src/data/branches.ts.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,                   -- e.g. 'Panki' — stable slug, used in orders.branch_id
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  maps_url TEXT NOT NULL DEFAULT '',
  swiggy_url TEXT,
  zomato_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  opening_time TEXT NOT NULL DEFAULT '11:00',
  closing_time TEXT NOT NULL DEFAULT '23:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Menu items — covers pizzas (with size pricing) and simple items
-- (burgers, fries, etc. with a single price). Site reads from this table
-- instead of the old hardcoded src/data/pizzas.ts / src/data/food.ts.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,                   -- stable slug, e.g. 'da-paneer-special'
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  item_type TEXT NOT NULL,               -- 'pizza' | 'simple'
  price_regular NUMERIC(10, 2),          -- pizza sizes (NULL for simple items)
  price_medium NUMERIC(10, 2),
  price_large NUMERIC(10, 2),
  price NUMERIC(10, 2),                  -- simple items' single price (NULL for pizzas)
  image TEXT NOT NULL DEFAULT '',
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,   -- toggled from admin to 86 an item
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category);

-- ---------------------------------------------------------------------------
-- Coupons — editable from /admin/coupons. Validated server-side at
-- checkout (src/app/api/coupons/validate/route.ts) instead of the old
-- client-only src/data/coupons.ts, which anyone could bypass via devtools.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY,                 -- stored upper-case
  type TEXT NOT NULL,                    -- 'percent' | 'flat'
  value NUMERIC(10, 2) NOT NULL,
  min_order NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10, 2),           -- caps percent-based discounts; NULL = uncapped
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_limit INT,                       -- NULL = unlimited
  times_used INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,                -- NULL = never expires
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

