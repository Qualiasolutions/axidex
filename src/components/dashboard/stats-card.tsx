"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  className?: string;
  index?: number;
}

export function StatsCard({ title, value, change, className, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-subtle)]",
        "hover:border-[var(--border-default)] transition-colors duration-200",
        className
      )}
    >
      <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
        {title}
      </p>
      <p className="text-3xl font-semibold text-[var(--text-primary)] mt-2 tabular-nums">
        {value}
      </p>
      {change && (
        <p
          className={cn("text-xs font-medium mt-2", {
            "text-[var(--success)]": change.trend === "up",
            "text-[var(--danger)]": change.trend === "down",
            "text-[var(--text-tertiary)]": change.trend === "neutral",
          })}
        >
          {change.trend === "up" && "+"}
          {change.trend === "down" && "-"}
          {change.value}% vs last week
        </p>
      )}
    </motion.div>
  );
}
