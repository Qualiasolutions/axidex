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
import { ExternalLink, Mail } from "lucide-react";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

interface SignalCardProps {
  signal: Signal;
  index?: number;
}

export const SignalCard = memo(function SignalCard({ signal, index = 0 }: SignalCardProps) {
  const router = useRouter();

  return (
    <Link href={`/dashboard/signals/${signal.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, delay: index * 0.04, ease: easeOutExpo }}
        whileHover={{
          y: -3,
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.08), 0 8px 16px -8px rgba(0,0,0,0.04)"
        }}
        className={cn(
          "group bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-subtle)]",
          "hover:border-[var(--accent)]/30 transition-all duration-300 cursor-pointer",
          signal.status === "new" && "border-l-[3px] border-l-[var(--accent)] bg-gradient-to-r from-[var(--accent)]/[0.02] to-transparent"
        )}
      >
        {/* Main content */}
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                <h3 className="font-semibold text-[var(--text-primary)] text-base group-hover:text-[var(--accent)] transition-colors duration-200">
                  {signal.company_name}
                </h3>
                <div className="flex items-center gap-1.5">
                  <SignalTypeBadge type={signal.signal_type} />
                  <PriorityBadge priority={signal.priority} />
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-1 font-medium">
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
          <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
            {signal.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span className="font-medium">{signal.source_name}</span>
              <span className="text-[var(--border-default)]">·</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(signal.source_url, "_blank", "noopener,noreferrer");
                }}
                className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-medium"
              >
                Source
                <ExternalLink className="size-3" />
              </button>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
