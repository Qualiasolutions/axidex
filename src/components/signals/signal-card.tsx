"use client";

import { SignalTypeBadge, PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Signal } from "@/types";
import { motion } from "motion/react";
import Link from "next/link";

interface SignalCardProps {
  signal: Signal;
  onGenerateEmail?: (signal: Signal) => void;
  index?: number;
}

export function SignalCard({ signal, onGenerateEmail, index = 0 }: SignalCardProps) {
  return (
    <Link href={`/dashboard/signals/${signal.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.03 }}
        className={cn(
          "group bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]",
          "hover:border-[var(--border-default)] transition-all duration-200 cursor-pointer",
          signal.status === "new" && "border-l-2 border-l-[var(--accent)]"
        )}
      >
        {/* Main content */}
        <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium text-[var(--text-primary)]">
                {signal.company_name}
              </h3>
              <div className="flex items-center gap-1.5">
                <SignalTypeBadge type={signal.signal_type} />
                <PriorityBadge priority={signal.priority} />
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-1">
              {signal.title}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={signal.status} />
            <span className="text-xs text-[var(--text-tertiary)]">
              {formatRelativeTime(signal.detected_at)}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
          {signal.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span>{signal.source_name}</span>
            <span className="text-[var(--border-default)]">·</span>
            <a
              href={signal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Source
            </a>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onGenerateEmail?.(signal)}
              className="h-7 px-2"
            >
              Draft Email
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              More
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}
