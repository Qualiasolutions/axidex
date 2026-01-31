import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Check database connectivity
    const { error: dbError } = await supabase
      .from("signals")
      .select("id")
      .limit(1);

    const dbStatus = dbError ? "down" : "up";
    const responseTime = Date.now() - startTime;

    if (dbError) {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          services: {
            database: "down",
            api: "up",
          },
          responseTime: `${responseTime}ms`,
          error: dbError.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: "up",
      },
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "unknown",
          api: "up",
        },
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
