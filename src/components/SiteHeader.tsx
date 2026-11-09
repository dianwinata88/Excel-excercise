import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

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
          <Link href="/shortcuts" className="hover:underline">
            Shortcuts
          </Link>
          <Link href="/practice" className="hover:underline">
            Practice
          </Link>
        </nav>
      </div>
    </header>
  );
}
