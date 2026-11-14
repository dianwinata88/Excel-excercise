import { NextResponse } from "next/server";
import {
  applySession,
  clearLoginAttempts,
  loginAttemptsBlocked,
  recordFailedLogin,
  requestOrigin,
  verifyPassword,
} from "@/lib/auth";
import { getPrisma } from "@/lib/db";

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** POST /api/auth/login — email+password sign-in. */
export async function POST(request: Request) {
  const origin = requestOrigin(request);
  const form = await request.formData().catch(() => null);
  const next = safeNext(form?.get("next") ?? null);
  const fail = (reason: string) =>
    NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(reason)}&next=${encodeURIComponent(next)}`,
      303,
    );

  if (!form) return fail("Invalid form submission");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (loginAttemptsBlocked(email)) {
    return fail("Too many attempts — wait a few minutes and try again");
  }

  const user = await getPrisma().appUser.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordFailedLogin(email);
    return fail("Invalid email or password");
  }

  clearLoginAttempts(email);
  const res = NextResponse.redirect(`${origin}${next}`, 303);
  applySession(res, user);
  return res;
}
