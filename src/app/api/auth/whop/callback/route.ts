import { NextResponse } from "next/server";
import { applySession, requestOrigin } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import {
  cancelMembershipAtPeriodEnd,
  exchangeCode,
  getUserInfo,
  hasProMembership,
  listProMemberships,
  planKind,
} from "@/lib/whop";

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
    // takes over: sessions minted before the claim are revoked and the
    // password is cleared — whoever pre-registered the email can neither
    // stay signed in nor log back in.
    const newlyLinked = existing !== null && existing.whopUserId !== user.sub;
    // Whop explicitly reports this email unverified — it must not take over
    // a password account registered to the same address.
    if (newlyLinked && user.email_verified === false) {
      return fail("Verify your email on Whop, then try again");
    }
    const appUser = existing
      ? await prisma.appUser.update({
          where: { id: existing.id },
          data: {
            email,
            name,
            whopUserId: user.sub,
            pro,
            membershipId,
            ...(newlyLinked
              ? { passwordHash: null, sessionsRevokedAt: new Date() }
              : {}),
          },
        })
      : await prisma.appUser.create({
          data: { email, name, whopUserId: user.sub, pro, membershipId },
        });

    // Returning from a lifetime checkout while a monthly plan is still
    // active? The member clearly switched — stop the monthly renewal once,
    // at the upgrade moment. Scoped to a fresh (<24h) lifetime so a plain
    // sign-in never re-cancels a monthly the member deliberately resumed.
    try {
      const list = await listProMemberships(user.sub);
      const justUpgraded = list.memberships.some(
        (m) =>
          planKind(m) === "lifetime" &&
          m.created_at !== null &&
          Date.now() - new Date(m.created_at).getTime() <
            24 * 60 * 60 * 1000,
      );
      if (!list.error && justUpgraded) {
        await Promise.all(
          list.memberships
            .filter(
              (m) => planKind(m) === "monthly" && !m.cancel_at_period_end,
            )
            .map((m) => cancelMembershipAtPeriodEnd(m.id)),
        );
      }
    } catch {
      // Best-effort cleanup — never block the sign-in over it.
    }

    const res = NextResponse.redirect(`${origin}${stored.next}`);
    applySession(res, appUser);
    res.cookies.delete("ep_pkce");
    return res;
  } catch (err) {
    console.error("AppUser upsert failed", err);
    return fail("Could not save your account — try again");
  }
}
