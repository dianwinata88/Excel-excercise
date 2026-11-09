"use client";

import Link from "next/link";
import { useState } from "react";
import type { Exercise } from "../../../content/schema";
import { ExerciseCard } from "./ExerciseCard";
import { useProgress } from "./progress";

type Props = {
  exercises: Exercise[];
};

/**
 * Step-through lesson player: one exercise at a time, progress bar,
 * XP earned per correct answer, completion summary at the end.
 */
export function LessonPlayer({ exercises }: Props) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(() => exercises.map(() => false));
  const [finished, setFinished] = useState(false);
  const progress = useProgress();

  const total = exercises.length;
  const current = exercises[index];
  const solvedCount = solved.filter(Boolean).length;
  const xpEarned = exercises.reduce((sum, e, i) => sum + (solved[i] ? e.xp : 0), 0);

  function advance() {
    if (index + 1 >= total) setFinished(true);
    else setIndex((i) => i + 1);
  }

  if (finished) {
    return (
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-950/40">
        <h2 className="text-2xl font-bold">Lesson complete!</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          You answered {solvedCount} of {total} exercises and earned{" "}
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {xpEarned} XP
          </span>
          .
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Total: {progress.xp} XP · {progress.streakDays}-day streak ·{" "}
          {progress.completed.length} exercises done
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setSolved(exercises.map(() => false));
              setFinished(false);
            }}
            className="rounded-lg border border-zinc-300 px-5 py-2.5 font-semibold hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Replay lesson
          </button>
          <Link
            href="/learn"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
          >
            More lessons
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>
            Exercise {index + 1} of {total}
          </span>
          <span>{xpEarned} XP earned</span>
        </div>
        <div
          className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={total}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
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
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          ← Back
        </button>
        {solved[index] ? (
          <button
            type="button"
            onClick={advance}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {index + 1 >= total ? "Finish" : "Next →"}
          </button>
        ) : (
          <button
            type="button"
            onClick={advance}
            className="text-sm text-zinc-400 underline hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
