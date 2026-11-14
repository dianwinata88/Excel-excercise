import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getLessons, getTopic, getTopics } from "@/lib/content";
import { buildMetadata, courseJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getTopics().map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[topic]">) {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  return buildMetadata({
    title: topic.title,
    description: topic.description,
    path: `/learn/${slug}`,
    absoluteTitle: true,
  });
}

export default async function TopicPage({ params }: PageProps<"/learn/[topic]">) {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const lessons = getLessons();
  return (
    <div className="flex flex-col gap-6">
      <JsonLd data={courseJsonLd({ name: topic.title, description: topic.description, path: `/learn/${slug}` })} />
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Lessons", path: "/learn" },
          { name: topic.name, path: `/learn/${slug}` },
        ]}
      />
      <h1 className="text-3xl font-bold">Excel lessons: {topic.name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{topic.description}</p>
      <ul className="space-y-3">
        {topic.lessons.map((lessonSlug, i) => {
          const lesson = lessons.find((l) => l.slug === lessonSlug);
          if (!lesson) return null;
          return (
            <li key={lessonSlug} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <Link href={`/lesson/${lessonSlug}`} className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
                {i + 1}. {lesson.title}
              </Link>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{lesson.description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
