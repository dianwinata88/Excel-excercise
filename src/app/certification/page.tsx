import { Breadcrumbs } from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Excel Certification & Assessment Prep",
  description: "Practice for the MO-200, MO-201 and job-assessment Excel tests.",
  path: "/certification",
});

export default function CertificationPage() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[{ name: "Home", path: "/" }, { name: "Certification", path: "/certification" }]}
      />
      <h1 className="text-3xl font-bold">Excel certification prep</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Practice the exact skills tested by the Microsoft Office Specialist exams (MO-200,
        MO-201) and common job assessments like the Indeed Excel test.
      </p>
      <p className="text-sm text-zinc-500">Exam-prep practice sets are being added.</p>
    </div>
  );
}
