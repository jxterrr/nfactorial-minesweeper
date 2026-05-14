import { randomUUID } from "crypto";
import type { GameState } from "@/types/game";
import { createGame, reveal, toggleFlag } from "@/lib/gameEngine";

type StoredSession = {
  state: GameState;
  expires: number;
};

const store = new Map<string, StoredSession>();
const TTL_MS = 60 * 60 * 1000;

function prune() {
  const now = Date.now();
  for (const [id, s] of Array.from(store.entries())) {
    if (s.expires < now) store.delete(id);
  }
}

export function startServerGame(input: {
  difficulty: GameState["difficulty"];
  mode: GameState["mode"];
  seed: string;
}): { sessionId: string; state: GameState } {
  prune();
  const state = createGame(input.difficulty, input.seed, input.mode);
  const sessionId = randomUUID();
  store.set(sessionId, { state, expires: Date.now() + TTL_MS });
  return { sessionId, state };
}

export function moveServerGame(
  sessionId: string,
  action: { type: "reveal" | "flag"; row: number; col: number },
): GameState | null {
  prune();
  const entry = store.get(sessionId);
  if (!entry || entry.expires < Date.now()) return null;

  const next =
    action.type === "flag"
      ? toggleFlag(entry.state, action.row, action.col)
      : reveal(entry.state, action.row, action.col);

  store.set(sessionId, { state: next, expires: Date.now() + TTL_MS });
  return next;
}
