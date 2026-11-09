"use client";

import type { Exercise } from "../../../content/schema";
import { gridBounds, toA1 } from "./engine";

type Props = {
  exercise: Exercise;
  /** Currently selected cell ref (cell-select exercises + answer highlight). */
  selected?: string | null;
  onSelect?: (ref: string) => void;
  /** Live value shown in answerCell after a correct formula, if computed. */
  answerDisplay?: string;
};

function colLabel(col: number): string {
  return toA1({ row: 0, col }).replace(/[0-9]/g, "");
}

/**
 * Mini spreadsheet rendered from the exercise's sparse grid.
 * Cells are clickable for cell-select exercises; otherwise inert.
 */
export function SpreadsheetGrid({ exercise, selected, onSelect, answerDisplay }: Props) {
  const { rows, cols } = gridBounds(exercise.grid, exercise.answerCell);
  const cells = new Map<string, string | number>();
  for (const [ref, v] of Object.entries(exercise.grid)) cells.set(ref.toUpperCase(), v);
  const answer = exercise.answerCell?.toUpperCase();
  const interactive = exercise.type === "cell-select";

  return (
    <div className="overflow-x-auto">
      <table
        className="border-collapse text-sm"
        aria-label="Exercise spreadsheet"
      >
        <thead>
          <tr>
            <th className="w-8 border border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
            {Array.from({ length: cols }, (_, c) => (
              <th
                key={c}
                className="min-w-16 border border-zinc-300 bg-zinc-100 px-2 py-0.5 font-mono text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {colLabel(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              <th className="border border-zinc-300 bg-zinc-100 px-1 font-mono text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                {r + 1}
              </th>
              {Array.from({ length: cols }, (_, c) => {
                const ref = toA1({ row: r, col: c });
                const isAnswer = ref === answer;
                const isSelected = ref === selected?.toUpperCase();
                const raw = cells.get(ref);
                const shown =
                  isAnswer && answerDisplay !== undefined
                    ? answerDisplay
                    : raw === undefined
                      ? ""
                      : String(raw);
                const base =
                  "h-8 border border-zinc-300 px-2 text-left align-middle dark:border-zinc-700";
                const state = isSelected
                  ? "bg-emerald-100 ring-2 ring-inset ring-emerald-500 dark:bg-emerald-950"
                  : isAnswer && !interactive
                    ? "bg-emerald-50 dark:bg-emerald-950/40"
                    : "bg-white dark:bg-zinc-900";
                const cell = (
                  <span className="block truncate font-mono">{shown}</span>
                );
                return interactive ? (
                  <td key={ref} className={`${base} ${state} p-0`}>
                    <button
                      type="button"
                      onClick={() => onSelect?.(ref)}
                      aria-label={`Cell ${ref}`}
                      className="h-8 w-full px-2 text-left"
                    >
                      {cell}
                    </button>
                  </td>
                ) : (
                  <td key={ref} className={`${base} ${state}`}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
