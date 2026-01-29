"use client";

import { SignalTypeBadge, PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Signal } from "@/types";
import { ExternalLink, Mail, MoreHorizontal, Building2 } from "lucide-react";

interface SignalCardProps {
  signal: Signal;
  onGenerateEmail?: (signal: Signal) => void;
}

export function SignalCard({ signal, onGenerateEmail }: SignalCardProps) {
  return (
    <div
      className={cn(
        "bg-[#1e293b] rounded-lg p-4 border border-[#334155] hover:border-[#00a4ac]/50 transition-colors",
        signal.status === "new" && "border-l-4 border-l-[#00a4ac]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center flex-shrink-0">
            {signal.company_logo ? (
              <img
                src={signal.company_logo}
                alt={signal.company_name}
                className="w-8 h-8 rounded"
              />
            ) : (
              <Building2 className="w-5 h-5 text-[#64748b]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white truncate">{signal.company_name}</h3>
              <SignalTypeBadge type={signal.signal_type} />
              <PriorityBadge priority={signal.priority} />
            </div>
            <p className="text-sm text-[#94a3b8] mt-1 line-clamp-2">{signal.title}</p>
            <p className="text-xs text-[#64748b] mt-2 line-clamp-2">{signal.summary}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={signal.status} />
          <span className="text-xs text-[#64748b]">{formatRelativeTime(signal.detected_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#334155]">
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <span>{signal.source_name}</span>
          <a
            href={signal.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00a4ac] hover:text-[#00c4cc] inline-flex items-center gap-1"
          >
            View source <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGenerateEmail?.(signal)}
            className="gap-1"
          >
            <Mail className="w-4 h-4" />
            Draft Email
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
