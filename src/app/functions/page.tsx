import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FunctionDocCard } from "@/components/FunctionDocCard";
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
  const groups = getFunctionCategories().map((category) => ({
    category,
    slug: functionCategorySlug(category),
    functions: getFunctionDocsByCategory(category),
  }));
  const totalFunctions = groups.reduce((sum, group) => sum + group.functions.length, 0);

  return (
    <div className="flex flex-col gap-10">
      <JsonLd
        data={collectionPageJsonLd({
          name: "Excel Formulas Cheat Sheet",
          description: "A practical Excel formulas cheat sheet with syntax, examples and practice.",
          path: "/functions",
          items: groups.map((group) => ({
            name: `${group.category} functions`,
            path: `/functions/category/${group.slug}`,
          })),
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Functions", path: "/functions" }]} />
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green">{totalFunctions} functions</Badge>
          <Badge tone="zinc">{groups.length} categories</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold">Excel formulas cheat sheet</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Browse formulas by category, then open any function for syntax, examples,
          common errors and hands-on practice.
        </p>
      </header>

      <nav
        aria-label="Function categories"
        className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Jump to category
        </p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {groups.map((group) => (
            <li key={group.category}>
              <a
                href={`#${group.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
              >
                {group.category}
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {group.functions.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {groups.map((group) => (
        <section key={group.category} id={group.slug} className="scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{group.category}</h2>
              <Badge tone="zinc">{group.functions.length}</Badge>
            </div>
            <Link
              href={`/functions/category/${group.slug}`}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              View all {group.functions.length} →
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.functions.map((fn) => (
              <li key={fn.slug} className="min-w-0">
                <FunctionDocCard fn={fn} />
              </li>
            ))}
          </ul>
        </section>
      ))}

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
