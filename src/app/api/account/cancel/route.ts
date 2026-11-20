import { NextResponse } from "next/server";
import { getSession, requestOrigin } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import {
  cancelMembershipAtPeriodEnd,
  listProMemberships,
} from "@/lib/whop";

/**
 * POST /api/account/cancel — stop auto-renewal on a Pro membership the
 * signed-in user owns. Access keeps running until the period ends; the
 * next entitlement sync drops pro when the membership actually lapses.
 */
export async function POST(request: Request) {
  const origin = requestOrigin(request);
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(`${origin}/login?next=/account`);
  }
  const user = await getPrisma().appUser.findUnique({
    where: { id: session.sub },
  });
  if (!user?.whopUserId) {
    return NextResponse.redirect(`${origin}/account?error=noplan`);
  }

  const form = await request.formData().catch(() => null);
  const membershipId = form?.get("membershipId");
  if (typeof membershipId !== "string" || !membershipId.startsWith("mem_")) {
    return NextResponse.redirect(`${origin}/account?error=badrequest`);
  }

  // The membership must be one of the user's own Pro memberships.
  const list = await listProMemberships(user.whopUserId);
  if (list.error || !list.memberships.some((m) => m.id === membershipId)) {
    return NextResponse.redirect(`${origin}/account?error=notfound`);
  }

  const res = await cancelMembershipAtPeriodEnd(membershipId);
  if (!res.ok) {
    return NextResponse.redirect(`${origin}/account?error=whop`);
  }
  return NextResponse.redirect(`${origin}/account?canceled=1`);
}
