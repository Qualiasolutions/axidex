"use client";

import { SignalTypeBadge, PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Signal } from "@/types";
import { ExternalLink, Mail, MoreHorizontal, Building2 } from "lucide-react";
import { motion } from "motion/react";

interface SignalCardProps {
  signal: Signal;
  onGenerateEmail?: (signal: Signal) => void;
  index?: number;
}

export function SignalCard({ signal, onGenerateEmail, index = 0 }: SignalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "group bg-[var(--bg-secondary)] rounded-xl p-4 sm:p-5 border border-[var(--border-subtle)]",
        "hover:border-[var(--border-default)] transition-all duration-200",
        signal.status === "new" && "border-l-2 border-l-[var(--accent)]"
      )}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Company logo */}
        <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0 border border-[var(--border-subtle)]">
          {signal.company_logo ? (
            <img
              src={signal.company_logo}
              alt={signal.company_name}
              className="w-6 h-6 rounded object-contain"
            />
          ) : (
            <Building2 className="w-5 h-5 text-[var(--text-tertiary)]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-[var(--text-primary)] truncate">
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
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <span>{signal.source_name}</span>
              <span className="text-[var(--border-default)]">·</span>
              <a
                href={signal.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline inline-flex items-center gap-1"
              >
                Source <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onGenerateEmail?.(signal)}
                className="h-7 px-2 gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Draft</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
