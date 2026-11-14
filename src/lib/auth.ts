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

function secret(): string {
  return process.env.SESSION_SECRET ?? "excel-practice-dev-secret";
}

export function signSession(session: Session): string {
  const payload = Buffer.from(
    JSON.stringify({ ...session, exp: Date.now() + MAX_AGE_MS }),
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(value: string): Session | null {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
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
