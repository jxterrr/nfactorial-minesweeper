import { Leaderboard } from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-sm text-foreground/65">
          Global rankings by time. City column uses the <code>x-vercel-ip-city</code> header on score submit.
        </p>
      </div>
      <Leaderboard />
    </div>
  );
}
