import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAccounts } from "@/lib/queries/accounts";

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

    const search = searchParams.get("search") || undefined;
    const minSignals = parseInt(searchParams.get("minSignals") || "0");
    const sortBy = (searchParams.get("sortBy") as "last_signal" | "signal_count" | "company_name") || "last_signal";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { accounts, count } = await fetchAccounts(supabase, user.id, {
      search,
      minSignals,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    return NextResponse.json({
      accounts,
      count,
    });
  } catch (error) {
    console.error("Unexpected error in accounts API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
