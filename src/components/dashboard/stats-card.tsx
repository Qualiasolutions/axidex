import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  className?: string;
}

export function StatsCard({ title, value, change, icon: Icon, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-[#1e293b] rounded-lg p-5 border border-[#334155]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#64748b] font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p
              className={cn("text-xs mt-1 flex items-center gap-1", {
                "text-green-400": change.trend === "up",
                "text-red-400": change.trend === "down",
                "text-[#64748b]": change.trend === "neutral",
              })}
            >
              {change.trend === "up" && "↑"}
              {change.trend === "down" && "↓"}
              {change.value}% from last week
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#00a4ac]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#00a4ac]" />
        </div>
      </div>
    </div>
  );
}
