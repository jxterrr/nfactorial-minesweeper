import Link from "next/link";
import { GameBoard } from "@/components/GameBoard";
import type { Difficulty, GameMode } from "@/types/game";

function parseDifficulty(v: string | undefined): Difficulty {
  if (v === "beginner" || v === "medium" || v === "hard") return v;
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
          ЛКМ — открыть · ПКМ — флаг · Shift+ЛКМ по открытой цифре — chord (открыть соседей, если флаги
          совпали с числом).
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            href="/play?difficulty=beginner"
            className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Новичок 9×9
          </Link>
          <Link href="/play?difficulty=easy" className="rounded-md border border-border px-3 py-1.5 hover:bg-accent">
            Easy
          </Link>
          <Link href="/play?difficulty=medium" className="rounded-md border border-border px-3 py-1.5 hover:bg-accent">
            Medium
          </Link>
          <Link href="/play?mode=daily" className="rounded-md border border-border px-3 py-1.5 hover:bg-accent">
            Daily (сложнее)
          </Link>
        </div>
        <details className="mt-4 rounded-md border border-border bg-secondary/20 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium">Как выиграть (коротко)</summary>
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/75">
            <li>Цифра = сколько мин в 8 соседних клетках.</li>
            <li>Сначала открывай «очевидные» — где цифра совпадает с числом скрытых соседей (там мины).</li>
            <li>Ставь флаги ПКМ, потом chord (Shift+ЛКМ по цифре), когда флагов ровно столько, сколько пишет
              цифра.</li>
            <li>
              <strong>Daily</strong> — поле 16×16 как у всех; для первой победы начни с{' '}
              <strong>Новичок</strong> или Easy.
            </li>
          </ul>
        </details>
      </div>
      <GameBoard mode={mode} difficulty={difficulty} />
    </div>
  );
}
