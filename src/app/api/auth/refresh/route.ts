import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSession, signSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { hasProMembership } from "@/lib/whop";

/**
 * GET /api/auth/refresh?next=/learn — re-check the membership with Whop
 * unconditionally (bypasses the 24h entitlement cache) and re-sign the
 * session cookie. Use after buying Pro so access applies without re-login.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(
      `${url.origin}/login?next=${encodeURIComponent(safeNext)}`,
    );
  }

  const check = await hasProMembership(session.sub);
  const pro = check.error ? session.pro : check.pro;
  if (!check.error) {
    try {
      await getPrisma().whopUser.update({
        where: { whopUserId: session.sub },
        data: { pro: check.pro, membershipId: check.membershipId },
      });
    } catch (err) {
      console.error("WhopUser refresh sync failed", err);
    }
  }

  const res = NextResponse.redirect(`${url.origin}${safeNext}`);
  res.cookies.set(SESSION_COOKIE, signSession({ ...session, pro }), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
