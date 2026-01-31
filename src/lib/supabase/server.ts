import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Database } from "@/types/database";
import { withRetry } from "@/lib/db-retry";

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  // Trim env vars to handle accidental whitespace/newlines
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component, ignore
        }
      },
    },
  });
}

/**
 * Execute a database query with automatic retry on transient failures
 * @param queryFn - Function that takes a Supabase client and returns a query
 */
export async function withDbRetry<T>(
  queryFn: (client: SupabaseClient<Database>) => Promise<T>
): Promise<T> {
  const client = await createClient();
  return withRetry(() => queryFn(client));
}
