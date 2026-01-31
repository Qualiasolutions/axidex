"use client";

import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { AutomationRule } from "@/types";
import { motion } from "motion/react";
import Link from "next/link";
import { Zap, ZapOff } from "lucide-react";

interface RuleCardProps {
  rule: AutomationRule;
  onToggle?: (rule: AutomationRule, isActive: boolean) => void;
  index?: number;
}

const signalTypeLabels: Record<string, string> = {
  hiring: "Hiring",
  funding: "Funding",
  expansion: "Expansion",
  partnership: "Partnership",
  product_launch: "Launch",
  leadership_change: "Leadership",
};

const priorityLabels: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const actionLabels: Record<string, string> = {
  generate_email: "Generate Email",
  mark_status: "Change Status",
  notify: "Send Notification",
};

export const RuleCard = memo(function RuleCard({ rule, onToggle, index = 0 }: RuleCardProps) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggling) return;

    setToggling(true);
    try {
      onToggle?.(rule, !rule.is_active);
    } finally {
      setToggling(false);
    }
  };

  // Summarize conditions
  const conditionParts: string[] = [];
  if (rule.trigger_conditions.signal_types?.length) {
    conditionParts.push(
      rule.trigger_conditions.signal_types
        .map((t) => signalTypeLabels[t] || t)
        .join(", ")
    );
  }
  if (rule.trigger_conditions.priorities?.length) {
    conditionParts.push(
      rule.trigger_conditions.priorities
        .map((p) => priorityLabels[p] || p)
        .join(", ") + " priority"
    );
  }
  if (rule.trigger_conditions.keywords?.length) {
    conditionParts.push(`keywords: ${rule.trigger_conditions.keywords.join(", ")}`);
  }
  if (rule.trigger_conditions.companies?.length) {
    conditionParts.push(`companies: ${rule.trigger_conditions.companies.join(", ")}`);
  }

  const conditionSummary = conditionParts.length > 0 ? conditionParts.join(" + ") : "Any signal";

  // Summarize actions
  const actionSummary = rule.actions
    .map((a) => actionLabels[a.type] || a.type)
    .join(", ") || "No actions";

  return (
    <Link href={`/dashboard/rules/${rule.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.03 }}
        className={cn(
          "group bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]",
          "hover:border-[var(--border-default)] transition-all duration-200 cursor-pointer",
          !rule.is_active && "opacity-60"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              rule.is_active
                ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
            )}
          >
            {rule.is_active ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-medium text-[var(--text-primary)]">{rule.name}</h3>
              <Badge variant={rule.is_active ? "success" : "default"}>
                {rule.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {rule.description && (
              <p className="text-sm text-[var(--text-tertiary)] mb-2 line-clamp-1">
                {rule.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
              <div>
                <span className="text-[var(--text-secondary)]">When:</span> {conditionSummary}
              </div>
              <span className="text-[var(--border-default)]">|</span>
              <div>
                <span className="text-[var(--text-secondary)]">Then:</span> {actionSummary}
              </div>
            </div>
          </div>

          {/* Toggle & time */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Button
              variant={rule.is_active ? "default" : "secondary"}
              size="sm"
              onClick={handleToggle}
              disabled={toggling}
              className="min-w-20"
            >
              {toggling ? "..." : rule.is_active ? "Disable" : "Enable"}
            </Button>
            <span className="text-xs text-[var(--text-tertiary)]">
              {formatRelativeTime(rule.created_at)}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
