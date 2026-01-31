"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function ChartCard({ title, subtitle, children, className, index = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        "bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="w-full">{children}</div>
    </motion.div>
  );
}
