import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ep_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type Session = {
  sub: string; // Whop user id (user_xxx)
  name: string;
  email: string | null;
  pro: boolean;
};

function secret(): string | undefined {
  return process.env.SESSION_SECRET;
}

export function signSession(session: Session): string {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET is not configured");
  const payload = Buffer.from(
    JSON.stringify({ ...session, exp: Date.now() + MAX_AGE_MS }),
  ).toString("base64url");
  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(value: string): Session | null {
  const key = secret();
  if (!key) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", key).update(payload).digest("base64url");
  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof s.exp !== "number" || s.exp < Date.now()) return null;
    return { sub: s.sub, name: s.name ?? "", email: s.email ?? null, pro: !!s.pro };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return value ? verifySession(value) : null;
}

/**
 * Public origin of the incoming request. Behind a reverse proxy
 * `new URL(request.url).origin` is the internal host; use the
 * forwarded headers so absolute redirects and OAuth redirect_uri
 * match what the browser actually sees.
 */
function allowedForwardedHost(host: string): boolean {
  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (site && new URL(site).host === host) return true;
  } catch {
    // fall through to the pattern checks below
  }
  return (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".preview.devinapps.com") ||
    host.endsWith(".devinapps.com")
  );
}

export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  if (!host || !allowedForwardedHost(host)) return url.origin;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    url.protocol.replace(":", "");
  return `${proto === "http" || proto === "https" ? proto : "https"}://${host}`;
}
