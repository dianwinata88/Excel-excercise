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
export function PracticeBoard({ exercises }: { exercises: Exercise[] }) {
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
        {visible.map((e) => (
          <div key={e.id} className="relative">
            {done.has(e.id) && (
              <span className="absolute -top-2 right-3 z-10 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                done
              </span>
            )}
            <ExerciseCard exercise={e} />
          </div>
        ))}
      </div>
    </div>
  );
}
