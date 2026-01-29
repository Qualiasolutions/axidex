"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, Zap, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import type { SignalType } from "@/types";

const signalFilters: { type: SignalType; label: string }[] = [
  { type: "hiring", label: "Hiring" },
  { type: "funding", label: "Funding" },
  { type: "expansion", label: "Expansion" },
  { type: "partnership", label: "Partnership" },
  { type: "product_launch", label: "Launch" },
  { type: "leadership_change", label: "Leadership" },
];

export default function SignalsPage() {
  return (
    <>
      <Header title="Signals" subtitle="Real-time buying signals from your target accounts" />
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" className="gap-2">
              <Filter className="w-3.5 h-3.5" />
              All Types
            </Button>
            <div className="hidden sm:flex items-center gap-1">
              {signalFilters.map((filter) => (
                <button
                  key={filter.type}
                  className="px-2.5 py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="w-3.5 h-3.5" />
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
          <Badge variant="default">0 signals</Badge>
          <span className="text-[var(--border-default)]">·</span>
          <Badge variant="danger">0 high priority</Badge>
          <Badge variant="accent">0 new</Badge>
        </motion.div>

        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-20 px-6 text-center bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mb-5">
            <Zap className="w-7 h-7 text-[var(--accent)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            No signals detected
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-8 leading-relaxed">
            PULSE will automatically detect buying signals when you configure your signal sources.
            Add news feeds, job board scrapers, and funding announcement monitors to get started.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              Configure Signal Sources
            </Button>
            <Button variant="secondary">
              Import Account List
            </Button>
          </div>
        </motion.div>
      </main>
    </>
  );
}
