type Props = {
  seconds: number;
};

export function Timer({ seconds }: Props) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div
      className="rounded-md border border-border bg-secondary/30 px-3 py-1 font-mono text-sm tabular-nums text-foreground"
      aria-live="polite"
    >
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}
