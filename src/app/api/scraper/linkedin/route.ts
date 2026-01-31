import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BRIGHT_DATA_API_URL = "https://api.brightdata.com/datasets/v3/trigger";
const LINKEDIN_PROFILES_DATASET_ID = "gd_l1viktl72bvl7bjuj0"; // LinkedIn People Profiles

interface LinkedInProfile {
  id: string;
  name: string;
  city: string;
  country_code: string;
  position: string;
  about: string | null;
  current_company: {
    name: string;
    location: string | null;
  };
  experience: Array<{
    company: string;
    company_logo_url: string;
    title: string;
    description_html: string | null;
  }>;
  url: string;
  avatar: string;
  followers: number;
  connections: number;
  linkedin_id: string;
}

// POST /api/scraper/linkedin - Scrape LinkedIn profiles by URL
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
    const { urls } = body as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 }
      );
    }

    // Validate URLs are LinkedIn profile URLs
    const validUrls = urls.filter((url) =>
      url.match(/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?/)
    );

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid LinkedIn profile URLs provided" },
        { status: 400 }
      );
    }

    const apiToken = process.env.BRIGHT_DATA_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "LinkedIn scraping not configured" },
        { status: 503 }
      );
    }

    // Trigger Bright Data scrape
    const payload = {
      dataset_id: LINKEDIN_PROFILES_DATASET_ID,
      include_errors: true,
      notify: false,
      input: validUrls.map((url) => ({ url })),
    };

    const response = await fetch(BRIGHT_DATA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      console.error("Bright Data auth failed");
      return NextResponse.json(
        { error: "LinkedIn API authentication failed" },
        { status: 503 }
      );
    }

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Rate limited. Please try again later." },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bright Data error:", errorText);
      return NextResponse.json(
        { error: "Failed to trigger LinkedIn scrape" },
        { status: 500 }
      );
    }

    const result = await response.json();
    const snapshotId = result.snapshot_id;

    if (!snapshotId) {
      return NextResponse.json(
        { error: "No snapshot ID returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      snapshotId,
      urlCount: validUrls.length,
      message: "LinkedIn profile scrape started. Poll for results.",
    });
  } catch (error) {
    console.error("LinkedIn scraper error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/scraper/linkedin?snapshotId=xxx - Get scrape results
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

    const snapshotId = request.nextUrl.searchParams.get("snapshotId");
    if (!snapshotId) {
      return NextResponse.json(
        { error: "snapshotId is required" },
        { status: 400 }
      );
    }

    const apiToken = process.env.BRIGHT_DATA_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: "LinkedIn scraping not configured" },
        { status: 503 }
      );
    }

    // Check progress
    const progressUrl = `https://api.brightdata.com/datasets/v3/progress/${snapshotId}`;
    const progressResponse = await fetch(progressUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!progressResponse.ok) {
      return NextResponse.json(
        { error: "Failed to check progress" },
        { status: 500 }
      );
    }

    const progress = await progressResponse.json();

    if (progress.status === "running" || progress.status === "pending") {
      return NextResponse.json({
        status: progress.status,
        progress: progress.progress || 0,
        message: "Scrape in progress...",
      });
    }

    if (progress.status === "failed") {
      return NextResponse.json(
        { status: "failed", error: "Scrape failed" },
        { status: 500 }
      );
    }

    if (progress.status === "ready") {
      // Fetch results
      const dataUrl = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;
      const dataResponse = await fetch(dataUrl, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });

      if (!dataResponse.ok) {
        return NextResponse.json(
          { error: "Failed to fetch results" },
          { status: 500 }
        );
      }

      const profiles: LinkedInProfile[] = await dataResponse.json();

      return NextResponse.json({
        status: "ready",
        profiles,
        count: profiles.length,
      });
    }

    return NextResponse.json({ status: progress.status });
  } catch (error) {
    console.error("LinkedIn results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
