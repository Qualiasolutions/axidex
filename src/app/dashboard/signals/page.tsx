"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignalCard } from "@/components/signals/signal-card";
import { motion } from "motion/react";
import type { Signal, SignalType } from "@/types";

const signalFilters: { type: SignalType; label: string }[] = [
  { type: "hiring", label: "Hiring" },
  { type: "funding", label: "Funding" },
  { type: "expansion", label: "Expansion" },
  { type: "partnership", label: "Partnership" },
  { type: "product_launch", label: "Launch" },
  { type: "leadership_change", label: "Leadership" },
];

function SignalsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Read current filters from URL
  const activeTypes = searchParams.get("types")?.split(",").filter(Boolean) || [];
  const activePriorities = searchParams.get("priorities")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  // Fetch signals when filters change
  useEffect(() => {
    async function fetchSignals() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (activeTypes.length > 0) params.set("types", activeTypes.join(","));
        if (activePriorities.length > 0) params.set("priorities", activePriorities.join(","));
        if (searchQuery) params.set("search", searchQuery);
        if (from) params.set("from", from);
        if (to) params.set("to", to);

        const response = await fetch(`/api/signals?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch signals");
        }

        const data = await response.json();
        setSignals(data.signals || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch signals");
        setSignals([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchSignals();
  }, [activeTypes.join(","), activePriorities.join(","), searchQuery, from, to]);

  // Toggle type filter
  const toggleTypeFilter = (type: SignalType) => {
    const current = new Set(activeTypes);
    if (current.has(type)) {
      current.delete(type);
    } else {
      current.add(type);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (current.size > 0) {
      params.set("types", Array.from(current).join(","));
    } else {
      params.delete("types");
    }

    router.push(`/dashboard/signals?${params.toString()}`);
  };

  // Calculate stats
  const highPriorityCount = signals.filter((s) => s.priority === "high").length;
  const newSignalsCount = signals.filter((s) => s.status === "new").length;

  return (
    <>
      <Header title="Signals" subtitle="Real-time buying signals from your target accounts" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeTypes.length === 0 ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("types");
                router.push(`/dashboard/signals?${params.toString()}`);
              }}
            >
              All Types
            </Button>
            <div className="flex items-center gap-1">
              {signalFilters.map((filter) => {
                const isActive = activeTypes.includes(filter.type);
                return (
                  <button
                    key={filter.type}
                    onClick={() => toggleTypeFilter(filter.type)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/dashboard/signals?${params.toString()}`);
              }}
            >
              Refresh
            </Button>
            <Button variant="default" size="sm">
              Add Source
            </Button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]"
        >
          <span className="text-xs text-[var(--text-tertiary)]">Showing</span>
          <Badge variant="default">{signals.length} signals</Badge>
          <span className="text-[var(--border-default)]">·</span>
          <Badge variant="danger">{highPriorityCount} high priority</Badge>
          <Badge variant="accent">{newSignalsCount} new</Badge>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Signals list */}
        {!loading && !error && signals.length > 0 && (
          <div className="space-y-4">
            {signals.map((signal, index) => (
              <SignalCard key={signal.id} signal={signal} index={index} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && signals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No signals detected
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-8 leading-relaxed">
              {activeTypes.length > 0 || from
                ? "No signals match your current filters. Try adjusting your filters or clearing them to see all signals."
                : "Axidex will automatically detect buying signals when you configure your signal sources. Add news feeds, job board scrapers, and funding announcement monitors to get started."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {(activeTypes.length > 0 || from) && (
                <Button
                  variant="default"
                  onClick={() => {
                    router.push("/dashboard/signals");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button variant={activeTypes.length > 0 || from ? "secondary" : "default"}>
                Configure Signal Sources
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}

export default function SignalsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <SignalsPageContent />
    </Suspense>
  );
}
