import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSession, signSession } from "@/lib/auth";
import { getEffectivePro } from "@/lib/whop";

/**
 * GET /api/auth/refresh?next=/learn — re-check the membership with Whop and
 * re-sign the session cookie. Use after buying Pro so access applies without
 * signing out and back in.
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

  const pro = await getEffectivePro(session.sub);
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
