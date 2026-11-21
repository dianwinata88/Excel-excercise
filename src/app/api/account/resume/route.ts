import { NextResponse } from "next/server";
import { getSession, requestOrigin } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { listProMemberships, resumeMembership } from "@/lib/whop";

/**
 * POST /api/account/resume — undo a pending period-end cancellation on a
 * Pro membership the signed-in user owns.
 */
export async function POST(request: Request) {
  const origin = requestOrigin(request);
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(`${origin}/login?next=/account`, 303);
  }
  const user = await getPrisma().appUser.findFirst({
    where: { OR: [{ id: session.sub }, { whopUserId: session.sub }] },
  });
  if (
    !user ||
    (user.sessionsRevokedAt && session.iat < user.sessionsRevokedAt.getTime())
  ) {
    return NextResponse.redirect(`${origin}/login?next=/account`, 303);
  }
  if (!user.whopUserId) {
    return NextResponse.redirect(`${origin}/account?error=noplan`, 303);
  }

  const form = await request.formData().catch(() => null);
  const membershipId = form?.get("membershipId");
  if (typeof membershipId !== "string" || !membershipId.startsWith("mem_")) {
    return NextResponse.redirect(`${origin}/account?error=badrequest`, 303);
  }

  const list = await listProMemberships(user.whopUserId);
  if (list.error || !list.memberships.some((m) => m.id === membershipId)) {
    return NextResponse.redirect(`${origin}/account?error=notfound`, 303);
  }

  const res = await resumeMembership(membershipId);
  if (!res.ok) {
    return NextResponse.redirect(`${origin}/account?error=whop`, 303);
  }
  return NextResponse.redirect(`${origin}/account?resumed=1`, 303);
}
