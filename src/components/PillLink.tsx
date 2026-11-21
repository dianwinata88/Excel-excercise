import Link from "next/link";
import type { ReactNode } from "react";

export function PillLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center rounded-full border border-zinc-300 px-3.5 text-sm font-medium text-zinc-700 transition hover:border-emerald-500 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300 ${className}`}
    >
      {children}
    </Link>
  );
}
