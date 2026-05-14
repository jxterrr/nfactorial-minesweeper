import { NextResponse } from "next/server";
import { utcDateString } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const date = utcDateString();
  const seed = date;

  try {
    const { createSupabaseServiceRole } = await import("@/lib/supabase");
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createSupabaseServiceRole();
      const { data: existing } = await supabase
        .from("daily_challenges")
        .select("date, seed, difficulty")
        .eq("date", date)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          date: existing.date,
          seed: existing.seed,
          difficulty: existing.difficulty ?? "medium",
        });
      }

      const difficulty = "medium";
      const { error } = await supabase.from("daily_challenges").insert({
        date,
        seed,
        difficulty,
      });

      if (error) {
        console.error("daily_challenges insert", error);
        return NextResponse.json({ date, seed, difficulty, warning: error.message });
      }

      return NextResponse.json({ date, seed, difficulty });
    }
  } catch (e) {
    console.error("daily-seed supabase", e);
  }

  return NextResponse.json({ date, seed, difficulty: "medium" });
}
