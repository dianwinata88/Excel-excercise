"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/Badge";

export type SeoSearchItem = {
  href: string;
  title: string;
  description?: string;
  badge?: string;
  badgeTone?: BadgeTone;
};

export function SeoSearchGrid({
  items,
  searchLabel,
  placeholder,
  emptyMessage,
  className = "",
}: {
  items: SeoSearchItem[];
  searchLabel: string;
  placeholder: string;
  emptyMessage: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      `${item.title} ${item.description ?? ""} ${item.badge ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [items, normalizedQuery]);

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="block w-full lg:max-w-sm">
          <span className="sr-only">{searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-emerald-900"
          />
        </label>
        <p className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
          Showing {filteredItems.length} of {items.length}
        </p>
      </div>

      {filteredItems.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                className="flex h-full min-h-32 flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-snug">{item.title}</h2>
                  {item.badge && <Badge tone={item.badgeTone}>{item.badge}</Badge>}
                </div>
                {item.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
