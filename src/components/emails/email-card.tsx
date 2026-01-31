"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { GeneratedEmail } from "@/types";
import { motion } from "motion/react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface EmailCardProps {
  email: GeneratedEmail;
  index?: number;
}

const toneConfig: Record<GeneratedEmail["tone"], { label: string; variant: "default" | "success" | "warning" | "danger" | "accent" }> = {
  professional: { label: "Professional", variant: "default" },
  casual: { label: "Casual", variant: "accent" },
  enthusiastic: { label: "Enthusiastic", variant: "success" },
};

const statusConfig: Record<GeneratedEmail["status"], { label: string; variant: "default" | "success" | "warning" | "danger" | "accent" }> = {
  draft: { label: "Draft", variant: "warning" },
  sent: { label: "Sent", variant: "success" },
};

export const EmailCard = memo(function EmailCard({ email, index = 0 }: EmailCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toneStyle = toneConfig[email.tone];
  const statusStyle = statusConfig[email.status];

  return (
    <Link href={`/dashboard/emails/${email.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.03 }}
        className={cn(
          "group bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]",
          "hover:border-[var(--border-default)] transition-all duration-200 cursor-pointer",
          email.status === "draft" && "border-l-2 border-l-amber-400"
        )}
      >
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-[var(--text-primary)] line-clamp-1">
                  {email.subject}
                </h3>
                <Badge variant={toneStyle.variant}>{toneStyle.label}</Badge>
              </div>
              {email.signal && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  For: {email.signal.company_name}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
              <span className="text-xs text-[var(--text-tertiary)]">
                {formatRelativeTime(email.created_at)}
              </span>
            </div>
          </div>

          {/* Body preview */}
          <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
            {email.body}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              {email.signal && (
                <>
                  <span>{email.signal.signal_type}</span>
                  <span className="text-[var(--border-default)]">·</span>
                  <Link
                    href={`/dashboard/signals/${email.signal_id}`}
                    className="text-[var(--accent)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Signal
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                Edit
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
