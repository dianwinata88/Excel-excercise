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
const WHOP_PRODUCT_ID = process.env.WHOP_PRODUCT_ID ?? "";

const API_KEY = process.env.WHOP_API_KEY ?? "";
const CLIENT_SECRET = process.env.WHOP_CLIENT_SECRET ?? "";

// "completed" = fulfilled non-renewing term (e.g. a lifetime purchase),
// still entitled to access.
const PRO_STATUSES = new Set(["active", "trialing", "past_due", "completed"]);

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
  email_verified?: boolean;
}> {
  const res = await fetch(`${WHOP_OAUTH_BASE}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Whop userinfo failed: ${res.status}`);
  return res.json();
}

/**
 * True when a member whose email matches holds an active membership on the
 * Pro product. This is how email-registered accounts get Pro linked: buy on
 * Whop checkout with the same email, then refresh.
 */
export async function hasProMembershipByEmail(email: string): Promise<{
  pro: boolean;
  membershipId: string | null;
  error: boolean;
}> {
  // No product configured → cannot scope the check → fail closed.
  if (!API_KEY || !WHOP_PRODUCT_ID)
    return { pro: false, membershipId: null, error: false };
  const params = new URLSearchParams({
    query: email,
    membership_status: "active",
    first: "20",
    product_ids: WHOP_PRODUCT_ID,
  });
  let res: Response;
  try {
    res = await fetch(`${WHOP_API_BASE}/members?${params}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    });
  } catch {
    return { pro: false, membershipId: null, error: true };
  }
  if (!res.ok) return { pro: false, membershipId: null, error: true };
  const json = (await res.json().catch(() => null)) as {
    data?: { id: string; email?: string | null }[];
  } | null;
  if (!json) return { pro: false, membershipId: null, error: true };
  // `query` also matches names/usernames — require an exact email match.
  const match = (json.data ?? []).find(
    (m) => m.email?.toLowerCase() === email.toLowerCase(),
  );
  return { pro: !!match, membershipId: match?.id ?? null, error: false };
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
  // No product configured → any membership would match → fail closed.
  if (!API_KEY || !WHOP_PRODUCT_ID)
    return { pro: false, membershipId: null, error: false };
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
    data?: { id: string; status: string; product_id?: string }[];
  } | null;
  if (!json) return { pro: false, membershipId: null, error: true };
  // Only memberships on the Pro product count — an account can sell other
  // products that must not unlock this site.
  const active = (json.data ?? []).find(
    (m) => PRO_STATUSES.has(m.status) && m.product_id === WHOP_PRODUCT_ID,
  );
  return { pro: !!active, membershipId: active?.id ?? null, error: false };
}

/** Full membership row for the self-service plan page. */
export type WhopMembership = {
  id: string;
  status: string;
  user_id: string;
  product_id: string;
  variant_id: string | null;
  billing_period_days: number | null;
  renewal_price: { amount: string; currency: string } | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  manage_url: string | null;
  created_at: string | null;
};

/**
 * Active-or-pending-cancel Pro memberships for a Whop user, newest shape.
 * Powers the /account self-service page.
 */
export async function listProMemberships(whopUserId: string): Promise<{
  memberships: WhopMembership[];
  error: boolean;
}> {
  if (!API_KEY || !WHOP_PRODUCT_ID) return { memberships: [], error: false };
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
    return { memberships: [], error: true };
  }
  if (!res.ok) return { memberships: [], error: true };
  const json = (await res.json().catch(() => null)) as {
    data?: WhopMembership[];
  } | null;
  if (!json) return { memberships: [], error: true };
  const active = (json.data ?? []).filter(
    (m) => PRO_STATUSES.has(m.status) && m.product_id === WHOP_PRODUCT_ID,
  );
  return { memberships: active, error: false };
}

/** Plan id is the last path segment of a checkout URL env var. */
function planIdFromUrl(url: string): string | null {
  const tail = url.trim().split("/").filter(Boolean).pop();
  return tail && tail.startsWith("plan_") ? tail : null;
}

/** "monthly" | "lifetime" | "other" for a Pro membership. */
export function planKind(m: WhopMembership): "monthly" | "lifetime" | "other" {
  const monthlyId = planIdFromUrl(WHOP_MONTHLY_URL);
  const lifetimeId = planIdFromUrl(WHOP_LIFETIME_URL);
  if (m.variant_id && monthlyId && m.variant_id === monthlyId) return "monthly";
  if (m.variant_id && lifetimeId && m.variant_id === lifetimeId)
    return "lifetime";
  // Unmatched or missing variant — billing cadence is the real signal: a
  // monthly-billing membership still needs cancel/upgrade controls even
  // when its plan isn't the configured monthly or lifetime plan.
  if (m.billing_period_days === null) return "lifetime";
  return m.billing_period_days <= 40 ? "monthly" : "other";
}

async function membershipPost(
  path: string,
  body: object,
): Promise<{ ok: boolean; status: number }> {
  if (!API_KEY) return { ok: false, status: 0 };
  try {
    const res = await fetch(`${WHOP_API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

/** Stop auto-renewal; the member keeps access until the period ends. */
export async function cancelMembershipAtPeriodEnd(
  membershipId: string,
): Promise<{ ok: boolean; status: number }> {
  return membershipPost(`/memberships/${membershipId}/cancel`, {
    cancel_at_period_end: true,
  });
}

/** Undo a pending period-end cancellation. */
export async function resumeMembership(
  membershipId: string,
): Promise<{ ok: boolean; status: number }> {
  if (!API_KEY) return { ok: false, status: 0 };
  try {
    const res = await fetch(`${WHOP_API_BASE}/memberships/${membershipId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancel_at_period_end: false }),
      cache: "no-store",
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

const PRO_SYNC_STALE_MS = 24 * 60 * 60 * 1000;

/**
 * Effective Pro status: trusts the DB for 24h, then re-checks Whop.
 * Gated pages call this so an expired subscription is revoked within a day
 * and a fresh purchase is picked up without forcing a re-login.
 */
export async function getEffectivePro(session: {
  sub: string;
  iat: number;
}): Promise<boolean> {
  const { getPrisma } = await import("./db");
  let stored: {
    id: string;
    pro: boolean;
    email: string;
    whopUserId: string | null;
    sessionsRevokedAt: Date | null;
    syncedAt: Date;
  } | null = null;
  try {
    // whopUserId fallback keeps sessions minted before the AppUser
    // migration (sub = Whop user id) resolving.
    stored = await getPrisma().appUser.findFirst({
      where: { OR: [{ id: session.sub }, { whopUserId: session.sub }] },
    });
  } catch {
    stored = null;
  }
  if (!stored) return false;
  // Sessions minted before a Whop-claim are dead — otherwise whoever
  // pre-registered the email would ride the buyer's entitlement.
  if (
    stored.sessionsRevokedAt &&
    session.iat < stored.sessionsRevokedAt.getTime()
  ) {
    return false;
  }
  // Pro is only provable via the linked Whop user — an unverified email
  // must never grant a subscriber's entitlement.
  if (!stored.whopUserId) return false;
  if (Date.now() - stored.syncedAt.getTime() < PRO_SYNC_STALE_MS) {
    return stored.pro;
  }
  const check = await hasProMembership(stored.whopUserId);
  if (check.error) {
    // Don't cache a failure-derived answer: keep syncedAt stale so the next
    // gated request retries Whop instead of locking the stale value for 24h.
    return stored.pro;
  }
  try {
    await getPrisma().appUser.update({
      where: { id: stored.id },
      data: { pro: check.pro, membershipId: check.membershipId },
    });
  } catch (err) {
    console.error("AppUser sync failed", err);
  }
  return check.pro;
}
