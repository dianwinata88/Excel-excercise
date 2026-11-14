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
  /** true when Whop could not be checked — callers must not downgrade stored pro. */
  error: boolean;
}> {
  if (!API_KEY) return { pro: false, membershipId: null, error: false };
  let res: Response;
  try {
    res = await fetch(
      `${WHOP_API_BASE}/memberships?user_id=${encodeURIComponent(whopUserId)}&first=50`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "no-store",
      },
    );
  } catch {
    return { pro: false, membershipId: null, error: true };
  }
  if (!res.ok) return { pro: false, membershipId: null, error: true };
  const json = (await res.json().catch(() => null)) as {
    data?: { id: string; status: string }[];
  } | null;
  if (!json) return { pro: false, membershipId: null, error: true };
  const active = (json.data ?? []).find((m) => PRO_STATUSES.has(m.status));
  return { pro: !!active, membershipId: active?.id ?? null, error: false };
}

const PRO_SYNC_STALE_MS = 24 * 60 * 60 * 1000;

/**
 * Effective Pro status: trusts the DB for 24h, then re-checks Whop.
 * Gated pages call this so an expired subscription is revoked within a day
 * and a fresh purchase is picked up without forcing a re-login.
 */
export async function getEffectivePro(whopUserId: string): Promise<boolean> {
  const { getPrisma } = await import("./db");
  let stored: { pro: boolean; membershipId: string | null; syncedAt: Date } | null = null;
  try {
    stored = await getPrisma().whopUser.findUnique({ where: { whopUserId } });
  } catch {
    stored = null;
  }
  if (stored && Date.now() - stored.syncedAt.getTime() < PRO_SYNC_STALE_MS) {
    return stored.pro;
  }
  const check = await hasProMembership(whopUserId);
  const pro = check.error ? (stored?.pro ?? false) : check.pro;
  try {
    await getPrisma().whopUser.upsert({
      where: { whopUserId },
      update: { pro, membershipId: check.error ? stored?.membershipId : check.membershipId },
      create: { whopUserId, pro, membershipId: check.membershipId },
    });
  } catch (err) {
    console.error("WhopUser sync failed", err);
  }
  return pro;
}
