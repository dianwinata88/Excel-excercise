import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getComparisonDocs } from "@/lib/content";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Excel Function Comparisons — VLOOKUP vs XLOOKUP & More",
  description: "Compare Excel functions side by side: VLOOKUP vs XLOOKUP, SUMIF vs SUMIFS, COUNTIF vs COUNTIFS and more.",
  path: "/compare",
});

export default function CompareIndexPage() {
  const comparisons = [...getComparisonDocs()].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Excel Function Comparisons",
          description: "Side-by-side comparisons of common Excel functions.",
          path: "/compare",
          items: comparisons.map((comparison) => ({
            name: comparison.title,
            path: `/compare/${comparison.slug}`,
          })),
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Comparisons", path: "/compare" }]} />
      <header>
        <h1 className="text-3xl font-bold">Excel function comparisons</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Not sure which function to use? These guides compare the options people search for,
          with a direct verdict and when to choose each one.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {comparisons.map((comparison) => (
          <li key={comparison.slug}>
            <Link
              href={`/compare/${comparison.slug}`}
              className="block h-full rounded-xl border border-zinc-200 p-5 hover:border-emerald-400 dark:border-zinc-800"
            >
              <h2 className="font-semibold">
                {comparison.leftName} vs {comparison.rightName}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{comparison.verdict}</p>
              <p className="mt-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Compare →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
