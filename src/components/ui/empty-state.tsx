"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode; // Action buttons
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        "bg-background rounded-2xl border border-border/50",
        className
      )}
    >
      <div className="size-16 rounded-2xl bg-gradient-to-br from-accent/20 to-orange-500/20 flex items-center justify-center mb-6">
        <Icon className="size-7 text-accent" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {children && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {children}
        </div>
      )}
    </motion.div>
  );
}
