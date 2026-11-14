"use client";

import { useMemo, useState } from "react";
import type { Exercise } from "../../../content/schema";
import { ExerciseCard } from "./ExerciseCard";
import { useProgress } from "./progress";

const TYPES = ["all", "formula", "shortcut", "mcq", "cell-select"] as const;
type TypeFilter = (typeof TYPES)[number];

/**
 * Free practice mode: filter exercises by type, see which are done,
 * run through them with the same engine as lessons.
 */
export function PracticeBoard({
  exercises,
  lockedIds,
}: {
  exercises: Exercise[];
  lockedIds?: Set<string>;
}) {
  const [filter, setFilter] = useState<TypeFilter>("all");
  const progress = useProgress();

  const done = useMemo(() => new Set(progress.completed), [progress]);
  const visible = exercises.filter((e) => filter === "all" || e.type === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              filter === t
                ? "bg-emerald-600 text-white"
                : "border border-zinc-300 text-zinc-600 hover:border-emerald-400 dark:border-zinc-700 dark:text-zinc-400"
            }`}
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
        <span className="ml-auto text-sm text-zinc-500">
          {progress.xp} XP · {progress.streakDays}-day streak · {done.size}/
          {exercises.length} done
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {visible.map((e) => {
          const locked = lockedIds?.has(e.id);
          return (
            <div key={e.id} className="relative">
              {done.has(e.id) && (
                <span className="absolute -top-2 right-3 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                  done
                </span>
              )}
              {locked ? (
                <a
                  href="/upgrade"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-4 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-950/20"
                >
                  <div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      PRO
                    </span>
                    <p className="mt-1 font-medium">
                      {e.prompt}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Unlock →
                  </span>
                </a>
              ) : (
                <ExerciseCard exercise={e} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
