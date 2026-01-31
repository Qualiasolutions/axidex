import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

// Base Skeleton component
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted animate-pulse rounded",
        className
      )}
    />
  );
}

// SignalCard skeleton - matches SignalCard layout
export function SignalCardSkeleton() {
  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-subtle)]">
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-48" />
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// EmailCard skeleton - matches EmailCard layout
export function EmailCardSkeleton() {
  return (
    <div className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]">
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-32 mt-1" />
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Body preview */}
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// AccountCard skeleton - matches AccountCard layout
export function AccountCardSkeleton() {
  return (
    <div className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-32" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right space-y-1">
            <Skeleton className="h-6 w-8 ml-auto" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-3.5 w-16 ml-auto" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

// RuleCard skeleton - matches RuleCard layout
export function RuleCardSkeleton() {
  return (
    <div className="bg-[var(--bg-primary)] rounded-xl p-5 border border-[var(--border-subtle)]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <Skeleton className="h-6 w-10 rounded-full flex-shrink-0" />
        </div>

        {/* Triggers */}
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

// StatCard skeleton - matches StatsCard layout
export function StatCardSkeleton() {
  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl p-6 border border-[var(--border-subtle)]">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-10 w-16 mb-3" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
