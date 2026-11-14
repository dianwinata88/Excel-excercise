"use client";

import { useEffect, useRef, useState } from "react";
import type { Exercise } from "../../../content/schema";
import {
  checkCellSelect,
  checkFormula,
  checkMcq,
  checkShortcut,
  eventToCombo,
} from "./engine";
import { awardXp, useProgress } from "./progress";
import { SpreadsheetGrid } from "./SpreadsheetGrid";

type Status = "idle" | "wrong" | "correct";

type Props = {
  exercise: Exercise;
  /**
   * Lesson-player mode: report each submitted answer and let the parent
   * decide when to advance. In standalone mode (embed/practice) the card
   * shows its own XP toast and reset button.
   */
  onResult?: (correct: boolean) => void;
  standalone?: boolean;
};

export function ExerciseCard({ exercise, onResult, standalone = true }: Props) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [granted, setGranted] = useState(0);
  const progress = useProgress();
  const inputRef = useRef<HTMLInputElement>(null);
  const shortcutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exercise.type === "formula") inputRef.current?.focus();
    if (exercise.type === "shortcut") shortcutRef.current?.focus();
  }, [exercise.id, exercise.type]);

  function finish(result: { ok: boolean; message?: string }) {
    if (result.ok) {
      const { granted: g } = awardXp(exercise.id, exercise.xp);
      setGranted(g);
      setStatus("correct");
      setMessage(null);
      onResult?.(true);
    } else {
      setStatus("wrong");
      setMessage(result.message ?? "Try again.");
      onResult?.(false);
    }
  }

  /** Insert a clicked cell's A1 reference into the formula at the caret. */
  function insertRef(ref: string) {
    const el = inputRef.current;
    const start = el?.selectionStart ?? input.length;
    const end = el?.selectionEnd ?? input.length;
    setInput(input.slice(0, start) + ref + input.slice(end));
    setStatus("idle");
    setMessage(null);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + ref.length, start + ref.length);
    });
  }

  function submit() {
    if (exercise.type === "formula") finish(checkFormula(exercise, input));
    else if (exercise.type === "cell-select" && selected) {
      finish(checkCellSelect(exercise, selected));
    } else if (exercise.type === "mcq" && picked !== null) {
      finish(checkMcq(exercise, picked));
    }
  }

  function reset() {
    setInput("");
    setStatus("idle");
    setMessage(null);
    setSelected(null);
    setPicked(null);
    setGranted(0);
  }

  const done = status === "correct";
  const alreadyDone = progress.completed.includes(exercise.id);

  return (
    <section
      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
      data-exercise={exercise.id}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium">{exercise.prompt}</p>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {exercise.xp} XP
        </span>
      </div>

      {/* Formula bar above the sheet, like Excel's fx bar */}
      {exercise.type === "formula" && (
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor={`fx-${exercise.id}`} className="font-mono text-sm text-zinc-500">
            {exercise.answerCell} =
          </label>
          <input
            id={`fx-${exercise.id}`}
            ref={inputRef}
            value={input}
            disabled={done}
            onChange={(e) => {
              setInput(e.target.value);
              setStatus("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type a formula"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-emerald-900"
          />
        </div>
      )}

      <div className="mt-3">
        <SpreadsheetGrid
          exercise={exercise}
          selected={selected}
          onSelect={(ref) => {
            if (done) return;
            if (exercise.type === "formula") {
              insertRef(ref);
              return;
            }
            setSelected(ref);
            setStatus("idle");
            setMessage(null);
          }}
        />
      </div>

      {exercise.type === "shortcut" && (
        <div
          ref={shortcutRef}
          tabIndex={0}
          role="button"
          aria-label="Shortcut capture area — press the key combination"
          onKeyDown={(e) => {
            if (done) return;
            const combo = eventToCombo(e);
            if (!combo) return;
            e.preventDefault();
            finish(checkShortcut(exercise, combo));
          }}
          className="mt-3 rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:focus:ring-emerald-900"
        >
          {done ? "Done!" : "Click here, then press the key combination"}
        </div>
      )}

      {exercise.type === "cell-select" && (
        <p className="mt-3 text-sm text-zinc-500">
          {done ? `Selected ${selected}` : "Click a cell in the grid above to answer."}
        </p>
      )}

      {exercise.type === "mcq" && (
        <ul className="mt-3 space-y-2">
          {(exercise.options ?? []).map((opt, i) => {
            const isPicked = picked === i;
            const good = done && i === exercise.correctOption;
            const bad = isPicked && status === "wrong";
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={done}
                  onClick={() => {
                    setPicked(i);
                    setStatus("idle");
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left font-mono text-sm disabled:opacity-70 ${
                    good
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50"
                      : bad
                        ? "border-red-400 bg-red-50 dark:bg-red-950/40"
                        : isPicked
                          ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30"
                          : "border-zinc-300 hover:border-emerald-300 dark:border-zinc-700"
                  }`}
                >
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Feedback + actions */}
      <div className="mt-3 flex items-center gap-3">
        {!done && exercise.type !== "shortcut" && (
          <button
            type="button"
            onClick={submit}
            disabled={
              (exercise.type === "formula" && !input.trim()) ||
              (exercise.type === "cell-select" && !selected) ||
              (exercise.type === "mcq" && picked === null)
            }
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check
          </button>
        )}
        {status === "wrong" && message && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {message}
          </p>
        )}
        {done && (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400" role="status">
            Correct{granted > 0 ? ` — +${granted} XP` : alreadyDone ? " (already completed)" : "!"}
          </p>
        )}
        {done && standalone && (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Try again
          </button>
        )}
      </div>
    </section>
  );
}
