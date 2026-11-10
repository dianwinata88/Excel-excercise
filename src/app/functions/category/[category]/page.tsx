import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
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
    title: `${category} Functions in Excel — Syntax, Examples & Practice`,
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
        <h1 className="text-3xl font-bold">{category} functions</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {functions.length} Excel {category.toLowerCase()} functions, ordered for quick scanning.
          Open a function for syntax, examples, common errors and a practice exercise where available.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {functions.map((fn) => (
          <li key={fn.slug}>
            <Link
              href={`/functions/${fn.slug}`}
              className="block h-full rounded-lg border border-zinc-200 p-4 hover:border-emerald-400 dark:border-zinc-800"
            >
              <span className="font-mono font-semibold">{fn.name}</span>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{fn.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
