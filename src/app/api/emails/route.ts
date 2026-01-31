import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailTone, EmailStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    const tones = searchParams.get("tones")?.split(",").filter(Boolean) as EmailTone[] | undefined;
    const statuses = searchParams.get("statuses")?.split(",").filter(Boolean) as EmailStatus[] | undefined;
    const search = searchParams.get("search") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("generated_emails")
      .select("*, signal:signals(*)", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (tones && tones.length > 0) {
      query = query.in("tone", tones);
    }

    if (statuses && statuses.length > 0) {
      query = query.in("status", statuses);
    }

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`subject.ilike.${searchTerm},body.ilike.${searchTerm}`);
    }

    if (from) {
      query = query.gte("created_at", from);
    }
    if (to) {
      query = query.lte("created_at", to);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching emails:", error);
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }

    return NextResponse.json({
      emails: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error in emails API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
