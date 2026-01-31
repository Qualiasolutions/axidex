import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkLimit, getUsageCount } from "@/lib/billing";

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
    const activeOnly = searchParams.get("active") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("automation_rules")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching rules:", error);
      return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
    }

    return NextResponse.json({
      rules: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error in rules API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, trigger_conditions, actions, is_active } = body;

    if (!name || !trigger_conditions || !actions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check automation rule limit
    const currentRules = await getUsageCount(user.id, 'rules');
    const { allowed, limit, tier } = await checkLimit(user.id, 'automation_rules', currentRules);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Rule limit reached',
          message: `Your ${tier} plan allows ${limit} automation rules. Upgrade for more.`,
          upgrade_url: '/pricing'
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("automation_rules")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        trigger_conditions,
        actions,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating rule:", error);
      return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
    }

    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in rules API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
