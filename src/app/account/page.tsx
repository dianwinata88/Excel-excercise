import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { getSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { buildMetadata } from "@/lib/seo";
import {
  listProMemberships,
  planKind,
  WHOP_LIFETIME_URL,
  type WhopMembership,
} from "@/lib/whop";

export const metadata = buildMetadata({
  title: "Manage your plan",
  description: "View, upgrade, or cancel your Excel Practice Pro plan.",
  path: "/account",
});

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function price(m: WhopMembership): string {
  if (!m.renewal_price) return "";
  return `$${m.renewal_price.amount} ${m.renewal_price.currency.toUpperCase()}`;
}

function PlanCard({
  m,
  kind,
  confirmCancel,
  hasLifetime,
}: {
  m: WhopMembership;
  kind: "monthly" | "lifetime" | "other";
  confirmCancel: boolean;
  hasLifetime: boolean;
}) {
  const pendingCancel = m.cancel_at_period_end;
  const renewsAt = fmtDate(m.current_period_end);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          {kind === "lifetime"
            ? "Lifetime Pro"
            : kind === "monthly"
              ? "Monthly Pro"
              : "Pro membership"}
        </h2>
        {pendingCancel ? (
          <Badge tone="amber">Cancels {renewsAt}</Badge>
        ) : (
          <Badge tone="green">Active</Badge>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <dt className="text-zinc-500">Price</dt>
        <dd className="text-right font-medium">
          {kind === "lifetime" ? "One-time" : `${price(m)}/mo`}
        </dd>
        {kind !== "lifetime" && (
          <>
            <dt className="text-zinc-500">
              {pendingCancel ? "Access until" : "Next billing date"}
            </dt>
            <dd className="text-right font-medium">{renewsAt}</dd>
          </>
        )}
      </dl>

      {pendingCancel && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Your plan is set to cancel — you keep Pro until {renewsAt}.
        </p>
      )}

      {kind === "monthly" && hasLifetime && (
        <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          You also have Lifetime — this monthly renewal is redundant. Cancel
          it and you keep Pro forever.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {kind === "monthly" && !pendingCancel && (
          <>
            {!hasLifetime && WHOP_LIFETIME_URL && (
              <a
                href={WHOP_LIFETIME_URL}
                data-track="checkout_start"
                data-track-prop-plan="lifetime"
                data-track-prop-location="account_upgrade"
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Upgrade to Lifetime — one payment, forever
              </a>
            )}
            {confirmCancel ? (
              <form
                method="post"
                action="/api/account/cancel"
                className="rounded-lg border border-red-200 p-3 dark:border-red-900"
              >
                <input type="hidden" name="membershipId" value={m.id} />
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Cancel auto-renewal? You keep Pro until {renewsAt}, then it
                  ends — no charge again.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    data-track="cancel_confirm"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Confirm cancellation
                  </button>
                  <Link
                    href="/account"
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Keep my plan
                  </Link>
                </div>
              </form>
            ) : (
              <Link
                href="/account?confirm=cancel"
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel subscription
              </Link>
            )}
          </>
        )}

        {pendingCancel && (
          <form method="post" action="/api/account/resume">
            <input type="hidden" name="membershipId" value={m.id} />
            <button
              type="submit"
              data-track="resume_click"
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Keep my subscription
            </button>
          </form>
        )}

        {kind === "lifetime" && (
          <p className="text-sm text-zinc-500">
            Paid once — no renewals, nothing to cancel. You have Pro forever.
          </p>
        )}

        {m.manage_url && (
          <a
            href={m.manage_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Manage billing details on Whop ↗
          </a>
        )}
      </div>
    </Card>
  );
}

async function AccountBody({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const user = await getPrisma().appUser.findFirst({
    where: { OR: [{ id: session.sub }, { whopUserId: session.sub }] },
  });
  // Sessions minted before a Whop-claim are dead — same check as
  // getEffectivePro so a stale session can't read or change billing.
  if (
    !user ||
    (user.sessionsRevokedAt && session.iat < user.sessionsRevokedAt.getTime())
  ) {
    redirect("/login?next=/account");
  }

  const confirmCancel = params.confirm === "cancel";

  let memberships: WhopMembership[] = [];
  let whopError = false;
  if (user.whopUserId) {
    const list = await listProMemberships(user.whopUserId);
    memberships = list.memberships;
    whopError = list.error;
  }

  const hasLifetime = memberships.some((m) => planKind(m) === "lifetime");

  const errors: Record<string, string> = {
    noplan: "No Whop-linked plan found on this account.",
    badrequest: "That request didn't look right — try again.",
    notfound: "We couldn't find that membership on your account.",
    whop: "Whop couldn't complete that action — please retry.",
  };
  const error = params.error ? errors[params.error] : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Your plan</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Signed in as {user.email ?? user.name}
        </p>
      </div>

      {params.canceled === "1" && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Subscription canceled — you keep Pro until the end of your current
          period. Come back anytime.
        </p>
      )}
      {params.resumed === "1" && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          Subscription resumed — your plan will keep renewing.
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      {whopError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          We couldn&apos;t reach Whop to load your plan — try refreshing in
          a moment.
        </p>
      )}

      {!user.whopUserId && !whopError && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No Pro plan is linked to this account yet. Buy Pro with the same
            email you registered, or claim a purchase you already made.
          </p>
          <Link
            href="/upgrade"
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            See Pro plans
          </Link>
          <a
            href={`/api/auth/whop?next=${encodeURIComponent("/account")}`}
            className="text-center text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Already bought? Claim your purchase
          </a>
        </Card>
      )}

      {user.whopUserId && memberships.length === 0 && !whopError && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You don&apos;t have an active Pro plan right now.
          </p>
          <Link
            href="/upgrade"
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Get Pro
          </Link>
        </Card>
      )}

      {memberships.map((m) => (
        <PlanCard
          key={m.id}
          m={m}
          kind={planKind(m)}
          confirmCancel={confirmCancel}
          hasLifetime={hasLifetime}
        />
      ))}
    </div>
  );
}

export default function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto h-64 w-full max-w-2xl animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800" />
      }
    >
      <AccountBody searchParams={searchParams} />
    </Suspense>
  );
}
