import { NextRequest, NextResponse } from "next/server";
import {
  checkAdminPassword,
  createAdminSession,
  isAdminConfigured,
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/adminAuth";

// Basic in-memory rate limiting per server instance — slows down brute
// force attempts without needing an external service. Resets on deploy/
// cold start, which is an acceptable tradeoff for a single-restaurant
// admin login (not a public multi-tenant product).
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Admin login isn't set up yet — add ADMIN_PASSWORD to your environment variables.",
      },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: "Too many attempts. Please wait a while and try again." },
      { status: 429 }
    );
  }

  const { password } = await request.json().catch(() => ({ password: "" }));

  if (typeof password !== "string" || !checkAdminPassword(password)) {
    return NextResponse.json(
      { success: false, message: "Incorrect password." },
      { status: 401 }
    );
  }

  const token = await createAdminSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}
