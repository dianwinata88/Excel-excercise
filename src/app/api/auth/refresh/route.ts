import { NextResponse } from "next/server";
import { applySession, getSession, requestOrigin } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { hasProMembership, hasProMembershipByEmail } from "@/lib/whop";

/**
 * GET /api/auth/refresh?next=/learn — re-check the membership with Whop
 * unconditionally (bypasses the 24h entitlement cache) and re-sign the
 * session cookie. Use after buying Pro so access applies without re-login.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const origin = requestOrigin(request);

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(
      `${origin}/login?next=${encodeURIComponent(safeNext)}`,
    );
  }

  const user = await getPrisma().appUser.findUnique({
    where: { id: session.sub },
  });
  if (!user) {
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  // Unlinked accounts can't prove ownership by email alone — but if a
  // member with their email exists on the Pro product, send them through
  // one Whop sign-in to claim it.
  if (!user.whopUserId) {
    const hint = await hasProMembershipByEmail(user.email);
    if (!hint.error && hint.pro) {
      return NextResponse.redirect(
        `${origin}/api/auth/whop?next=${encodeURIComponent(safeNext)}`,
      );
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "No Pro purchase found for your email — buy with the same email you registered",
      )}&next=${encodeURIComponent(safeNext)}`,
    );
  }

  const check = await hasProMembership(user.whopUserId);
  if (!check.error) {
    try {
      await getPrisma().appUser.update({
        where: { id: user.id },
        data: { pro: check.pro, membershipId: check.membershipId },
      });
      user.pro = check.pro;
    } catch (err) {
      console.error("AppUser refresh sync failed", err);
    }
  }

  const res = NextResponse.redirect(`${origin}${safeNext}`);
  applySession(res, user);
  return res;
}
