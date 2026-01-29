import { cn } from "@/lib/utils";
import type { SignalType, SignalPriority, SignalStatus } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-[#1e293b] text-[#94a3b8]": variant === "default",
          "bg-green-900/50 text-green-400": variant === "success",
          "bg-yellow-900/50 text-yellow-400": variant === "warning",
          "bg-red-900/50 text-red-400": variant === "danger",
          "bg-blue-900/50 text-blue-400": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function SignalTypeBadge({ type }: { type: SignalType }) {
  const config: Record<SignalType, { label: string; variant: BadgeProps["variant"] }> = {
    hiring: { label: "Hiring", variant: "info" },
    funding: { label: "Funding", variant: "success" },
    expansion: { label: "Expansion", variant: "warning" },
    partnership: { label: "Partnership", variant: "info" },
    product_launch: { label: "Product Launch", variant: "success" },
    leadership_change: { label: "Leadership", variant: "warning" },
  };

  const { label, variant } = config[type];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: SignalPriority }) {
  const config: Record<SignalPriority, { label: string; variant: BadgeProps["variant"] }> = {
    high: { label: "High", variant: "danger" },
    medium: { label: "Medium", variant: "warning" },
    low: { label: "Low", variant: "default" },
  };

  const { label, variant } = config[priority];
  return <Badge variant={variant}>{label}</Badge>;
}

export function StatusBadge({ status }: { status: SignalStatus }) {
  const config: Record<SignalStatus, { label: string; variant: BadgeProps["variant"] }> = {
    new: { label: "New", variant: "info" },
    reviewed: { label: "Reviewed", variant: "default" },
    contacted: { label: "Contacted", variant: "warning" },
    converted: { label: "Converted", variant: "success" },
    dismissed: { label: "Dismissed", variant: "default" },
  };

  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
