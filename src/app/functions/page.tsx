import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import { FaqSection } from "@/components/seo/FaqSection";
import { functionCategorySlug, getFunctionCategories, getFunctionDocsByCategory } from "@/lib/content";
import { buildMetadata, collectionPageJsonLd } from "@/lib/seo";

const FUNCTION_FAQS = [
  {
    question: "What is an Excel formulas cheat sheet?",
    answer:
      "It is a quick-reference guide to the formulas and functions people use most: syntax, arguments, examples and common mistakes.",
  },
  {
    question: "Does this cover every Excel function?",
    answer:
      "It covers a curated set of high-value functions across math, lookup, text, dates, logic and statistics. Open any function page for syntax and examples.",
  },
  {
    question: "Do I need Excel installed to use the cheat sheet?",
    answer:
      "No. You can read the syntax and examples in your browser, then practice formulas in the interactive exercises without installing Excel.",
  },
  {
    question: "Which formulas should I learn first for Excel interviews?",
    answer:
      "Start with SUM, COUNT, AVERAGE, IF, VLOOKUP or XLOOKUP, SUMIF and INDEX + MATCH. Those formulas cover most entry-level assessment questions.",
  },
  {
    question: "How do I practice a formula after reading it?",
    answer:
      "Use the Try it yourself exercise on function pages or visit the Practice page to solve formula exercises with instant feedback.",
  },
];

export const metadata = buildMetadata({
  title: "Excel Formulas Cheat Sheet",
  description:
    "Use this Excel formulas cheat sheet to browse functions by category, learn syntax, see examples, and practice formulas online.",
  path: "/functions",
});

export default function FunctionsIndex() {
  const categories = getFunctionCategories();
  return (
    <div className="flex flex-col gap-10">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Excel Formulas Cheat Sheet",
          description: "A practical Excel formulas cheat sheet with syntax, examples and practice.",
          path: "/functions",
          items: categories.map((category) => ({
            name: `${category} functions`,
            path: `/functions/category/${functionCategorySlug(category)}`,
          })),
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Functions", path: "/functions" }]} />
      <header>
        <h1 className="text-3xl font-bold">Excel formulas cheat sheet</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Browse formulas by category, then open any function for syntax, examples,
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
      <ContextualLinks
        title="Preparing for an Excel test or certification?"
        description="Use the cheat sheet to review syntax, then prove the formulas in a timed practice session."
        links={[
          {
            href: "/practice",
            label: "Practice formulas online",
            description: "Free interactive exercises",
          },
          {
            href: "/how-to/excel-interview-questions",
            label: "Excel interview questions",
            description: "Common assessment topics",
          },
          {
            href: "/certification",
            label: "Certification prep",
            description: "Exam-focused practice",
          },
        ]}
      />
      <FaqSection faqs={FUNCTION_FAQS} title="Excel formula questions" />
    </div>
  );
}
