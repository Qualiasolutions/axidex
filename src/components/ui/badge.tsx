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
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide uppercase",
        {
          "bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]": variant === "default",
          "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20": variant === "success",
          "bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20": variant === "warning",
          "bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20": variant === "danger",
          "bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-border)]": variant === "accent",
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
  partnership: { label: "Partnership", variant: "accent" },
  product_launch: { label: "Launch", variant: "success" },
  leadership_change: { label: "Leadership", variant: "warning" },
};

export function SignalTypeBadge({ type }: { type: SignalType }) {
  const config = signalTypeConfig[type];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

const priorityConfig: Record<SignalPriority, { label: string; variant: BadgeProps["variant"] }> = {
  high: { label: "High", variant: "danger" },
  medium: { label: "Med", variant: "warning" },
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
