import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "Sign in",
    description: "Sign in to Excel Practice to unlock Pro lessons and track your progress.",
    path: "/login",
  }),
  robots: { index: false },
};

const inputCls =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900";

function Field({
  label,
  name,
  type,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block text-left">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={inputCls}
      />
    </label>
  );
}

async function SessionCard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextParam = typeof sp.next === "string" ? sp.next : "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const error = typeof sp.error === "string" ? sp.error : null;
  const tab = typeof sp.tab === "string" ? sp.tab : "signin";
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
        <div className="w-full rounded-2xl border border-zinc-200 p-6 text-left dark:border-zinc-800">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-zinc-100 p-1 text-sm font-semibold dark:bg-zinc-800">
            <Link
              href={`/login?${next !== "/" ? `next=${encodeURIComponent(next)}&` : ""}tab=signin`}
              className={`rounded-full px-4 py-2 text-center ${
                tab !== "register"
                  ? "bg-white shadow-sm dark:bg-zinc-950"
                  : "text-zinc-500"
              }`}
            >
              Sign in
            </Link>
            <Link
              href={`/login?${next !== "/" ? `next=${encodeURIComponent(next)}&` : ""}tab=register`}
              className={`rounded-full px-4 py-2 text-center ${
                tab === "register"
                  ? "bg-white shadow-sm dark:bg-zinc-950"
                  : "text-zinc-500"
              }`}
            >
              Create account
            </Link>
          </div>

          {tab === "register" ? (
            <form action="/api/auth/register" method="post" className="flex flex-col gap-4">
              <input type="hidden" name="next" value={next} />
              <Field label="Name" name="name" type="text" placeholder="Your name" />
              <Field label="Email" name="email" type="email" placeholder="you@example.com" />
              <Field
                label="Password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
              />
              <button
                type="submit"
                className="mt-1 rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Create account
              </button>
              <p className="text-xs text-zinc-500">
                Buying Pro? Use this same email at Whop checkout so your
                purchase links to this account.
              </p>
            </form>
          ) : (
            <form action="/api/auth/login" method="post" className="flex flex-col gap-4">
              <input type="hidden" name="next" value={next} />
              <Field label="Email" name="email" type="email" placeholder="you@example.com" />
              <Field label="Password" name="password" type="password" placeholder="Your password" />
              <button
                type="submit"
                className="mt-1 rounded-full bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Sign in
              </button>
            </form>
          )}

          <div className="mt-5 border-t border-zinc-200 pt-4 text-center dark:border-zinc-800">
            <a
              href={`/api/auth/whop?next=${encodeURIComponent(next)}`}
              className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
            >
              or Sign in with Whop →
            </a>
          </div>
        </div>
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
      <h1 className="text-3xl font-bold">Your Excel Practice account</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Create an account to subscribe to Pro. Beginner lessons stay free — no
        account needed.
      </p>

      <Suspense
        fallback={
          <div className="h-64 w-full animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
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
