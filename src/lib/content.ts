import path from "node:path";
import { readFileSync } from "node:fs";
import {
  ComparisonDocSchema,
  ExerciseSchema,
  FunctionDocSchema,
  LessonSchema,
  ShortcutDocSchema,
  TaskDocSchema,
  TopicSchema,
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

export const getLesson = (slug: string) => getLessons().find((l) => l.slug === slug);
export const getExercise = (id: string) => getExercises().find((e) => e.id === id);
export const getTopic = (slug: string) => getTopics().find((t) => t.slug === slug);
export const getFunctionDoc = (slug: string) => getFunctionDocs().find((f) => f.slug === slug);
export const getTaskDoc = (slug: string) => getTaskDocs().find((t) => t.slug === slug);
export const getShortcutDoc = (slug: string) => getShortcutDocs().find((s) => s.slug === slug);
export const getComparisonDoc = (slug: string) => getComparisonDocs().find((c) => c.slug === slug);
