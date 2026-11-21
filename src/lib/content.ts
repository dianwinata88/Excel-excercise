import path from "node:path";
import { readFileSync } from "node:fs";
import {
  CertificationDocSchema,
  ComparisonDocSchema,
  ExerciseSchema,
  FunctionDocSchema,
  LessonSchema,
  ShortcutDocSchema,
  TaskDocSchema,
  TopicSchema,
  type CertificationDoc,
  type ComparisonDoc,
  type Exercise,
  type FunctionDoc,
  type Lesson,
  type ShortcutDoc,
  type TaskDoc,
  type Topic,
} from "../../content/schema";

const contentDir = path.join(process.cwd(), "content");

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(path.join(contentDir, name), "utf8"));
}

function load<T>(name: string, schema: { parse: (v: unknown) => T }): T[] {
  const rows = readJson(name) as unknown[];
  return rows.map((row, i) => {
    try {
      return schema.parse(row);
    } catch (err) {
      throw new Error(`Invalid row ${i} in content/${name}: ${err}`);
    }
  });
}

export const getTopics = (): Topic[] => load("topics.json", TopicSchema);
export const getLessons = (): Lesson[] => load("lessons.json", LessonSchema);
export const getExercises = (): Exercise[] => load("exercises.json", ExerciseSchema);
export const getFunctionDocs = (): FunctionDoc[] => load("functions.json", FunctionDocSchema);
export const getTaskDocs = (): TaskDoc[] => load("tasks.json", TaskDocSchema);
export const getShortcutDocs = (): ShortcutDoc[] => load("shortcuts.json", ShortcutDocSchema);
export const getComparisonDocs = (): ComparisonDoc[] => load("comparisons.json", ComparisonDocSchema);
export const getCertificationDocs = (): CertificationDoc[] => load("certification.json", CertificationDocSchema);

export const getLesson = (slug: string) => getLessons().find((l) => l.slug === slug);
export const getExercise = (id: string) => getExercises().find((e) => e.id === id);
export const getTopic = (slug: string) => getTopics().find((t) => t.slug === slug);
export const getFunctionDoc = (slug: string) => getFunctionDocs().find((f) => f.slug === slug);
export const getTaskDoc = (slug: string) => getTaskDocs().find((t) => t.slug === slug);
export const getShortcutDoc = (slug: string) => getShortcutDocs().find((s) => s.slug === slug);
export const getComparisonDoc = (slug: string) => getComparisonDocs().find((c) => c.slug === slug);
export const getCertificationDoc = (slug: string) => getCertificationDocs().find((c) => c.slug === slug);

export function getFunctionCategories(): string[] {
  return [...new Set(getFunctionDocs().map((f) => f.category))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function functionCategorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getFunctionDocsByCategory(category: string) {
  return getFunctionDocs()
    .filter((f) => f.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFunctionCategoryBySlug(slug: string): string | undefined {
  return getFunctionCategories().find((c) => functionCategorySlug(c) === slug);
}

/**
 * Exercise ids referenced by intermediate/advanced lessons — these make up
 * the Pro practice surface (beginner lessons and their exercises stay free).
 */
export function getProExerciseIds(): Set<string> {
  const ids = new Set<string>();
  for (const lesson of getLessons()) {
    if (lesson.level !== "beginner") {
      for (const id of lesson.exercises) ids.add(id);
    }
  }
  return ids;
}
