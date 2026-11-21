import { NextResponse } from "next/server";
import { SESSION_COOKIE, requestOrigin } from "@/lib/auth";

/** GET /api/auth/logout — clear the session and go home. */
export async function GET(request: Request) {
  const res = NextResponse.redirect(requestOrigin(request) + "/");
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete("ep_pkce");
  return res;
}
