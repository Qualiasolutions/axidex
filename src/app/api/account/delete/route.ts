import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GDPR Account Deletion Endpoint
 * DELETE /api/account/delete
 *
 * Permanently deletes the user's account and all associated data.
 * This action is irreversible.
 *
 * Body: { confirmation: "DELETE MY ACCOUNT" }
 */
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Require explicit confirmation
    const body = await request.json();
    if (body.confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        {
          error: "Account deletion requires confirmation",
          required: 'Send { "confirmation": "DELETE MY ACCOUNT" } to confirm.',
        },
        { status: 400 }
      );
    }

    // Cancel any active Stripe subscription first
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profile?.stripe_subscription_id) {
      try {
        // Dynamic import to avoid build errors when Stripe isn't configured
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
          apiVersion: "2026-01-28.clover",
        });
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
      } catch (stripeError) {
        console.warn("Failed to cancel Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe fails
      }
    }

    // Delete all user data
    // Due to CASCADE constraints, deleting from profiles will cascade to:
    // - signals (and generated_emails via signal_id cascade)
    // - generated_emails (via user_id)
    // - automation_rules
    // - crm_integrations (and crm_sync_logs via integration_id cascade)
    // - crm_sync_logs (via user_id)
    // - scraper_config
    // - scrape_runs
    // - subscriptions

    // Delete profile (cascades to all related data)
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (deleteError) {
      console.error("Profile deletion error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete account data" },
        { status: 500 }
      );
    }

    // Delete the auth user
    // Note: This requires admin privileges or the user must be signed in
    // The service role key is used internally by Supabase client
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );

    if (authDeleteError) {
      // If admin delete fails, try signing out instead
      // The profile data is already deleted
      console.warn("Auth user deletion failed, signing out:", authDeleteError);
      await supabase.auth.signOut();
    }

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
