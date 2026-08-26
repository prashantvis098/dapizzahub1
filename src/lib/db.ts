import { Pool } from "pg";

/**
 * ============================================================
 *  DATABASE CONNECTION — order storage for the Admin Orders page
 * ============================================================
 *
 * Requires a single environment variable: DATABASE_URL
 *
 * Works with any standard Postgres connection string, so any of these
 * free options work without changing any code:
 *   - Neon (https://neon.tech) — free tier, no credit card required
 *   - Vercel Postgres (powered by Neon) — free tier on Vercel
 *   - Supabase Postgres — free tier
 *   - A Postgres instance on your own VPS
 *
 * Setup:
 *   1. Create a free Postgres database (e.g. at https://neon.tech).
 *   2. Copy the connection string it gives you (starts with
 *      "postgres://" or "postgresql://").
 *   3. Add it as DATABASE_URL in your hosting platform's environment
 *      variables (e.g. Vercel → Project → Settings → Environment
 *      Variables), and in a local .env.local file for development.
 *   4. Run `npm run db:init` once to create the orders table.
 *
 * No other setup is needed — orders placed on the site will then be
 * saved here and appear on /admin/orders automatically.
 */

declare global {
  // eslint-disable-next-line no-var
  var __dphPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  // This should never be reached when DATABASE_URL is unset — callers must
  // check isDatabaseConfigured() first — but guard anyway rather than let
  // `new Pool({ connectionString: undefined })` fail in a confusing way.
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment variables — see src/lib/db.ts for setup instructions."
    );
  }

  return new Pool({
    connectionString,
    // Most free hosted Postgres providers (Neon, Vercel Postgres, Supabase)
    // require SSL and use certificates not in Node's default trust store.
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 5,
  });
}

/**
 * Lazily creates (and reuses) the connection pool.
 *
 * IMPORTANT: this must stay lazy. Every caller in this codebase does
 * `if (!isDatabaseConfigured()) { ...fallback... }` before touching the
 * database, so that the site/admin can run without DATABASE_URL set (e.g.
 * first-time local setup, or a demo deploy). If pool creation ran eagerly
 * at module load time, simply *importing* this file would throw whenever
 * DATABASE_URL is missing — crashing the homepage, menu, checkout, and
 * every admin page with a 500 instead of falling back gracefully. Accessing
 * `pool` directly without checking isDatabaseConfigured() first is a bug —
 * it will throw. Use the `pool` getter export below.
 */
function getPool(): Pool {
  if (!global.__dphPgPool) {
    global.__dphPgPool = createPool();
  }
  return global.__dphPgPool;
}

// Exposed as `pool` for call-site compatibility (`pool.query(...)`), but
// backed by a lazy getter so `import { pool } from "@/lib/db"` never runs
// createPool() itself — only an actual property access (i.e. a query) does.
export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    return Reflect.get(getPool(), prop, receiver);
  },
});

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
