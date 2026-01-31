"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { SignalTypeBadge, PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Signal } from "@/types";
import { motion } from "motion/react";
import type { Easing } from "motion/react";
import Link from "next/link";
import { ExternalLink, Mail, ArrowUpRight } from "lucide-react";
import { preload } from "swr";
import { fetcher } from "@/lib/swr";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

interface SignalCardProps {
  signal: Signal;
  index?: number;
  compact?: boolean;
}

export const SignalCard = memo(function SignalCard({ signal, index = 0, compact = false }: SignalCardProps) {
  const router = useRouter();

  const handlePrefetch = () => {
    preload(`/api/signals/${signal.id}`, fetcher);
  };

  return (
    <Link href={`/dashboard/signals/${signal.id}`} onMouseEnter={handlePrefetch}>
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: easeOutExpo }}
        whileHover={{
          y: -4,
          transition: { duration: 0.25, ease: easeOutExpo }
        }}
        className={cn(
          "group relative bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-subtle)]",
          "transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] cursor-pointer",
          "hover:border-[var(--accent)]/30 hover:shadow-[var(--shadow-card-hover)]",
          compact ? "p-4" : "p-6",
          signal.status === "new" && "border-l-[3px] border-l-[var(--accent)] bg-gradient-to-r from-[var(--accent)]/[0.03] to-transparent"
        )}
      >
        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-normal)] pointer-events-none" />

        {/* Main content */}
        <div className={cn("relative space-y-4", compact && "space-y-3")}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <h3 className={cn(
                  "font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-[var(--duration-fast)]",
                  compact ? "text-sm" : "text-base"
                )}>
                  {signal.company_name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <SignalTypeBadge type={signal.signal_type} />
                  <PriorityBadge priority={signal.priority} />
                </div>
              </div>
              <p className={cn(
                "text-[var(--text-secondary)] line-clamp-1 font-medium",
                compact ? "text-xs" : "text-sm"
              )}>
                {signal.title}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <StatusBadge status={signal.status} />
              <span className="text-xs text-[var(--text-tertiary)] font-medium">
                {formatRelativeTime(signal.detected_at)}
              </span>
            </div>
          </div>

          {/* Summary */}
          {!compact && (
            <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
              {signal.summary}
            </p>
          )}

          {/* Footer */}
          <div className={cn(
            "flex items-center justify-between border-t border-[var(--border-subtle)]",
            compact ? "pt-3" : "pt-4"
          )}>
            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span className="font-medium">{signal.source_name}</span>
              <span className="text-[var(--border-default)]">·</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(signal.source_url, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-medium group/link"
              >
                Source
                <ExternalLink className="size-3 transition-transform duration-[var(--duration-fast)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/dashboard/signals/${signal.id}#email`);
                }}
                className="h-8 px-3 text-xs font-medium gap-1.5"
              >
                <Mail className="size-3.5" />
                Draft Email
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-8"
              >
                <ArrowUpRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
