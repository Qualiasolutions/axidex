"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import type { GeneratedEmail } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { Copy, Check, ExternalLink } from "lucide-react";

const toneConfig: Record<GeneratedEmail["tone"], { label: string; variant: "default" | "success" | "warning" | "danger" | "accent" }> = {
  professional: { label: "Professional", variant: "default" },
  casual: { label: "Casual", variant: "accent" },
  enthusiastic: { label: "Enthusiastic", variant: "success" },
};

const statusConfig: Record<GeneratedEmail["status"], { label: string; variant: "default" | "success" | "warning" | "danger" | "accent" }> = {
  draft: { label: "Draft", variant: "warning" },
  sent: { label: "Sent", variant: "success" },
};

export default function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchEmail() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/emails/${id}`);

        if (!response.ok) {
          throw new Error("Email not found");
        }

        const data = await response.json();
        setEmail(data.email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch email");
      } finally {
        setLoading(false);
      }
    }

    fetchEmail();
  }, [id]);

  const handleCopy = async () => {
    if (!email) return;
    await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkSent = async () => {
    if (!email) return;
    setUpdating(true);

    try {
      const response = await fetch(`/api/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email");
      }

      const data = await response.json();
      setEmail(data.email);
    } catch (err) {
      console.error("Error updating email:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header
          title="Email"
          subtitle="Loading..."
          breadcrumbs={[{ label: "Emails", href: "/dashboard/emails" }, { label: "Loading..." }]}
        />
        <main className="p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="h-12 bg-[var(--bg-secondary)] rounded animate-pulse" />
            <div className="h-64 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  if (error || !email) {
    return (
      <>
        <Header
          title="Email"
          subtitle="Not found"
          breadcrumbs={[{ label: "Emails", href: "/dashboard/emails" }, { label: "Not Found" }]}
        />
        <main className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-sm text-red-600 mb-4">{error || "Email not found"}</p>
              <Button variant="secondary" onClick={() => router.push("/dashboard/emails")}>
                Back to Emails
              </Button>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  const toneStyle = toneConfig[email.tone];
  const statusStyle = statusConfig[email.status];

  return (
    <>
      <Header
        title={email.subject}
        breadcrumbs={[{ label: "Emails", href: "/dashboard/emails" }, { label: email.subject }]}
      />
      <main className="p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Email card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-subtle)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  {email.subject}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={toneStyle.variant}>{toneStyle.label}</Badge>
                  <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Created {formatRelativeTime(email.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                {email.status === "draft" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleMarkSent}
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Mark as Sent"}
                  </Button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--text-secondary)] leading-relaxed bg-transparent p-0 m-0">
                {email.body}
              </pre>
            </div>

            {/* Signal reference */}
            {email.signal && (
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                <p className="text-xs text-[var(--text-tertiary)] mb-2">Generated from signal:</p>
                <Link
                  href={`/dashboard/signals/${email.signal_id}`}
                  className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
                >
                  {email.signal.company_name} - {email.signal.title}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
