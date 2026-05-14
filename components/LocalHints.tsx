"use client";

import { naiveSafeProbability } from "@/lib/probability";
import type { GameState } from "@/types/game";

/** Free on-device hint using global mine density (no APIs). */
export function LocalHints({ state }: { state: GameState }) {
  const safe = naiveSafeProbability(state);
  const pct = Math.round(safe * 100);

  return (
    <div className="space-y-2 rounded-lg border border-border bg-secondary/20 p-4">
      <h2 className="text-sm font-semibold">Hints</h2>
      <p className="text-xs text-foreground/75">
        Very rough estimate that a random unrevealed cell is safe (from remaining mines vs hidden cells):
        about <span className="font-mono font-medium text-foreground">{pct}%</span>. Use real logic on the
        board for actual moves.
      </p>
      <p className="text-xs text-foreground/50">Runs only in your browser — no paid services.</p>
    </div>
  );
}
