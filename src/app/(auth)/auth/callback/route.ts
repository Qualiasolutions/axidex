import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Whitelist of allowed redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECTS = [
  '/dashboard',
  '/dashboard/signals',
  '/dashboard/settings',
  '/update-password',
];

function isValidRedirect(path: string): boolean {
  // Must start with / and be in whitelist or start with an allowed prefix
  if (!path.startsWith('/')) return false;
  return ALLOWED_REDIRECTS.some(allowed =>
    path === allowed || path.startsWith(allowed + '/')
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Validate redirect path to prevent open redirect attacks
  const safePath = isValidRedirect(next) ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  // Auth failed - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
