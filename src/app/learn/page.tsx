import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getLessons, getTopics } from "@/lib/content";
import { buildMetadata, courseJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

export const metadata = buildMetadata({
  title: "All Excel Lessons",
  description: "Bite-sized interactive Excel lessons: formulas, functions and shortcuts.",
  path: "/learn",
});

export default function LearnPage() {
  const topics = getTopics();
  const lessons = getLessons();
  return (
    <div className="flex flex-col gap-6">
      <JsonLd
        data={courseJsonLd({
          name: "Excel Practice Course",
          description: "Interactive Excel lessons covering formulas, functions and shortcuts.",
          path: "/learn",
        })}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Lessons", path: "/learn" }]} />
      <h1 className="text-3xl font-bold">Excel lessons</h1>
      {topics.map((topic) => (
        <section key={topic.slug}>
          <h2 className="text-xl font-semibold">
            <Link href={`/learn/${topic.slug}`} className="hover:underline">
              {topic.name}
            </Link>
          </h2>
          <ul className="mt-2 space-y-2">
            {topic.lessons.map((slug) => {
              const lesson = lessons.find((l) => l.slug === slug);
              if (!lesson) return null;
              return (
                <li key={slug}>
                  <Link href={`/lesson/${slug}`} className="text-emerald-700 hover:underline dark:text-emerald-400">
                    {lesson.title}
                  </Link>
                  <span className="ml-2 text-sm text-zinc-500">{lesson.level}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
