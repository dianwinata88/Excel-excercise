import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExamCard } from "@/components/certification/ExamCard";
import { FaqSection } from "@/components/certification/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { getCertificationDocs } from "@/lib/content";
import { buildMetadata, collectionPageJsonLd, courseJsonLd, faqJsonLd } from "@/lib/seo";

const HUB_FAQS = [
  {
    question: "Is this Excel certification practice free?",
    answer:
      "Yes. Every exam-prep page and drill on this site is free and runs in your browser — no signup, no download and no paid practice-exam bundle required.",
  },
  {
    question: "Which Excel certification should I prepare for?",
    answer:
      "Prepare for MO-210 (Excel Associate) if you are building core Excel skills, and MO-211 (Excel Expert) if you already use formulas, lookups and PivotTables regularly. If an employer sent you an Excel test, use the job-assessment page instead.",
  },
  {
    question: "Are MO-200 and MO-201 still relevant?",
    answer:
      "MO-200 and MO-201 are the Excel 2019 versions of the Associate and Expert exams. Microsoft now lists MO-210 and MO-211 for Microsoft 365 Apps, but the skills overlap heavily, so the practice here works for both sets of exam codes.",
  },
  {
    question: "How is this different from paid practice exams?",
    answer:
      "Paid bundles sell static question banks. This site teaches the underlying skills with interactive exercises you can retry instantly, mapped objective-by-objective to the real exam blueprints, so you learn the skill instead of memorizing questions.",
  },
  {
    question: "How long does it take to prepare?",
    answer:
      "Most people need two to four weeks for MO-210 and four to eight weeks for MO-211 if they use Excel weekly. Job assessments usually need only a few days of focused practice on the task types employers test.",
  },
];

export const metadata = buildMetadata({
  title: "Excel Certification Practice Tests — Free Exam Prep",
  description:
    "Free Excel certification practice tests and exam prep: MO-210 practice exam, MO-211 practice exam, Excel Associate and Expert drills, plus job-assessment practice for the Indeed Excel test.",
  path: "/certification",
});

export default function CertificationPage() {
  const certifications = getCertificationDocs();
  return (
    <div className="flex flex-col gap-8">
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "Excel certification and assessment prep",
            description:
              "Free interactive practice for the MO-210 and MO-211 Excel certifications and employer Excel assessments.",
            path: "/certification",
            items: certifications.map((c) => ({
              name: `${c.code} — ${c.shortName}`,
              path: `/certification/${c.slug}`,
            })),
          }),
          courseJsonLd({
            name: "Excel certification practice",
            description:
              "Free interactive drills mapped to the MO-210, MO-211 and job-assessment Excel skill areas.",
            path: "/certification",
          }),
          faqJsonLd(HUB_FAQS),
        ]}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Certification", path: "/certification" }]} />

      <header>
        <h1 className="text-3xl font-bold">Excel certification and assessment prep</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Free, interactive practice for the exams and employer tests that screen Excel skills.
          Every skill area below is mapped to real lessons, how-to guides and exercises you can
          try in your browser — no paid practice-exam bundle required.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((doc) => (
          <ExamCard key={doc.slug} doc={doc} />
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold">What the exams cover</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {certifications.map((doc) => (
            <div key={doc.slug} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <h3 className="font-semibold">{doc.shortName}</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {doc.objectives.map((objective) => (
                  <li key={objective.name}>
                    {objective.weight ? `${objective.name} (${objective.weight})` : objective.name}
                  </li>
                ))}
              </ul>
              <Link
                href={`/certification/${doc.slug}`}
                className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
              >
                See the full breakdown →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">How to practice</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Learn the core skills in the{" "}
            <Link href="/learn" className="text-emerald-700 hover:underline dark:text-emerald-400">
              lessons
            </Link>{" "}
            and{" "}
            <Link href="/functions" className="text-emerald-700 hover:underline dark:text-emerald-400">
              function guides
            </Link>
            .
          </li>
          <li>
            Drill each exam skill area on its certification page, following the objective-by-objective
            breakdown.
          </li>
          <li>
            Finish with the{" "}
            <Link href="/practice" className="text-emerald-700 hover:underline dark:text-emerald-400">
              free practice sandbox
            </Link>{" "}
            to build speed under time pressure.
          </li>
        </ol>
      </section>

      <FaqSection faqs={HUB_FAQS} />
    </div>
  );
}
