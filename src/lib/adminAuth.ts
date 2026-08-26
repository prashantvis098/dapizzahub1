import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * ============================================================
 *  ADMIN AUTH — simple password-based session for /admin/orders
 * ============================================================
 *
 * No external auth service — just an env-configured password and a
 * signed, httpOnly session cookie. Set these two environment variables:
 *
 *   ADMIN_PASSWORD    — the password restaurant staff will type in to
 *                        view orders. Choose something only staff know.
 *   ADMIN_SESSION_SECRET — any long random string, used to sign the
 *                        session cookie so it can't be forged. Generate
 *                        one with: openssl rand -base64 32
 *
 * If ADMIN_SESSION_SECRET isn't set, a fallback is used ONLY in
 * development so local testing works out of the box — production must
 * set a real secret (enforced below).
 */

const COOKIE_NAME = "dph_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ADMIN_SESSION_SECRET is not set. Set it in your hosting environment variables (generate one with `openssl rand -base64 32`)."
      );
    }
    // Development-only fallback so `npm run dev` works without extra setup.
    return new TextEncoder().encode("dev-only-insecure-secret-do-not-use-in-prod");
  }

  return new TextEncoder().encode(secret);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export async function createAdminSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
  return token;
}

export async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function isAdminRequestAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSession(token);
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME, SESSION_DURATION_SECONDS };
