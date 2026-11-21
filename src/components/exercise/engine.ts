import { HyperFormula } from "hyperformula";
import type { Exercise } from "../../../content/schema";

/**
 * Client-side exercise engine helpers.
 * Formula answers are evaluated with HyperFormula — real Excel semantics,
 * not string comparison.
 */

// ---- A1 helpers -------------------------------------------------------------

export type CellCoord = { row: number; col: number }; // 0-based

export function parseA1(ref: string): CellCoord | null {
  const m = /^([A-Za-z]+)([0-9]+)$/.exec(ref.trim());
  if (!m) return null;
  let col = 0;
  for (const ch of m[1].toUpperCase()) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { row: Number(m[2]) - 1, col: col - 1 };
}

export function toA1({ row, col }: CellCoord): string {
  let c = col + 1;
  let letters = "";
  while (c > 0) {
    letters = String.fromCharCode(65 + ((c - 1) % 26)) + letters;
    c = Math.floor((c - 1) / 26);
  }
  return `${letters}${row + 1}`;
}

/** Bounding box covering every populated cell plus answerCell, for grid layout. */
export function gridBounds(grid: Record<string, string | number>, answerCell?: string) {
  const refs = [...Object.keys(grid), ...(answerCell ? [answerCell] : [])];
  let maxRow = 0;
  let maxCol = 0;
  for (const ref of refs) {
    const c = parseA1(ref);
    if (!c) continue;
    maxRow = Math.max(maxRow, c.row);
    maxCol = Math.max(maxCol, c.col);
  }
  return { rows: Math.max(maxRow + 1, 1), cols: Math.max(maxCol + 1, 1) };
}

/** Convert the sparse grid record into the 2D array HyperFormula expects. */
function gridToArray(grid: Record<string, string | number>, extra?: { ref: string; formula: string }) {
  const { rows, cols } = gridBounds(grid, extra?.ref);
  const data: (string | number | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null),
  );
  for (const [ref, value] of Object.entries(grid)) {
    const c = parseA1(ref);
    if (c) data[c.row][c.col] = value;
  }
  if (extra) {
    const c = parseA1(extra.ref);
    if (c) data[c.row][c.col] = extra.formula;
  }
  return data;
}

// ---- Validation -------------------------------------------------------------

export type CheckResult =
  | { ok: true }
  | { ok: false; message: string };

function valuesEqual(actual: unknown, expected: string | number | boolean): boolean {
  if (typeof expected === "number" && typeof actual === "number") {
    return Math.abs(actual - expected) < 1e-9;
  }
  if (typeof expected === "boolean") return actual === expected;
  if (typeof expected === "string") {
    return String(actual).trim().toLowerCase() === expected.trim().toLowerCase();
  }
  return actual === expected;
}

/** Does the entered formula call at least one of the required functions? */
function usesAcceptedFn(formula: string, acceptFns: string[]): boolean {
  if (acceptFns.length === 0) return true;
  return acceptFns.some((fn) => new RegExp(`\\b${fn}\\s*\\(`, "i").test(formula));
}

/**
 * Evaluate a formula exercise: place the user's formula into answerCell on top
 * of the exercise grid, let HyperFormula compute it, compare to expectValue.
 */
export function checkFormula(exercise: Exercise, input: string): CheckResult {
  const answerCell = exercise.answerCell;
  const formula = input.trim().startsWith("=") ? input.trim() : `=${input.trim()}`;
  if (!answerCell) return { ok: false, message: "This exercise has no answer cell." };
  if (formula === "=") return { ok: false, message: "Type a formula first." };
  if (!usesAcceptedFn(formula, exercise.acceptFns)) {
    return {
      ok: false,
      message: `Your answer should use ${exercise.acceptFns.join(" or ")}.`,
    };
  }
  const hf = HyperFormula.buildFromArray(gridToArray(exercise.grid, { ref: answerCell, formula }), {
    licenseKey: "gpl-v3",
  });
  const coord = parseA1(answerCell)!;
  const value = hf.getCellValue({ sheet: 0, row: coord.row, col: coord.col });
  if (value instanceof Object && "value" in value && String((value as { value: unknown }).value).startsWith("#")) {
    const err = value as { value: string; message?: string };
    return { ok: false, message: `${err.value}${err.message ? ` — ${err.message}` : ""}` };
  }
  if (exercise.expectValue === undefined) {
    return value === null || value === undefined
      ? { ok: false, message: "The formula produced no value." }
      : { ok: true };
  }
  return valuesEqual(value, exercise.expectValue)
    ? { ok: true }
    : { ok: false, message: `Got ${JSON.stringify(value)} — check your range or condition.` };
}

/** Normalize a KeyboardEvent to "ctrl+b"-style combos; meta (Cmd) counts as ctrl. */
export function eventToCombo(e: KeyboardEvent | React.KeyboardEvent): string | null {
  const key = e.key.toLowerCase();
  if (["control", "shift", "alt", "meta"].includes(key)) return null;
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push("ctrl");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");
  parts.push(key === " " ? "space" : key);
  return parts.join("+");
}

export function checkShortcut(exercise: Exercise, combo: string): CheckResult {
  const want = exercise.keys?.toLowerCase();
  if (!want) return { ok: false, message: "This exercise has no target shortcut." };
  return combo === want
    ? { ok: true }
    : { ok: false, message: `Pressed ${combo.replace("+", " + ").toUpperCase()} — try again.` };
}

export function checkCellSelect(exercise: Exercise, cellRef: string): CheckResult {
  if (!exercise.answerCell) return { ok: false, message: "This exercise has no target cell." };
  return cellRef.toUpperCase() === exercise.answerCell.toUpperCase()
    ? { ok: true }
    : { ok: false, message: `${cellRef} isn't the right cell.` };
}

export function checkMcq(exercise: Exercise, index: number): CheckResult {
  if (exercise.correctOption === undefined) {
    return { ok: false, message: "This exercise has no correct option." };
  }
  return index === exercise.correctOption
    ? { ok: true }
    : { ok: false, message: "Not quite — look at the syntax again." };
}
