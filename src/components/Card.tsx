import Link from "next/link";
import type { ReactNode } from "react";

const cardClass =
  "block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900";

export function Card({
  href,
  className = "",
  children,
}: {
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const cls = `${cardClass} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}
