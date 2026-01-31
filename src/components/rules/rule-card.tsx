"use client";

import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { AutomationRule } from "@/types";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Zap,
  ZapOff,
  Mail,
  Bell,
  ArrowRightLeft,
  Building2,
  Target,
  Tag,
  Activity,
  Clock,
  MoreVertical,
  Copy,
  Trash2,
  Pencil,
} from "lucide-react";
import { preload } from "swr";
import { fetcher } from "@/lib/swr";

interface RuleCardProps {
  rule: AutomationRule;
  onToggle?: (rule: AutomationRule, isActive: boolean) => void;
  onDelete?: (rule: AutomationRule) => void;
  onDuplicate?: (rule: AutomationRule) => void;
  index?: number;
}

const signalTypeConfig: Record<string, { label: string; color: string }> = {
  hiring: { label: "Hiring", color: "bg-blue-500" },
  funding: { label: "Funding", color: "bg-emerald-500" },
  expansion: { label: "Expansion", color: "bg-amber-500" },
  partnership: { label: "Partnership", color: "bg-purple-500" },
  product_launch: { label: "Launch", color: "bg-pink-500" },
  leadership_change: { label: "Leadership", color: "bg-indigo-500" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "High", color: "text-red-600 bg-red-50" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-50" },
  low: { label: "Low", color: "text-gray-600 bg-gray-50" },
};

const actionConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  generate_email: { label: "Draft Email", icon: Mail, color: "text-blue-600 bg-blue-50" },
  mark_status: { label: "Update Status", icon: ArrowRightLeft, color: "text-purple-600 bg-purple-50" },
  notify: { label: "Notify", icon: Bell, color: "text-amber-600 bg-amber-50" },
  push_to_crm: { label: "Push to CRM", icon: Building2, color: "text-emerald-600 bg-emerald-50" },
};

export const RuleCard = memo(function RuleCard({
  rule,
  onToggle,
  onDelete,
  onDuplicate,
  index = 0,
}: RuleCardProps) {
  const [toggling, setToggling] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(rule);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    onDuplicate?.(rule);
  };

  // Get trigger condition pills
  const conditionPills: { icon: React.ElementType; label: string; color: string }[] = [];

  if (rule.trigger_conditions.signal_types?.length) {
    rule.trigger_conditions.signal_types.forEach((type) => {
      const config = signalTypeConfig[type];
      if (config) {
        conditionPills.push({
          icon: Target,
          label: config.label,
          color: config.color,
        });
      }
    });
  }

  if (rule.trigger_conditions.priorities?.length) {
    rule.trigger_conditions.priorities.forEach((priority) => {
      const config = priorityConfig[priority];
      if (config) {
        conditionPills.push({
          icon: Activity,
          label: config.label + " Priority",
          color: config.color.split(" ")[0],
        });
      }
    });
  }

  if (rule.trigger_conditions.keywords?.length) {
    conditionPills.push({
      icon: Tag,
      label: `${rule.trigger_conditions.keywords.length} keyword${rule.trigger_conditions.keywords.length > 1 ? "s" : ""}`,
      color: "bg-gray-500",
    });
  }

  if (rule.trigger_conditions.companies?.length) {
    conditionPills.push({
      icon: Building2,
      label: `${rule.trigger_conditions.companies.length} company${rule.trigger_conditions.companies.length > 1 ? "ies" : ""}`,
      color: "bg-gray-500",
    });
  }

  // If no conditions, it matches all
  if (conditionPills.length === 0) {
    conditionPills.push({
      icon: Zap,
      label: "All Signals",
      color: "bg-accent",
    });
  }

  const handlePrefetch = () => {
    preload(`/api/rules/${rule.id}`, fetcher);
  };

  return (
    <Link href={`/dashboard/rules/${rule.id}`} onMouseEnter={handlePrefetch}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -2 }}
        className={cn(
          "group relative bg-background rounded-2xl p-6 border transition-all duration-300 cursor-pointer overflow-hidden",
          rule.is_active
            ? "border-border/50 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            : "border-border/30 opacity-70 hover:opacity-100"
        )}
      >
        {/* Active indicator bar */}
        {rule.is_active && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-orange-500" />
        )}

        <div className="flex items-start gap-5">
          {/* Icon */}
          <div
            className={cn(
              "relative size-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              rule.is_active
                ? "bg-gradient-to-br from-accent/20 to-orange-500/20"
                : "bg-muted"
            )}
          >
            {rule.is_active ? (
              <Zap className="size-6 text-accent" />
            ) : (
              <ZapOff className="size-6 text-muted-foreground" />
            )}
            {rule.is_active && (
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {rule.name}
                  </h3>
                  <Badge variant={rule.is_active ? "success" : "default"} className="text-[10px]">
                    {rule.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>
                {rule.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {rule.description}
                  </p>
                )}
              </div>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="size-4 text-muted-foreground" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-border rounded-xl shadow-xl z-50 py-1">
                    <Link
                      href={`/dashboard/rules/${rule.id}`}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                    <button
                      onClick={handleDuplicate}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <Copy className="size-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Conditions & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
              {/* When */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wide">When</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {conditionPills.slice(0, 3).map((pill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-foreground font-medium"
                    >
                      <span className={cn("size-1.5 rounded-full", pill.color)} />
                      {pill.label}
                    </span>
                  ))}
                  {conditionPills.length > 3 && (
                    <span className="text-muted-foreground">+{conditionPills.length - 3} more</span>
                  )}
                </div>
              </div>

              <span className="hidden sm:block text-muted-foreground">→</span>

              {/* Then */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium uppercase tracking-wide">Then</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {rule.actions.map((action, i) => {
                    const config = actionConfig[action.type];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <span
                        key={i}
                        className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium", config.color)}
                      >
                        <Icon className="size-3" />
                        {config.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3.5" />
                  <span>
                    {rule.times_triggered || 0} trigger{(rule.times_triggered || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
                {rule.last_triggered_at && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span>Last: {formatRelativeTime(rule.last_triggered_at)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Created {formatRelativeTime(rule.created_at)}</span>
                </div>
              </div>

              {/* Toggle button */}
              <Button
                variant={rule.is_active ? "outline" : "default"}
                size="sm"
                onClick={handleToggle}
                disabled={toggling}
                className="h-8 text-xs"
              >
                {toggling ? "..." : rule.is_active ? "Pause" : "Activate"}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
