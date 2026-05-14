import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-xl space-y-8 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">MineMind</h1>
        <p className="text-balance text-sm text-foreground/70 sm:text-base">
          A probabilistic thinking trainer: classic Minesweeper, a shared daily board, and on-device hints
          — no paid APIs required.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <Button asChild size="lg">
          <Link href="/play?difficulty=beginner">Сначала: новичок</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/play">Обычная игра</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/play?mode=daily">Daily</Link>
        </Button>
      </div>
    </section>
  );
}
