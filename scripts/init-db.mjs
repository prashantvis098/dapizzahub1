// Run once (locally, or once via your host's shell) to create the orders
// table: `npm run db:init`
//
// Requires DATABASE_URL to be set — either in your shell environment, or
// in a .env.local file in the project root (this script loads it if
// present, no extra dependency required).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal .env.local loader (avoids adding a dotenv dependency just for this).
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
  console.error(
    "\n❌ DATABASE_URL is not set.\n\n" +
      "Add it to a .env.local file in the project root, e.g.:\n" +
      "  DATABASE_URL=postgres://user:password@host/dbname?sslmode=require\n\n" +
      "You can get a free connection string from https://neon.tech\n"
  );
  process.exit(1);
}

const schemaPath = path.join(__dirname, "..", "src", "lib", "schema.sql");
const schema = readFileSync(schemaPath, "utf8");

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

try {
  await pool.query(schema);
  console.log("✅ Database ready — orders table created (or already existed).");
} catch (err) {
  console.error("❌ Failed to initialize database:\n", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
