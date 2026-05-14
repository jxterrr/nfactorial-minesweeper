export type Difficulty = "beginner" | "easy" | "medium" | "hard";
export type GameMode = "practice" | "daily";
export type GameStatus = "playing" | "won" | "lost";

export type Cell = {
  revealed: boolean;
  flagged: boolean;
  mine: boolean;
  number: number;
};

export type GameState = {
  difficulty: Difficulty;
  mode: GameMode;
  seed: string;
  rows: number;
  cols: number;
  mineCount: number;
  cells: Cell[][];
  status: GameStatus;
  minesPlaced: boolean;
};

export type GameResult = "win" | "loss" | "abandoned";

export type PublicCell = {
  revealed: boolean;
  flagged: boolean;
  mine?: boolean;
  number?: number;
};
