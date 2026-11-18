"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Exercise } from "../../../content/schema";
import { ExerciseCard } from "./ExerciseCard";
import { useProgress } from "./progress";

type Props = {
  exercises: Exercise[];
  /** Optional next lesson shown as the primary CTA on the completion screen. */
  nextLesson?: { href: string; title: string } | null;
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-emerald-400";

function TrophyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mx-auto h-12 w-12 text-amber-500"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 3h14v2h3v3a5 5 0 0 1-5 5h-.42A6 6 0 0 1 13 16.92V19h4v2H7v-2h4v-2.08A6 6 0 0 1 7.42 13H7a5 5 0 0 1-5-5V5h3V3Zm13 4v1a3 3 0 0 0 3-3V6h-3Zm-14 0H4v1a3 3 0 0 0 3 3V7Z" />
    </svg>
  );
}

/**
 * Step-through lesson player: one exercise at a time, progress bar,
 * XP earned per correct answer, completion summary at the end.
 */
export function LessonPlayer({ exercises, nextLesson }: Props) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(() => exercises.map(() => false));
  const [finished, setFinished] = useState(false);
  const progress = useProgress();
  const nextRef = useRef<HTMLButtonElement>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);

  const total = exercises.length;
  const current = exercises[index];
  const solvedCount = solved.filter(Boolean).length;
  const xpEarned = exercises.reduce((sum, e, i) => sum + (solved[i] ? e.xp : 0), 0);

  // Move focus to the primary action once the current exercise is solved,
  // and to the completion heading when the lesson finishes.
  useEffect(() => {
    if (finished) doneHeadingRef.current?.focus();
    else if (solved[index]) nextRef.current?.focus();
  }, [finished, solved, index]);

  function advance() {
    if (index + 1 >= total) setFinished(true);
    else setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setSolved(exercises.map(() => false));
    setFinished(false);
  }

  if (finished) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
        <TrophyIcon />
        <h2
          ref={doneHeadingRef}
          tabIndex={-1}
          className="mt-2 text-2xl font-bold outline-none"
        >
          Lesson complete!
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You answered {solvedCount} of {total} exercises and earned{" "}
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {xpEarned} XP
          </span>
          .
        </p>
        <dl className="mx-auto mt-4 flex max-w-sm justify-center gap-6 text-sm">
          <div>
            <dt className="text-zinc-500">Lesson XP</dt>
            <dd className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {xpEarned}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Total XP</dt>
            <dd className="text-lg font-bold">{progress.xp}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Streak</dt>
            <dd className="text-lg font-bold">
              {progress.streakDays} {progress.streakDays === 1 ? "day" : "days"}
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {nextLesson ? (
            <Link
              href={nextLesson.href}
              className={`min-h-11 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700 ${FOCUS_RING}`}
            >
              Next: {nextLesson.title} →
            </Link>
          ) : null}
          <Link
            href="/practice"
            className={`min-h-11 rounded-lg border border-zinc-300 px-5 py-2.5 font-semibold hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900 ${FOCUS_RING}`}
          >
            Practice more
          </Link>
          <button
            type="button"
            onClick={restart}
            className={`min-h-11 rounded-lg border border-zinc-300 px-5 py-2.5 font-semibold hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900 ${FOCUS_RING}`}
          >
            Replay lesson
          </button>
          <Link
            href="/learn"
            className={`min-h-11 rounded-lg px-5 py-2.5 font-semibold text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400 ${FOCUS_RING}`}
          >
            Back to track
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress: position, per-exercise dots, running XP */}
      <div>
        <div className="flex items-center justify-between gap-2 text-sm text-zinc-500">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Exercise {index + 1} of {total}
          </span>
          <span className="flex items-center gap-2">
            <span
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              aria-label={`${xpEarned} XP earned so far`}
            >
              {xpEarned} XP
            </span>
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuenow={index + 1}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuetext={`Exercise ${index + 1} of ${total}`}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <ol className="mt-2 flex items-center gap-1.5" aria-hidden="true">
          {exercises.map((e, i) => (
            <li
              key={e.id}
              className={`h-2 flex-1 rounded-full ${
                solved[i]
                  ? "bg-emerald-500"
                  : i === index
                    ? "bg-emerald-300 ring-1 ring-emerald-500 dark:bg-emerald-700"
                    : "bg-zinc-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </ol>
      </div>

      {current ? (
        <ExerciseCard
          key={current.id}
          exercise={current}
          standalone={false}
          onResult={(correct) => {
            if (correct) {
              setSolved((s) => {
                const next = [...s];
                next[index] = true;
                return next;
              });
            }
          }}
        />
      ) : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className={`min-h-11 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-40 ${FOCUS_RING} dark:border-zinc-700 dark:hover:bg-zinc-900`}
        >
          ← Back
        </button>
        {solved[index] ? (
          <button
            type="button"
            ref={nextRef}
            onClick={advance}
            className={`min-h-11 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 ${FOCUS_RING}`}
          >
            {index + 1 >= total ? "Finish" : "Next →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={advance}
            className={`min-h-11 rounded-lg px-4 py-2 text-sm text-zinc-400 underline hover:text-zinc-600 ${FOCUS_RING} dark:hover:text-zinc-300`}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
