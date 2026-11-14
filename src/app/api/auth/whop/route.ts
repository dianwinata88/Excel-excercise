import { NextResponse } from "next/server";
import { requestOrigin } from "@/lib/auth";
import { authorizeUrl, newState, pkcePair } from "@/lib/whop";

/** GET /api/auth/whop?next=/learn — start Sign-in-with-Whop (OAuth 2.1 + PKCE). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const redirectUri = `${requestOrigin(request)}/api/auth/whop/callback`;
  const { verifier, challenge } = pkcePair();
  const { state, nonce } = newState();

  const res = NextResponse.redirect(
    authorizeUrl({ redirectUri, state, nonce, codeChallenge: challenge }),
  );
  const opts = { httpOnly: true, sameSite: "lax" as const, secure: true, maxAge: 600, path: "/" };
  res.cookies.set("ep_pkce", JSON.stringify({ verifier, state, next: safeNext }), opts);
  return res;
}
