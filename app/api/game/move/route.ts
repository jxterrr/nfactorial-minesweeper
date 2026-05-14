import { NextResponse } from "next/server";
import { moveServerGame } from "@/lib/server/gameSessions";

export async function POST(req: Request) {
  let body: { sessionId?: string; type?: "reveal" | "flag"; row?: number; col?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { sessionId, type, row, col } = body;
  if (!sessionId || (type !== "reveal" && type !== "flag")) {
    return NextResponse.json({ error: "sessionId and type required" }, { status: 400 });
  }
  if (typeof row !== "number" || typeof col !== "number") {
    return NextResponse.json({ error: "row and col must be numbers" }, { status: 400 });
  }

  const state = moveServerGame(sessionId, { type, row, col });
  if (!state) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ state });
}
