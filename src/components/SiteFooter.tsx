import Link from "next/link";
import { CurrentYear } from "@/components/CurrentYear";
import { SITE_NAME } from "@/lib/seo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© <CurrentYear /> {SITE_NAME}</p>
        <nav className="flex gap-4">
          <Link href="/learn" className="hover:underline">
            Lessons
          </Link>
          <Link href="/functions" className="hover:underline">
            Functions
          </Link>
          <Link href="/certification" className="hover:underline">
            Certification
          </Link>
        </nav>
      </div>
    </footer>
  );
}
