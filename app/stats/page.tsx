export default function StatsPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
      <p className="text-sm text-foreground/70">
        After Supabase Auth is wired, this view can aggregate <code>game_sessions</code>: win rate, average
        time, best time, last 30 games, and difficulty breakdown using the queries from the product spec.
      </p>
      <ul className="list-inside list-disc space-y-2 text-sm text-foreground/60">
        <li>
          <code>COUNT</code> wins / <code>COUNT</code> total
        </li>
        <li>
          <code>AVG(time_seconds)</code>, <code>MIN(time_seconds)</code>
        </li>
      </ul>
    </div>
  );
}
