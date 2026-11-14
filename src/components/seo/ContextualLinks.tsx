import Link from "next/link";

export type ContextualLink = {
  href: string;
  label: string;
  description?: string;
};

export function ContextualLinks({
  title,
  description,
  links,
  className = "",
}: {
  title: string;
  description: string;
  links: ContextualLink[];
  className?: string;
}) {
  return (
    <aside className={`rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/60 ${className}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl border p-4 text-sm font-semibold transition hover:-translate-y-0.5 ${
              index === 0
                ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
                : "border-zinc-200 bg-white text-zinc-900 hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            }`}
          >
            {link.label}
            {link.description && (
              <span className={`mt-1 block text-xs font-normal ${index === 0 ? "text-emerald-50" : "text-zinc-500 dark:text-zinc-400"}`}>
                {link.description}
              </span>
            )}
          </Link>
        ))}
      </div>
    </aside>
  );
}
