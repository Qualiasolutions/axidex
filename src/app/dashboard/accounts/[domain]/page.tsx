"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignalCard } from "@/components/signals/signal-card";
import { motion } from "motion/react";
import type { Signal, GeneratedEmail } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { ArrowLeft, Building2, ExternalLink } from "lucide-react";

interface AccountDetail {
  company_domain: string;
  company_name: string;
  company_logo: string | null;
  signals: Signal[];
  emails: GeneratedEmail[];
}

export default function AccountDetailPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = use(params);
  const decodedDomain = decodeURIComponent(domain);
  const router = useRouter();
  const [account, setAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccountDetail() {
      setLoading(true);
      setError(null);

      try {
        // Fetch signals for this company
        const signalsResponse = await fetch(`/api/signals?search=${encodeURIComponent(decodedDomain)}`);

        if (!signalsResponse.ok) {
          throw new Error("Failed to fetch account data");
        }

        const signalsData = await signalsResponse.json();
        const signals = (signalsData.signals || []).filter(
          (s: Signal) => s.company_domain === decodedDomain || s.company_name === decodedDomain
        );

        if (signals.length === 0) {
          throw new Error("Account not found");
        }

        // Get the first signal's company info
        const firstSignal = signals[0];

        setAccount({
          company_domain: firstSignal.company_domain || decodedDomain,
          company_name: firstSignal.company_name,
          company_logo: firstSignal.company_logo || null,
          signals,
          emails: [], // Would need separate endpoint to fetch emails for these signal IDs
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch account");
      } finally {
        setLoading(false);
      }
    }

    fetchAccountDetail();
  }, [decodedDomain]);

  if (loading) {
    return (
      <>
        <Header title="Account" subtitle="Loading..." />
        <main className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-24 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !account) {
    return (
      <>
        <Header title="Account" subtitle="Not found" />
        <main className="p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-sm text-red-600 mb-4">{error || "Account not found"}</p>
              <Button variant="secondary" onClick={() => router.push("/dashboard/accounts")}>
                Back to Accounts
              </Button>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  const highPriorityCount = account.signals.filter((s) => s.priority === "high").length;
  const newSignalsCount = account.signals.filter((s) => s.status === "new").length;
  const lastSignal = account.signals.reduce((latest, s) =>
    new Date(s.detected_at) > new Date(latest.detected_at) ? s : latest
  );

  return (
    <>
      <Header title={account.company_name} subtitle={account.company_domain} />
      <main className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/accounts")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Accounts
            </Button>
          </motion.div>

          {/* Account header card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="w-16 h-16 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {account.company_logo ? (
                  <img
                    src={account.company_logo}
                    alt={account.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-[var(--text-tertiary)]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                  {account.company_name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {account.company_domain && (
                    <a
                      href={`https://${account.company_domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
                    >
                      {account.company_domain}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[var(--text-primary)]">
                    {account.signals.length}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">signals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-red-600">
                    {highPriorityCount}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">high priority</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {formatRelativeTime(lastSignal.detected_at)}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">last signal</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]"
          >
            <span className="text-xs text-[var(--text-tertiary)]">Signals</span>
            <Badge variant="default">{account.signals.length} total</Badge>
            <span className="text-[var(--border-default)]">·</span>
            <Badge variant="danger">{highPriorityCount} high priority</Badge>
            <Badge variant="accent">{newSignalsCount} new</Badge>
          </motion.div>

          {/* Signals list */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Signal History</h3>
            {account.signals.map((signal, index) => (
              <SignalCard key={signal.id} signal={signal} index={index} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
