import Link from "next/link";

/**
 * Paywall block shown where Pro-only practice would normally appear.
 * Members who bought via Whop just sign in; everyone else sees the plans.
 */
export function ProGate({ next }: { next: string }) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-400">
        Pro practice
      </p>
      <h3 className="mt-2 text-xl font-bold">
        This content is for Pro members
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        Unlock all intermediate and advanced lessons and exercises —
        $10/month or $100 once, forever. Checkout happens on Whop.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/upgrade"
          className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          See Pro plans
        </Link>
        <Link
          href={`/api/auth/whop?next=${encodeURIComponent(next)}`}
          className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-semibold hover:border-emerald-400 dark:border-zinc-700"
        >
          Already a member? Sign in
        </Link>
      </div>
    </div>
  );
}
