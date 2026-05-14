"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CellView } from "@/components/Cell";
import { Timer } from "@/components/Timer";
import { LocalHints } from "@/components/LocalHints";
import { Button } from "@/components/ui/button";
import { chordReveal, createGame, reveal, toggleFlag } from "@/lib/gameEngine";
import type { Difficulty, GameMode, GameState } from "@/types/game";

type Props = {
  mode: GameMode;
  difficulty: Difficulty;
};

function hasPlayerInteracted(s: GameState) {
  for (let r = 0; r < s.rows; r++) {
    for (let c = 0; c < s.cols; c++) {
      const cell = s.cells[r]![c]!;
      if (cell.revealed || cell.flagged) return true;
    }
  }
  return false;
}

export function GameBoard({ mode, difficulty }: Props) {
  const [resetKey, setResetKey] = useState(0);
  const [daily, setDaily] = useState<{ seed: string; date: string } | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [seconds, setSeconds] = useState(0);
  const victorySent = useRef(false);
  const timerStart = useRef<number | null>(null);

  const practiceSeed = useMemo(() => {
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Math.random()}`;
    return `practice-${resetKey}-${id}`;
  }, [resetKey]);

  useEffect(() => {
    if (mode !== "daily") return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/daily-seed");
      const data = (await res.json()) as { seed?: string; date?: string };
      if (!cancelled && data.seed && data.date) {
        setDaily({ seed: data.seed, date: data.date });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, resetKey]);

  useEffect(() => {
    const seed = mode === "daily" ? daily?.seed : practiceSeed;
    if (!seed) return;
    setState(createGame(difficulty, seed, mode));
    victorySent.current = false;
    setSeconds(0);
    timerStart.current = null;
  }, [mode, difficulty, daily?.seed, practiceSeed, resetKey]);

  const activeTimer = Boolean(
    state && state.status === "playing" && hasPlayerInteracted(state),
  );

  useEffect(() => {
    if (!activeTimer || !state) return;
    if (timerStart.current === null) timerStart.current = Date.now();
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - timerStart.current!) / 1000));
    }, 200);
    return () => clearInterval(id);
  }, [activeTimer, state]);

  useEffect(() => {
    if (!state || state.status !== "won" || victorySent.current) return;
    victorySent.current = true;
    void fetch("/api/leaderboard", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        time_seconds: seconds,
        difficulty: state.difficulty,
        user_id: null,
      }),
    });
  }, [state, seconds]);

  const onReveal = useCallback((row: number, col: number) => {
    setState((prev) => (prev ? reveal(prev, row, col) : prev));
  }, []);

  const onFlag = useCallback((row: number, col: number) => {
    setState((prev) => (prev ? toggleFlag(prev, row, col) : prev));
  }, []);

  const onChord = useCallback((row: number, col: number) => {
    setState((prev) => (prev ? chordReveal(prev, row, col) : prev));
  }, []);

  if (mode === "daily" && !daily) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-foreground/70">
        Loading today&apos;s challenge…
      </div>
    );
  }

  if (!state) return null;

  const gameOver = state.status !== "playing";
  const compact = state.cols >= 16;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-foreground/70">
            <span className="mr-3 capitalize">
              {state.mode} · {state.difficulty}
            </span>
            {mode === "daily" && daily ? (
              <span className="text-foreground/50">UTC {daily.date}</span>
            ) : null}
          </div>
          <Timer seconds={seconds} />
        </div>

        <div
          className="inline-grid gap-0.5 rounded-lg border border-border bg-background p-2 shadow-sm"
          style={{
            gridTemplateColumns: `repeat(${state.cols}, minmax(0, 1fr))`,
          }}
        >
          {state.cells.map((row, r) =>
            row.map((cell, c) => (
              <CellView
                key={`${r}-${c}`}
                cell={cell}
                gameOver={gameOver}
                compact={compact}
                onReveal={() => {
                  if (gameOver) return;
                  onReveal(r, c);
                }}
                onFlag={() => {
                  if (gameOver) return;
                  onFlag(r, c);
                }}
                onChord={
                  cell.revealed && cell.number > 0 ? () => onChord(r, c) : undefined
                }
              />
            )),
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setResetKey((k) => k + 1)}>
            New board
          </Button>
          {state.status === "won" ? (
            <span className="self-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Cleared
            </span>
          ) : null}
          {state.status === "lost" ? (
            <span className="self-center text-sm font-medium text-red-600 dark:text-red-400">
              Hit a mine
            </span>
          ) : null}
        </div>

        {mode === "daily" ? (
          <p className="text-xs text-foreground/50">
            Signed-in daily attempts (one per day) use Supabase <code>game_sessions</code> — wire auth to
            enforce.
          </p>
        ) : null}
      </div>

      <aside className="lg:w-80">
        <LocalHints state={state} />
      </aside>
    </div>
  );
}
