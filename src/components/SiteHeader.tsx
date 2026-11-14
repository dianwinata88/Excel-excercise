import { Suspense } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SITE_NAME } from "@/lib/seo";

function GuestLinks() {
  return (
    <>
      <Link
        href="/upgrade"
        className="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-700"
      >
        Go Pro
      </Link>
      <Link href="/login" className="hover:underline">
        Sign in
      </Link>
    </>
  );
}

async function HeaderAuth() {
  const session = await getSession();
  if (!session) return <GuestLinks />;
  return (
    <>
      {session.pro ? (
        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
          PRO
        </span>
      ) : (
        <Link
          href="/upgrade"
          className="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-700"
        >
          Go Pro
        </Link>
      )}
      <a href="/api/auth/logout" className="text-zinc-500 hover:underline">
        Sign out
      </a>
    </>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/learn" className="hover:underline">
            Lessons
          </Link>
          <Link href="/functions" className="hover:underline">
            Functions
          </Link>
          <Link href="/how-to" className="hover:underline">
            How-to
          </Link>
          <Link href="/shortcuts" className="hover:underline">
            Shortcuts
          </Link>
          <Link href="/practice" className="hover:underline">
            Practice
          </Link>
          <Suspense fallback={<GuestLinks />}>
            <HeaderAuth />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
