import { NextResponse } from "next/server";
import { getRequestCity } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createSupabaseServiceRole } = await import("@/lib/supabase");
      const supabase = createSupabaseServiceRole();
      const { data, error } = await supabase
        .from("leaderboard")
        .select("id, user_id, city, time_seconds, difficulty, created_at")
        .order("time_seconds", { ascending: true })
        .limit(100);
      if (!error && data) return NextResponse.json({ entries: data });
      if (error) console.error("leaderboard GET", error);
    }
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json({ entries: [] });
}

export async function POST(req: Request) {
  const city = getRequestCity();
  let body: { time_seconds?: number; difficulty?: string; user_id?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const time = body.time_seconds;
  const difficulty = body.difficulty ?? "medium";
  if (typeof time !== "number" || time < 0) {
    return NextResponse.json({ error: "time_seconds required" }, { status: 400 });
  }

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createSupabaseServiceRole } = await import("@/lib/supabase");
      const supabase = createSupabaseServiceRole();
      const { error } = await supabase.from("leaderboard").insert({
        user_id: body.user_id ?? null,
        city,
        time_seconds: Math.floor(time),
        difficulty,
      });
      if (error) {
        console.error("leaderboard insert", error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({ ok: true, note: "Leaderboard storage not configured" });
}
