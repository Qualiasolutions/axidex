import { cn } from "@/lib/utils";
import type { SignalType, SignalPriority, SignalStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-colors",
        {
          "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]": variant === "default",
          "bg-emerald-50 text-emerald-700 border border-emerald-100": variant === "success",
          "bg-amber-50 text-amber-700 border border-amber-100": variant === "warning",
          "bg-red-50 text-red-700 border border-red-100": variant === "danger",
          "bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/10": variant === "accent",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

const signalTypeConfig: Record<SignalType, { label: string; variant: BadgeProps["variant"] }> = {
  hiring: { label: "Hiring", variant: "accent" },
  funding: { label: "Funding", variant: "success" },
  expansion: { label: "Expansion", variant: "warning" },
  partnership: { label: "Partnership", variant: "default" },
  product_launch: { label: "Launch", variant: "success" },
  leadership_change: { label: "Leadership", variant: "default" },
};

export function SignalTypeBadge({ type }: { type: SignalType }) {
  const config = signalTypeConfig[type];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const priorityConfig: Record<SignalPriority, { label: string; variant: BadgeProps["variant"] }> = {
  high: { label: "High", variant: "danger" },
  medium: { label: "Medium", variant: "warning" },
  low: { label: "Low", variant: "default" },
};

export function PriorityBadge({ priority }: { priority: SignalPriority }) {
  const config = priorityConfig[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const statusConfig: Record<SignalStatus, { label: string; variant: BadgeProps["variant"] }> = {
  new: { label: "New", variant: "accent" },
  reviewed: { label: "Reviewed", variant: "default" },
  contacted: { label: "Contacted", variant: "warning" },
  converted: { label: "Won", variant: "success" },
  dismissed: { label: "Dismissed", variant: "default" },
};

export function StatusBadge({ status }: { status: SignalStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
