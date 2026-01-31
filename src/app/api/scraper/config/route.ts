import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ScraperConfig } from "@/types/scraper";

// GET /api/scraper/config - Get user's scraper configuration
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("scraper_config")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Error fetching scraper config:", error);
      return NextResponse.json(
        { error: "Failed to fetch scraper config" },
        { status: 500 }
      );
    }

    // If no config exists, create default
    if (!data) {
      const { data: newConfig, error: insertError } = await supabase
        .from("scraper_config")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating scraper config:", insertError);
        return NextResponse.json(
          { error: "Failed to create scraper config" },
          { status: 500 }
        );
      }

      return NextResponse.json({ config: newConfig });
    }

    return NextResponse.json({ config: data as ScraperConfig });
  } catch (error) {
    console.error("Unexpected error in scraper config API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/scraper/config - Update user's scraper configuration
export async function PATCH(request: NextRequest) {
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

    // Validate scrape_interval_minutes if provided
    if (body.scrape_interval_minutes !== undefined) {
      const interval = body.scrape_interval_minutes;
      if (interval < 15 || interval > 1440) {
        return NextResponse.json(
          { error: "Scrape interval must be between 15 and 1440 minutes" },
          { status: 400 }
        );
      }
    }

    // Validate target_companies if provided
    if (body.target_companies !== undefined) {
      if (!Array.isArray(body.target_companies)) {
        return NextResponse.json(
          { error: "target_companies must be an array" },
          { status: 400 }
        );
      }
      if (body.target_companies.length > 50) {
        return NextResponse.json(
          { error: "Maximum 50 target companies allowed" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("scraper_config")
      .upsert(
        { user_id: user.id, ...body },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error updating scraper config:", error);
      return NextResponse.json(
        { error: "Failed to update scraper config" },
        { status: 500 }
      );
    }

    return NextResponse.json({ config: data });
  } catch (error) {
    console.error("Unexpected error in scraper config API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
