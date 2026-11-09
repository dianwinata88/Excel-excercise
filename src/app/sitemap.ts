import type { MetadataRoute } from "next";
import {
  getComparisonDocs,
  getFunctionDocs,
  getLessons,
  getShortcutDocs,
  getTaskDocs,
  getTopics,
} from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "weekly") => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  });

  return [
    entry("/", 1.0),
    entry("/learn", 0.8),
    entry("/functions", 0.8),
    entry("/shortcuts", 0.8),
    entry("/practice", 0.7),
    entry("/certification", 0.7),
    ...getTopics().map((t) => entry(`/learn/${t.slug}`, 0.7)),
    ...getLessons().map((l) => entry(`/lesson/${l.slug}`, 0.6)),
    ...getFunctionDocs().map((f) => entry(`/functions/${f.slug}`, 0.6, "monthly")),
    ...getTaskDocs().map((t) => entry(`/how-to/${t.slug}`, 0.6, "monthly")),
    ...getShortcutDocs().map((s) => entry(`/shortcuts/${s.slug}`, 0.5, "monthly")),
    ...getComparisonDocs().map((c) => entry(`/compare/${c.slug}`, 0.6, "monthly")),
  ];
}
