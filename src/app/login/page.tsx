import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "Sign in",
    description: "Sign in to Excel Practice with your Whop account to unlock Pro lessons.",
    path: "/login",
  }),
  robots: { index: false },
};

async function SessionCard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextParam = typeof sp.next === "string" ? sp.next : "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const error = typeof sp.error === "string" ? sp.error : null;
  const session = await getSession();

  return (
    <>
      {error && (
        <p className="w-full rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}
      {session ? (
        <div className="w-full rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as <strong>{session.name}</strong>
            {session.pro && (
              <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                PRO
              </span>
            )}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href={next}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Continue →
            </Link>
            <a
              href={`/api/auth/refresh?next=${encodeURIComponent(next)}`}
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold dark:border-zinc-700"
            >
              Refresh access
            </a>
            <a
              href="/api/auth/logout"
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold dark:border-zinc-700"
            >
              Sign out
            </a>
          </div>
        </div>
      ) : (
        <a
          href={`/api/auth/whop?next=${encodeURIComponent(next)}`}
          className="rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Sign in with Whop
        </a>
      )}
    </>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 py-16 text-center">
      <h1 className="text-3xl font-bold">Sign in to Excel Practice</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Use the Whop account tied to your Pro purchase. New here? Beginner
        lessons are free — no account needed.
      </p>

      <Suspense
        fallback={
          <div className="h-12 w-48 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        }
      >
        <SessionCard searchParams={searchParams} />
      </Suspense>

      <p className="text-sm text-zinc-500">
        Don&apos;t have Pro yet?{" "}
        <Link href="/upgrade" className="text-emerald-700 hover:underline dark:text-emerald-400">
          See plans
        </Link>
      </p>
    </div>
  );
}
