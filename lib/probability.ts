import type { GameState } from "@/types/game";

/** Count hidden cells (not revealed, not flagged). */
export function countHiddenCells(state: GameState): number {
  let n = 0;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const cell = state.cells[r]![c]!;
      if (!cell.revealed && !cell.flagged) n++;
    }
  }
  return n;
}

/**
 * Upper bound on P(safe) for an arbitrary hidden cell:
 * 1 - (estimated remaining mines / hidden cells).
 * Flags are treated as correct mines (optimistic for UX hints).
 */
export function naiveSafeProbability(state: GameState): number {
  const hidden = countHiddenCells(state);
  if (hidden === 0) return 1;
  let flagged = 0;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (state.cells[r]![c]!.flagged) flagged++;
    }
  }
  const remaining = Math.max(0, state.mineCount - flagged);
  const pMine = Math.min(1, remaining / hidden);
  const safe = 1 - pMine;
  return Math.round(Math.max(0.01, Math.min(0.99, safe)) * 100) / 100;
}
