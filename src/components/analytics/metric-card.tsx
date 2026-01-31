"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  index?: number;
}

export function MetricCard({ title, value, change, changeLabel, icon, index = 0 }: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) {
      return <Minus className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />;
    }
    if (change > 0) {
      return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
    }
    return <TrendingDown className="w-3.5 h-3.5 text-red-600" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) {
      return "text-[var(--text-tertiary)]";
    }
    return change > 0 ? "text-emerald-600" : "text-red-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">{title}</p>
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {change > 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-[var(--text-tertiary)]">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-tertiary)]">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
