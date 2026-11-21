import Link from "next/link";
import type { ReactNode } from "react";

const sizes = {
  sm: "p-4",
  md: "p-6",
} as const;

const cardClass =
  "block rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900";

export function Card({
  href,
  className = "",
  size = "md",
  children,
}: {
  href?: string;
  className?: string;
  size?: keyof typeof sizes;
  children: ReactNode;
}) {
  const cls = `${cardClass} ${sizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}
