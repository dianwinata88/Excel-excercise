import { createHash, randomBytes } from "node:crypto";

/**
 * Whop integration helpers (server-side only).
 * Sandbox base URLs are used when WHOP_API_BASE / WHOP_OAUTH_BASE envs point at
 * the sandbox hosts; production is the default.
 */
export const WHOP_API_BASE =
  process.env.WHOP_API_BASE ?? "https://api.whop.com/api/v1";
export const WHOP_OAUTH_BASE =
  process.env.WHOP_OAUTH_BASE ?? "https://api.whop.com/oauth";
export const WHOP_APP_ID = process.env.WHOP_APP_ID ?? "";
export const WHOP_MONTHLY_URL = process.env.WHOP_MONTHLY_URL ?? "";
export const WHOP_LIFETIME_URL = process.env.WHOP_LIFETIME_URL ?? "";

const API_KEY = process.env.WHOP_API_KEY ?? "";
const CLIENT_SECRET = process.env.WHOP_CLIENT_SECRET ?? "";

const PRO_STATUSES = new Set(["active", "trialing", "past_due"]);

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

export function newState(): { state: string; nonce: string } {
  return { state: b64url(randomBytes(16)), nonce: b64url(randomBytes(16)) };
}

export function authorizeUrl(opts: {
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: WHOP_APP_ID,
    redirect_uri: opts.redirectUri,
    scope: "openid profile email",
    state: opts.state,
    nonce: opts.nonce,
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
  });
  return `${WHOP_OAUTH_BASE}/authorize?${params}`;
}

export async function exchangeCode(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<{ access_token: string; id_token?: string }> {
  const res = await fetch(`${WHOP_OAUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: WHOP_APP_ID,
      client_secret: CLIENT_SECRET || undefined,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Whop token exchange failed: ${res.status} ${body}`);
  }
  return res.json();
}

export async function getUserInfo(accessToken: string): Promise<{
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}> {
  const res = await fetch(`${WHOP_OAUTH_BASE}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Whop userinfo failed: ${res.status}`);
  return res.json();
}

/**
 * True when the Whop user holds a usable membership to any of this
 * account's products (monthly or lifetime both count as Pro).
 */
export async function hasProMembership(whopUserId: string): Promise<{
  pro: boolean;
  membershipId: string | null;
}> {
  if (!API_KEY) return { pro: false, membershipId: null };
  const res = await fetch(
    `${WHOP_API_BASE}/memberships?user_id=${encodeURIComponent(whopUserId)}&first=50`,
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return { pro: false, membershipId: null };
  const json = (await res.json()) as {
    data?: { id: string; status: string }[];
  };
  const active = (json.data ?? []).find((m) => PRO_STATUSES.has(m.status));
  return { pro: !!active, membershipId: active?.id ?? null };
}
