import { NextResponse } from "next/server";
import { applySession, requestOrigin } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { exchangeCode, getUserInfo, hasProMembership } from "@/lib/whop";

/** GET /api/auth/whop/callback — finish OAuth, set the session cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = requestOrigin(request);
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
  const email = (user.email ?? "").toLowerCase() || `whop-${user.sub}@oauth.local`;

  // The AppUser is the account — linked by whopUserId or by matching email,
  // so a Whop sign-in and an email registration converge on one record.
  // When Whop can't be checked, fall back to the stored entitlement rather
  // than overwriting a subscriber's pro with a transient failure.
  try {
    const prisma = getPrisma();
    const existing = await prisma.appUser.findFirst({
      where: { OR: [{ whopUserId: user.sub }, { email }] },
    });
    const pro = check.error ? (existing?.pro ?? false) : check.pro;
    const membershipId = check.error ? existing?.membershipId : check.membershipId;
    // First time Whop links into a password account, the proven email owner
    // takes over: an account someone else may have registered with this
    // email loses its password access.
    const newlyLinked = existing !== null && existing.whopUserId !== user.sub;
    const appUser = existing
      ? await prisma.appUser.update({
          where: { id: existing.id },
          data: {
            email,
            name,
            whopUserId: user.sub,
            pro,
            membershipId,
            ...(newlyLinked ? { passwordHash: null } : {}),
          },
        })
      : await prisma.appUser.create({
          data: { email, name, whopUserId: user.sub, pro, membershipId },
        });

    const res = NextResponse.redirect(`${origin}${stored.next}`);
    applySession(res, appUser);
    res.cookies.delete("ep_pkce");
    return res;
  } catch (err) {
    console.error("AppUser upsert failed", err);
    return fail("Could not save your account — try again");
  }
}
