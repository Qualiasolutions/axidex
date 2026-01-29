"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  className?: string;
  index?: number;
}

export function StatsCard({ title, value, change, icon: Icon, className, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        "group relative bg-[var(--bg-secondary)] rounded-xl p-5 border border-[var(--border-subtle)]",
        "hover:border-[var(--border-default)] transition-colors duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-semibold text-[var(--text-primary)] tabular-nums">
            {value}
          </p>
          {change && (
            <p
              className={cn("text-xs font-medium flex items-center gap-1", {
                "text-[var(--success)]": change.trend === "up",
                "text-[var(--danger)]": change.trend === "down",
                "text-[var(--text-tertiary)]": change.trend === "neutral",
              })}
            >
              <span>
                {change.trend === "up" && "↑"}
                {change.trend === "down" && "↓"}
              </span>
              {change.value}%
              <span className="text-[var(--text-tertiary)] font-normal">vs last week</span>
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center group-hover:bg-[var(--accent)]/15 transition-colors">
          <Icon className="w-5 h-5 text-[var(--accent)]" />
        </div>
      </div>
    </motion.div>
  );
}
