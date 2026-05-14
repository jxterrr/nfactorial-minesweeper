"use client";

import { cn } from "@/lib/utils";
import type { Cell } from "@/types/game";

type Props = {
  cell: Cell;
  gameOver: boolean;
  compact?: boolean;
  onReveal: () => void;
  onFlag: () => void;
  onChord?: () => void;
};

export function CellView({ cell, gameOver, compact, onReveal, onFlag, onChord }: Props) {
  const showMine = cell.mine && (cell.revealed || gameOver);
  const showNumber = cell.revealed && !cell.mine && cell.number > 0;

  const digitClass =
    cell.number === 1
      ? "text-blue-600 dark:text-blue-400"
      : cell.number === 2
        ? "text-emerald-600 dark:text-emerald-400"
        : cell.number === 3
          ? "text-red-600 dark:text-red-400"
          : cell.number === 4
            ? "text-indigo-700 dark:text-indigo-300"
            : "text-amber-700 dark:text-amber-300";

  return (
    <button
      type="button"
      aria-label={cell.revealed ? (cell.mine ? "Mine" : `Number ${cell.number}`) : "Hidden cell"}
      className={cn(
        "flex select-none items-center justify-center rounded-sm border text-xs font-semibold transition-colors duration-100",
        compact ? "h-6 w-6 sm:h-7 sm:w-7" : "h-8 w-8 sm:h-9 sm:w-9",
        cell.revealed
          ? cell.mine
            ? "border-red-500/60 bg-red-500/20"
            : "border-border bg-secondary/40"
          : "border-border bg-primary/5 hover:bg-primary/10 active:scale-95",
        cell.flagged && !cell.revealed && "bg-amber-500/15",
      )}
      onClick={(e) => {
        if (e.shiftKey && cell.revealed && onChord) {
          onChord();
          return;
        }
        onReveal();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onFlag();
      }}
    >
      {cell.flagged && !cell.revealed ? (
        <span className="text-amber-600">▶</span>
      ) : showMine ? (
        <span className="text-lg leading-none">●</span>
      ) : cell.revealed && !cell.mine && cell.number === 0 ? (
        <span className="opacity-0">0</span>
      ) : showNumber ? (
        <span className={digitClass}>{cell.number}</span>
      ) : (
        <span className="opacity-25">·</span>
      )}
    </button>
  );
}
