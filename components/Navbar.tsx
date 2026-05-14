import Link from "next/link";

const links = [
  { href: "/play?difficulty=beginner", label: "Новичок" },
  { href: "/play", label: "Play" },
  { href: "/play?mode=daily", label: "Daily" },
  { href: "/stats", label: "Stats" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        MineMind
      </Link>
      <nav className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
