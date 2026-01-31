import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { SignalTypeBadge, PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Signal, GeneratedEmail } from "@/types";
import { EmailGenerator } from "@/components/signals/email-generator";

interface SignalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SignalDetailPage({ params }: SignalDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch user's signal
  const { data: signalData, error } = await supabase
    .from("signals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !signalData) {
    notFound();
  }

  const signal = signalData as unknown as Signal;

  // Fetch existing generated email if any
  const { data: existingEmailData } = await supabase
    .from("generated_emails")
    .select("*")
    .eq("signal_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const existingEmail = existingEmailData as unknown as GeneratedEmail | null;

  // Parse metadata
  const metadata = signal.metadata as Signal["metadata"];

  return (
    <>
      <Header
        title={signal.title}
        subtitle={signal.company_name}
        breadcrumbs={[
          { label: "Signals", href: "/dashboard/signals" },
          { label: signal.company_name },
        ]}
      />
      <main className="p-6 lg:p-8 space-y-6 max-w-5xl">

        {/* Signal header */}
        <div className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-subtle)] space-y-4">
          {/* Company info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {signal.company_logo && (
                <img
                  src={signal.company_logo}
                  alt={signal.company_name}
                  className="w-12 h-12 rounded-lg object-cover border border-[var(--border-subtle)]"
                />
              )}
              <div>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                  {signal.company_name}
                </h2>
                {signal.company_domain && (
                  <a
                    href={`https://${signal.company_domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    {signal.company_domain}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SignalTypeBadge type={signal.signal_type} />
              <PriorityBadge priority={signal.priority} />
              <StatusBadge status={signal.status} />
            </div>
          </div>

          {/* Signal title */}
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
              {signal.title}
            </h3>
            <p className="text-sm text-[var(--text-tertiary)]">
              Detected {formatDate(signal.detected_at)}
            </p>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {signal.summary}
            </p>
          </div>

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <h4 className="text-sm font-medium text-[var(--text-primary)]">
                Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {metadata.funding_amount && (
                  <div>
                    <span className="text-xs text-[var(--text-tertiary)]">Funding Amount</span>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {metadata.funding_amount}
                    </p>
                  </div>
                )}
                {metadata.job_titles && metadata.job_titles.length > 0 && (
                  <div>
                    <span className="text-xs text-[var(--text-tertiary)]">Job Titles</span>
                    <p className="text-sm text-[var(--text-primary)]">
                      {metadata.job_titles.join(", ")}
                    </p>
                  </div>
                )}
                {metadata.location && (
                  <div>
                    <span className="text-xs text-[var(--text-tertiary)]">Location</span>
                    <p className="text-sm text-[var(--text-primary)]">
                      {metadata.location}
                    </p>
                  </div>
                )}
                {metadata.industry && (
                  <div>
                    <span className="text-xs text-[var(--text-tertiary)]">Industry</span>
                    <p className="text-sm text-[var(--text-primary)]">
                      {metadata.industry}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 text-sm">
            <span className="text-[var(--text-tertiary)]">Source:</span>
            <span className="text-[var(--text-secondary)]">{signal.source_name}</span>
            <span className="text-[var(--border-default)]">·</span>
            <a
              href={signal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              View original
            </a>
          </div>
        </div>

        {/* Email generation section */}
        <div id="email">
          <EmailGenerator signalId={id} signal={signal} existingEmail={existingEmail ?? undefined} />
        </div>
      </main>
    </>
  );
}
