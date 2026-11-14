import { NextResponse } from "next/server";
import {
  applySession,
  hashPassword,
  requestOrigin,
} from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { hasProMembershipByEmail } from "@/lib/whop";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/** POST /api/auth/register — create an email+password account and sign in. */
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
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address");
  if (name.length < 1) return fail("Tell us your name");
  if (password.length < 8) return fail("Password must be at least 8 characters");

  const prisma = getPrisma();
  const existing = await prisma.appUser.findUnique({ where: { email } });
  if (existing) {
    return fail(
      existing.passwordHash
        ? "An account with this email already exists — sign in instead"
        : "This email is linked to a Whop sign-in — use Sign in with Whop",
    );
  }

  // If they bought Pro on Whop with this email before registering, unlock now.
  const check = await hasProMembershipByEmail(email);
  const user = await prisma.appUser.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
      pro: check.error ? false : check.pro,
      membershipId: check.error ? null : check.membershipId,
      // A failed Whop check isn't a fact to cache — let the next gated
      // request retry instead of holding pro=false for 24h.
      ...(check.error ? { syncedAt: new Date(0) } : {}),
    },
  });

  const res = NextResponse.redirect(`${origin}${next}`, 303);
  applySession(res, user);
  return res;
}
