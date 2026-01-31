"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { Easing } from "motion/react";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

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

export const StatsCard = memo(function StatsCard({ title, value, change, className, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: easeOutExpo }}
      whileHover={{
        y: -2,
        boxShadow: "0 12px 28px -8px rgba(0,0,0,0.06), 0 4px 10px -4px rgba(0,0,0,0.04)"
      }}
      className={cn(
        "bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-subtle)]",
        "hover:border-[var(--border-default)] transition-colors duration-300",
        "group cursor-default",
        className
      )}
    >
      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
        {title}
      </p>
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.06 + 0.2, ease: easeOutExpo }}
        className="text-4xl font-bold text-[var(--text-primary)] tabular-nums tracking-tight"
      >
        {value}
      </motion.p>
      {change && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.06 + 0.3, ease: easeOutExpo }}
          className={cn("text-xs font-semibold mt-3 flex items-center gap-1", {
            "text-[var(--success)]": change.trend === "up",
            "text-[var(--danger)]": change.trend === "down",
            "text-[var(--text-tertiary)]": change.trend === "neutral",
          })}
        >
          <span className={cn(
            "inline-flex items-center justify-center size-4 rounded-full text-[10px]",
            change.trend === "up" && "bg-green-100 text-green-600",
            change.trend === "down" && "bg-red-100 text-red-600",
            change.trend === "neutral" && "bg-gray-100 text-gray-600"
          )}>
            {change.trend === "up" ? "↑" : change.trend === "down" ? "↓" : "–"}
          </span>
          {Math.abs(change.value)}% vs last week
        </motion.p>
      )}
    </motion.div>
  );
});
