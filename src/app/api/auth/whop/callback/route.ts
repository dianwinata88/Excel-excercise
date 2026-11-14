import { NextResponse } from "next/server";
import { SESSION_COOKIE, signSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { exchangeCode, getUserInfo, hasProMembership } from "@/lib/whop";

/** GET /api/auth/whop/callback — finish OAuth, set the session cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("ep_pkce="))
    ?.slice("ep_pkce=".length);

  if (!code || !state || !raw) return fail("Sign-in session expired — try again");

  let stored: { verifier: string; state: string; next: string };
  try {
    stored = JSON.parse(decodeURIComponent(raw));
  } catch {
    return fail("Invalid sign-in session");
  }
  if (state !== stored.state) return fail("State mismatch — try again");

  let accessToken: string;
  try {
    const tokens = await exchangeCode(code, `${origin}/api/auth/whop/callback`, stored.verifier);
    accessToken = tokens.access_token;
  } catch {
    return fail("Could not complete Whop sign-in");
  }

  let user;
  try {
    user = await getUserInfo(accessToken);
  } catch {
    return fail("Could not load your Whop profile");
  }

  const check = await hasProMembership(user.sub);
  const name = user.name ?? user.preferred_username ?? "Excel learner";
  const email = user.email ?? null;

  // When Whop can't be checked, fall back to the stored entitlement rather
  // than overwriting a subscriber's pro with a transient failure.
  let pro = check.pro;
  try {
    const prisma = getPrisma();
    if (check.error) {
      const stored = await prisma.whopUser.findUnique({
        where: { whopUserId: user.sub },
      });
      pro = stored?.pro ?? false;
    }
    await prisma.whopUser.upsert({
      where: { whopUserId: user.sub },
      update: {
        email,
        name,
        pro,
        ...(check.error ? {} : { membershipId: check.membershipId }),
      },
      create: { whopUserId: user.sub, email, name, pro, membershipId: check.membershipId },
    });
  } catch (err) {
    console.error("WhopUser upsert failed", err);
  }

  const res = NextResponse.redirect(`${origin}${stored.next}`);
  res.cookies.set(SESSION_COOKIE, signSession({ sub: user.sub, name, email, pro }), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  res.cookies.delete("ep_pkce");
  return res;
}
