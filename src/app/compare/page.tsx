import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SeoSearchGrid } from "@/components/SeoSearchGrid";
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
        <Badge tone="sky">{comparisons.length} comparisons</Badge>
        <h1 className="mt-3 text-3xl font-bold">Excel function comparisons</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Not sure which function to use? These guides compare the options people search for,
          with a direct verdict and when to choose each one.
        </p>
      </header>
      <SeoSearchGrid
        items={comparisons.map((comparison) => ({
          href: `/compare/${comparison.slug}`,
          title: `${comparison.leftName} vs ${comparison.rightName}`,
          description: comparison.verdict,
          badge: "Comparison",
          badgeTone: "sky",
        }))}
        searchLabel="Search Excel function comparisons"
        placeholder="Search VLOOKUP, SUMIF, INDEX MATCH…"
        emptyMessage="No comparisons match that search. Try a function name like VLOOKUP or XLOOKUP."
      />
    </div>
  );
}
