"use client";

import { motion } from "motion/react";
import type { Easing } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
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
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 text-center",
        "bg-background rounded-2xl border border-border/50",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
        className="relative size-16 rounded-2xl bg-gradient-to-br from-accent/20 to-orange-500/20 flex items-center justify-center mb-6"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl" />
        <Icon className="relative size-7 text-accent" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: easeOutExpo }}
        className="text-lg font-bold text-foreground mb-2"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: easeOutExpo }}
        className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed"
      >
        {description}
      </motion.p>
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: easeOutExpo }}
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
