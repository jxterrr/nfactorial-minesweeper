"use client";

import { useEffect, useState } from "react";

export type LeaderboardEntry = {
  id: string;
  user_id: string | null;
  city: string | null;
  time_seconds: number;
  difficulty: string;
  created_at: string;
};

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/leaderboard");
      const data = (await res.json()) as { entries?: LeaderboardEntry[] };
      if (!cancelled) setEntries(data.entries ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!entries.length) {
    return (
      <p className="text-sm text-foreground/60">
        No scores yet. Win a game to post a time (requires Supabase for persistence).
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-secondary/30 text-xs uppercase text-foreground/60">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">City</th>
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={e.id} className="border-b border-border/60 last:border-0">
              <td className="px-3 py-2 tabular-nums text-foreground/50">{i + 1}</td>
              <td className="px-3 py-2">{e.city ?? "—"}</td>
              <td className="px-3 py-2 font-mono tabular-nums">{e.time_seconds}s</td>
              <td className="px-3 py-2 capitalize">{e.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
