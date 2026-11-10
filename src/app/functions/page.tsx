import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { functionCategorySlug, getFunctionCategories, getFunctionDocsByCategory } from "@/lib/content";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Excel Functions A–Z — Syntax, Examples & Practice",
  description: "Browse Excel functions by category: math, lookup, text, dates, logic and statistics, with syntax and examples.",
  path: "/functions",
});

export default function FunctionsIndex() {
  const categories = getFunctionCategories();
  return (
    <div className="flex flex-col gap-10">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Excel Functions A–Z",
          description: "Every documented Excel function with syntax, examples and practice.",
          path: "/functions",
          items: categories.map((category) => ({
            name: `${category} functions`,
            path: `/functions/category/${functionCategorySlug(category)}`,
          })),
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Functions", path: "/functions" }]} />
      <header>
        <h1 className="text-3xl font-bold">Excel functions</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Browse functions by category, then open any function for syntax, examples,
          common errors and hands-on practice.
        </p>
      </header>
      {categories.map((category) => {
        const functions = getFunctionDocsByCategory(category);
        const slug = functionCategorySlug(category);
        return (
          <section key={category}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-bold">{category}</h2>
              <Link
                href={`/functions/category/${slug}`}
                className="text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                View all {functions.length} →
              </Link>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {functions.map((fn) => (
                <li key={fn.slug}>
                  <Link
                    href={`/functions/${fn.slug}`}
                    className="block rounded-lg border border-zinc-200 p-4 hover:border-emerald-400 dark:border-zinc-800"
                  >
                    <span className="font-mono font-semibold">{fn.name}</span>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{fn.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
