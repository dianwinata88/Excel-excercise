import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";
import { WHOP_LIFETIME_URL, WHOP_MONTHLY_URL, getEffectivePro } from "@/lib/whop";

export const metadata = buildMetadata({
  title: "Pro — unlock intermediate & advanced Excel practice",
  description:
    "Go Pro to unlock every intermediate and advanced Excel lesson and exercise. $10/month or $100 lifetime, powered by Whop.",
  path: "/upgrade",
});

const PERKS = [
  "All intermediate lessons & exercises",
  "All advanced lessons & exercises",
  "New Pro content as it's added",
  "Keep every beginner feature free, forever",
];

async function PlansOrStatus() {
  const session = await getSession();
  // Re-verify against Whop/DB rather than the cookie so an expired member
  // sees the plans again and can renew.
  const pro = session ? await getEffectivePro(session.sub) : false;

  if (session && pro) {
    return (
      <section className="mx-auto w-full max-w-lg rounded-3xl border border-emerald-300 bg-emerald-50 p-8 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
        <h2 className="text-2xl font-bold">You&apos;re Pro 🎉</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as {session.name}. All intermediate and advanced practice is
          already unlocked on your account.
        </p>
        <Link
          href="/learn"
          className="mt-5 inline-block rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Continue learning →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
      <div className="flex flex-col rounded-3xl border border-zinc-200 p-8 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Monthly</h2>
        <p className="mt-2 text-4xl font-extrabold">
          $10<span className="text-base font-medium text-zinc-500">/mo</span>
        </p>
        <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          {PERKS.map((perk) => (
            <li key={perk}>✓ {perk}</li>
          ))}
        </ul>
        {WHOP_MONTHLY_URL ? (
          <a
            href={WHOP_MONTHLY_URL}
            className="mt-6 rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Subscribe monthly
          </a>
        ) : (
          <span className="mt-6 rounded-full bg-zinc-200 px-6 py-3 text-center text-sm font-semibold text-zinc-500 dark:bg-zinc-800">
            Coming soon
          </span>
        )}
        <p className="mt-3 text-center text-xs text-zinc-500">Cancel anytime</p>
      </div>

      <div className="relative flex flex-col rounded-3xl border-2 border-emerald-500 p-8">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white">
          BEST VALUE
        </span>
        <h2 className="text-lg font-semibold">Lifetime</h2>
        <p className="mt-2 text-4xl font-extrabold">
          $100<span className="text-base font-medium text-zinc-500"> once</span>
        </p>
        <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          {PERKS.map((perk) => (
            <li key={perk}>✓ {perk}</li>
          ))}
          <li>✓ Pay once — yours forever</li>
        </ul>
        {WHOP_LIFETIME_URL ? (
          <a
            href={WHOP_LIFETIME_URL}
            className="mt-6 rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Get lifetime access
          </a>
        ) : (
          <span className="mt-6 rounded-full bg-zinc-200 px-6 py-3 text-center text-sm font-semibold text-zinc-500 dark:bg-zinc-800">
            Coming soon
          </span>
        )}
        <p className="mt-3 text-center text-xs text-zinc-500">
          One-time payment, no renewals
        </p>
      </div>
    </section>
  );
}

export default function UpgradePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700 dark:text-emerald-400">
          Excel Practice Pro
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Unlock every intermediate &amp; advanced lesson
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          Beginner content stays free. Pro opens the full training path —
          checkout is handled securely by Whop.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="mx-auto h-96 w-full max-w-3xl animate-pulse rounded-3xl border border-zinc-200 dark:border-zinc-800" />
        }
      >
        <PlansOrStatus />
      </Suspense>

      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          How it works
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Pick a plan — checkout happens on Whop&apos;s secure page.</li>
          <li>
            Come back and hit <strong>Sign in with Whop</strong>.
          </li>
          <li>We check your membership and unlock Pro instantly.</li>
        </ol>
      </section>
    </div>
  );
}
