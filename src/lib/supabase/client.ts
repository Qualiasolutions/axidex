import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/database";

export function createClient() {
  // Trim env vars to handle accidental whitespace/newlines
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error("Invalid Supabase URL format");
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
