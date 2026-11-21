import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FunctionDocCard } from "@/components/FunctionDocCard";
import { JsonLd } from "@/components/JsonLd";
import {
  functionCategorySlug,
  getFunctionCategories,
  getFunctionCategoryBySlug,
  getFunctionDocsByCategory,
} from "@/lib/content";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getFunctionCategories().map((category) => ({
    category: functionCategorySlug(category),
  }));
}

export async function generateMetadata({ params }: PageProps<"/functions/category/[category]">) {
  const { category: slug } = await params;
  const category = getFunctionCategoryBySlug(slug);
  if (!category) return {};
  const count = getFunctionDocsByCategory(category).length;
  return buildMetadata({
    title: `${category} Functions in Excel`,
    description: `Learn ${count} Excel ${category.toLowerCase()} functions with syntax, examples, common errors and practice exercises.`,
    path: `/functions/category/${slug}`,
  });
}

export default async function FunctionCategoryPage({
  params,
}: PageProps<"/functions/category/[category]">) {
  const { category: slug } = await params;
  const category = getFunctionCategoryBySlug(slug);
  if (!category) notFound();
  const functions = getFunctionDocsByCategory(category);

  return (
    <div className="flex flex-col gap-6">
      <JsonLd
        data={collectionPageJsonLd({
          name: `${category} Functions in Excel`,
          description: `Excel ${category.toLowerCase()} functions with syntax, examples and hands-on practice.`,
          path: `/functions/category/${slug}`,
          items: functions.map((fn) => ({ name: fn.name, path: `/functions/${fn.slug}` })),
        })}
      />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Functions", path: "/functions" },
          { name: category, path: `/functions/category/${slug}` },
        ]}
      />
      <header>
        <Link
          href="/functions"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          ← All functions
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">Excel {category} functions</h1>
          <Badge tone="zinc">{functions.length}</Badge>
        </div>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {functions.length} Excel {category.toLowerCase()} functions, ordered for quick scanning.
          Open a function for syntax, examples, common errors and a practice exercise where available.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {functions.map((fn) => (
          <li key={fn.slug} className="min-w-0">
            <FunctionDocCard fn={fn} showCategory />
          </li>
        ))}
      </ul>
    </div>
  );
}
