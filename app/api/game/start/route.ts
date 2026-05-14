import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { startServerGame } from "@/lib/server/gameSessions";
import type { Difficulty, GameMode } from "@/types/game";

export async function POST(req: Request) {
  let body: { difficulty?: Difficulty; mode?: GameMode; seed?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const difficulty = body.difficulty ?? "easy";
  const mode = body.mode ?? "practice";
  const seed =
    body.seed ??
    randomUUID();

  if (
    difficulty !== "beginner" &&
    difficulty !== "easy" &&
    difficulty !== "medium" &&
    difficulty !== "hard"
  ) {
    return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
  }
  if (mode !== "practice" && mode !== "daily") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const { sessionId, state } = startServerGame({ difficulty, mode, seed });
  return NextResponse.json({ sessionId, state });
}
