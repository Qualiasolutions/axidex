import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSignalsQuery } from "@/lib/queries/signals";
import type { SignalType, SignalPriority, SignalStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;

    const types = searchParams.get("types")?.split(",").filter(Boolean) as SignalType[] | undefined;
    const priorities = searchParams.get("priorities")?.split(",").filter(Boolean) as SignalPriority[] | undefined;
    const statuses = searchParams.get("statuses")?.split(",").filter(Boolean) as SignalStatus[] | undefined;
    const search = searchParams.get("search") || undefined;
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build and execute query
    const query = await buildSignalsQuery(
      supabase,
      {
        types,
        priorities,
        statuses,
        search,
        from,
        to,
        limit,
        offset,
      },
      user.id
    );

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching signals:", error);
      return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
    }

    return NextResponse.json({
      signals: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error in signals API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
