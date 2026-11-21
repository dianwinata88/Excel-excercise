import Link from "next/link";
import { CurrentYear } from "@/components/CurrentYear";
import { SITE_NAME } from "@/lib/seo";

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-zinc-600 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300";

function FooterNav({
  title,
  ariaLabel,
  links,
}: {
  title: string;
  ariaLabel: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={ariaLabel}>
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <ul className="mt-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="text-lg font-bold text-emerald-700 dark:text-emerald-400"
            >
              {SITE_NAME}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Free interactive Excel lessons, formula guides, shortcut drills and practice tests.
            </p>
          </div>

          <FooterNav
            title="Product"
            ariaLabel="Product links"
            links={[
              { href: "/learn", label: "Start for free" },
              { href: "/practice", label: "Practice test" },
              { href: "/upgrade", label: "Go Pro" },
              { href: "/login", label: "Sign in" },
            ]}
          />

          <FooterNav
            title="Learn"
            ariaLabel="Learning resources"
            links={[
              { href: "/learn", label: "Lessons" },
              { href: "/functions", label: "Functions" },
              { href: "/shortcuts", label: "Shortcuts" },
              { href: "/how-to", label: "How-to guides" },
            ]}
          />

          <FooterNav
            title="Resources"
            ariaLabel="SEO resources"
            links={[
              { href: "/compare", label: "Comparisons" },
              { href: "/certification", label: "Certification" },
              { href: "/functions", label: "Formulas cheat sheet" },
              { href: "/practice", label: "Excel practice test" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© <CurrentYear /> {SITE_NAME}</p>
          <p>Learn Excel online free — no install required.</p>
        </div>
      </div>
    </footer>
  );
}
