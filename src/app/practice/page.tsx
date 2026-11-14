import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PracticeBoard } from "@/components/exercise/PracticeBoard";
import { ContextualLinks } from "@/components/seo/ContextualLinks";
import { FaqSection } from "@/components/seo/FaqSection";
import { getExercises } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

const PRACTICE_FAQS = [
  {
    question: "What is a free Excel practice test?",
    answer:
      "It is a set of interactive spreadsheet exercises that test formulas, functions, lookups, shortcuts and data cleanup without requiring a proctored exam.",
  },
  {
    question: "Do I need Excel installed for the practice test?",
    answer:
      "No. The test runs in your browser, so you can practice on any computer with an internet connection.",
  },
  {
    question: "What skills does the practice test cover?",
    answer:
      "The exercises cover SUM, COUNT, IF, VLOOKUP, XLOOKUP, conditional totals, text cleanup, dates and common keyboard shortcuts.",
  },
  {
    question: "Is this the same as a Microsoft Excel certification exam?",
    answer:
      "No. This is free practice for building skills and confidence. Certification exams are separate proctored assessments; use the certification prep page for that path.",
  },
  {
    question: "How often should I take an Excel practice test?",
    answer:
      "A short session a few times per week is more effective than one long cram. Revisit missed formulas and track your XP and streak on this device.",
  },
];

export const metadata = buildMetadata({
  title: "Free Excel Practice Test Online",
  description:
    "Take a free Excel practice test online with interactive formula, lookup, shortcut and data exercises. No Excel install needed.",
  path: "/practice",
});

export default function PracticePage() {
  const exercises = getExercises();
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Practice", path: "/practice" }]} />
      <header>
        <h1 className="text-3xl font-bold">Free Excel practice test online</h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          Jump into any exercise — everything runs in your browser. XP and your
          streak are saved on this device.
        </p>
      </header>
      <PracticeBoard exercises={exercises} />
      <ContextualLinks
        title="Preparing for an Excel assessment or certification?"
        description="Turn practice into a test-ready plan by focusing on the skills employers and examiners ask for most."
        links={[
          {
            href: "/how-to/prepare-for-excel-assessment-test",
            label: "Excel assessment prep",
            description: "A practical study plan",
          },
          {
            href: "/how-to/excel-skills-test-practice",
            label: "Excel skills test practice",
            description: "Drill the core formulas",
          },
          {
            href: "/certification",
            label: "Certification prep",
            description: "MO-200, MO-201 and job tests",
          },
        ]}
      />
      <FaqSection faqs={PRACTICE_FAQS} title="Excel practice test questions" />
    </div>
  );
}
