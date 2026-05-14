import { hashSeed, mulberry32 } from "@/lib/seed";
import type { Cell, Difficulty, GameMode, GameState, GameStatus } from "@/types/game";

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { rows: number; cols: number; mines: number }
> = {
  /** 9×9, few mines — чтобы быстро научиться побеждать */
  beginner: { rows: 9, cols: 9, mines: 6 },
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

function cloneCells(cells: Cell[][]): Cell[][] {
  return cells.map((row) => row.map((c) => ({ ...c })));
}

function makeEmptyCells(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      revealed: false,
      flagged: false,
      mine: false,
      number: 0,
    })),
  );
}

function neighbors(r: number, c: number, rows: number, cols: number) {
  const out: { r: number; c: number }[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push({ r: nr, c: nc });
    }
  }
  return out;
}

function pickMinePositions(
  rng: () => number,
  rows: number,
  cols: number,
  count: number,
  exclude: Set<number>,
): Set<number> {
  const pool: number[] = [];
  for (let i = 0; i < rows * cols; i++) {
    if (!exclude.has(i)) pool.push(i);
  }
  if (count > pool.length) {
    throw new Error("Not enough cells to place mines");
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return new Set(pool.slice(0, count));
}

function computeNumbers(cells: Cell[][], rows: number, cols: number) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r]![c]!.mine) {
        cells[r]![c]!.number = 0;
        continue;
      }
      let n = 0;
      for (const { r: nr, c: nc } of neighbors(r, c, rows, cols)) {
        if (cells[nr]![nc]!.mine) n++;
      }
      cells[r]![c]!.number = n;
    }
  }
}

function placeMines(
  cells: Cell[][],
  rows: number,
  cols: number,
  mineCount: number,
  rng: () => number,
  exclude: Set<number>,
) {
  const positions = pickMinePositions(rng, rows, cols, mineCount, exclude);
  for (const p of Array.from(positions)) {
    const r = Math.floor(p / cols);
    const c = p % cols;
    cells[r]![c]!.mine = true;
  }
  computeNumbers(cells, rows, cols);
}

function revealAllMines(cells: Cell[][], rows: number, cols: number) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r]![c]!.mine) cells[r]![c]!.revealed = true;
    }
  }
}

function isWin(cells: Cell[][], rows: number, cols: number) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r]![c]!;
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
}

function expandReveal(cells: Cell[][], rows: number, cols: number, sr: number, sc: number) {
  const stack: [number, number][] = [[sr, sc]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    const cell = cells[r]![c]!;
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.number === 0) {
      for (const { r: nr, c: nc } of neighbors(r, c, rows, cols)) {
        if (!cells[nr]![nc]!.revealed && !cells[nr]![nc]!.flagged) {
          stack.push([nr, nc]);
        }
      }
    }
  }
}

/** Excel-style column letters (1-based internally while building). */
export function cellRef(row: number, col: number): string {
  let n = col + 1;
  let letters = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    letters = String.fromCharCode(65 + m) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return `${letters}${row + 1}`;
}

export function parseCellRef(ref: string): { row: number; col: number } | null {
  const m = ref.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  const letters = m[1]!;
  const rowNum = Number(m[2]!);
  if (!rowNum) return null;
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i)! - 64);
  }
  return { row: rowNum - 1, col: col - 1 };
}

export function createGame(
  difficulty: Difficulty,
  seed: string,
  mode: GameMode,
): GameState {
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty];
  const cells = makeEmptyCells(rows, cols);
  const rng = mulberry32(hashSeed(seed));

  if (mode === "daily") {
    placeMines(cells, rows, cols, mines, rng, new Set());
    return {
      difficulty,
      mode,
      seed,
      rows,
      cols,
      mineCount: mines,
      cells,
      status: "playing",
      minesPlaced: true,
    };
  }

  return {
    difficulty,
    mode,
    seed,
    rows,
    cols,
    mineCount: mines,
    cells,
    status: "playing",
    minesPlaced: false,
  };
}

export function toggleFlag(state: GameState, row: number, col: number): GameState {
  if (state.status !== "playing") return state;
  const cell = state.cells[row]?.[col];
  if (!cell || cell.revealed) return state;

  const cells = cloneCells(state.cells);
  const target = cells[row]![col]!;
  target.flagged = !target.flagged;
  return { ...state, cells };
}

export function reveal(state: GameState, row: number, col: number): GameState {
  if (state.status !== "playing") return state;
  const cell = state.cells[row]?.[col];
  if (!cell || cell.flagged || cell.revealed) return state;

  const cells = cloneCells(state.cells);
  const { rows, cols, mineCount, minesPlaced, mode, seed } = state;
  const rng = mulberry32(hashSeed(seed));

  if (!minesPlaced) {
    const exclude = new Set<number>();
    const first = row * cols + col;
    exclude.add(first);
    for (const { r: nr, c: nc } of neighbors(row, col, rows, cols)) {
      exclude.add(nr * cols + nc);
    }
    placeMines(cells, rows, cols, mineCount, rng, exclude);
  }

  const hit = cells[row]![col]!;
  if (hit.mine) {
    hit.revealed = true;
    revealAllMines(cells, rows, cols);
    return { ...state, cells, status: "lost" as GameStatus, minesPlaced: true };
  }

  expandReveal(cells, rows, cols, row, col);

  let status: GameStatus = "playing";
  if (isWin(cells, rows, cols)) status = "won";

  return {
    ...state,
    cells,
    status,
    minesPlaced: true,
    mode,
  };
}

/** Chord: if revealed number matches adjacent flags, reveal other neighbors. */
export function chordReveal(state: GameState, row: number, col: number): GameState {
  if (state.status !== "playing") return state;
  const center = state.cells[row]?.[col];
  if (!center || !center.revealed || center.mine || center.number === 0) return state;

  const { rows, cols } = state;
  const neigh = neighbors(row, col, rows, cols);
  let flags = 0;
  for (const { r, c } of neigh) {
    if (state.cells[r]![c]!.flagged) flags++;
  }
  if (flags !== center.number) return state;

  let next: GameState = { ...state, cells: cloneCells(state.cells) };
  for (const { r, c } of neigh) {
    const ch = next.cells[r]![c]!;
    if (ch.revealed || ch.flagged) continue;
    next = reveal(next, r, c);
    if (next.status === "lost") break;
  }
  return next;
}

export function countRemainingMines(state: GameState): number {
  let flags = 0;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      if (state.cells[r]![c]!.flagged) flags++;
    }
  }
  return state.mineCount - flags;
}
