import { GameBoard } from "@/components/GameBoard";
import type { Difficulty, GameMode } from "@/types/game";

function parseDifficulty(v: string | undefined): Difficulty {
  if (v === "medium" || v === "hard") return v;
  return "easy";
}

export default function PlayPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const modeParam = typeof searchParams.mode === "string" ? searchParams.mode : undefined;
  const mode: GameMode = modeParam === "daily" ? "daily" : "practice";
  const diffParam = typeof searchParams.difficulty === "string" ? searchParams.difficulty : undefined;
  const difficulty = parseDifficulty(diffParam);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Play</h1>
        <p className="mt-1 text-sm text-foreground/65">
          Left click reveal · right click flag · shift+click a revealed number to chord.
        </p>
      </div>
      <GameBoard mode={mode} difficulty={difficulty} />
    </div>
  );
}
