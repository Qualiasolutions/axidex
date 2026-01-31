"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { SignalCard } from "@/components/signals/signal-card";
import { motion } from "motion/react";
import type { Easing } from "motion/react";
import type { Signal, SignalType, SignalPriority } from "@/types";
import { cn } from "@/lib/utils";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  formatISO,
} from "date-fns";
import {
  Search,
  Filter,
  Radio,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  AlertCircle,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

const signalFilters: { type: SignalType; label: string; color: string }[] = [
  { type: "hiring", label: "Hiring", color: "bg-blue-500" },
  { type: "funding", label: "Funding", color: "bg-emerald-500" },
  { type: "expansion", label: "Expansion", color: "bg-amber-500" },
  { type: "partnership", label: "Partnership", color: "bg-purple-500" },
  { type: "product_launch", label: "Launch", color: "bg-pink-500" },
  { type: "leadership_change", label: "Leadership", color: "bg-indigo-500" },
];

const priorityFilters: { priority: SignalPriority; label: string; color: string }[] = [
  { priority: "high", label: "High", color: "text-red-600 bg-red-50" },
  { priority: "medium", label: "Medium", color: "text-amber-600 bg-amber-50" },
  { priority: "low", label: "Low", color: "text-gray-600 bg-gray-50" },
];

type DatePreset = "today" | "week" | "month" | "all";

const datePresets: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

function SignalsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const activeTypes = searchParams.get("types")?.split(",").filter(Boolean) || [];
  const activePriorities = searchParams.get("priorities")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);

  const ITEMS_PER_PAGE = 20;
  const currentPage = parseInt(searchParams.get("page") || "1");
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        params.set("search", searchInput);
      } else {
        params.delete("search");
      }
      params.delete("page");

      if (params.toString() !== searchParams.toString()) {
        router.push(`/dashboard/signals?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    async function fetchSignals() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (activeTypes.length > 0) params.set("types", activeTypes.join(","));
        if (activePriorities.length > 0) params.set("priorities", activePriorities.join(","));
        if (searchQuery) params.set("search", searchQuery);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        params.set("limit", ITEMS_PER_PAGE.toString());
        params.set("offset", offset.toString());

        const response = await fetch(`/api/signals?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch signals");
        }

        const data = await response.json();
        setSignals(data.signals || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch signals");
        setSignals([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchSignals();
  }, [activeTypes.join(","), activePriorities.join(","), searchQuery, from, to, currentPage]);

  const toggleTypeFilter = (type: SignalType) => {
    const current = new Set(activeTypes);
    if (current.has(type)) {
      current.delete(type);
    } else {
      current.add(type);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (current.size > 0) {
      params.set("types", Array.from(current).join(","));
    } else {
      params.delete("types");
    }
    params.delete("page");
    router.push(`/dashboard/signals?${params.toString()}`);
  };

  const togglePriorityFilter = (priority: SignalPriority) => {
    const current = new Set(activePriorities);
    if (current.has(priority)) {
      current.delete(priority);
    } else {
      current.add(priority);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (current.size > 0) {
      params.set("priorities", Array.from(current).join(","));
    } else {
      params.delete("priorities");
    }
    params.delete("page");
    router.push(`/dashboard/signals?${params.toString()}`);
  };

  const setDatePreset = (preset: DatePreset) => {
    const params = new URLSearchParams(searchParams.toString());

    if (preset === "all") {
      params.delete("from");
      params.delete("to");
    } else {
      const now = new Date();
      let fromDate: Date;
      let toDate: Date;

      switch (preset) {
        case "today":
          fromDate = startOfDay(now);
          toDate = endOfDay(now);
          break;
        case "week":
          fromDate = startOfWeek(now);
          toDate = endOfWeek(now);
          break;
        case "month":
          fromDate = startOfMonth(now);
          toDate = endOfMonth(now);
          break;
        default:
          fromDate = startOfDay(now);
          toDate = endOfDay(now);
      }

      params.set("from", formatISO(fromDate));
      params.set("to", formatISO(toDate));
    }
    params.delete("page");
    router.push(`/dashboard/signals?${params.toString()}`);
  };

  const getActiveDatePreset = (): DatePreset => {
    if (!from && !to) return "all";

    const now = new Date();

    const todayFrom = formatISO(startOfDay(now));
    const todayTo = formatISO(endOfDay(now));
    if (from.startsWith(todayFrom.split("T")[0]) && to.startsWith(todayTo.split("T")[0])) {
      return "today";
    }

    const weekFrom = formatISO(startOfWeek(now));
    if (from.startsWith(weekFrom.split("T")[0])) {
      return "week";
    }

    const monthFrom = formatISO(startOfMonth(now));
    if (from.startsWith(monthFrom.split("T")[0])) {
      return "month";
    }

    return "all";
  };

  const activeDatePreset = getActiveDatePreset();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/dashboard/signals?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/dashboard/signals");
  };

  const hasActiveFilters = activeTypes.length > 0 || activePriorities.length > 0 || searchQuery || from;
  const highPriorityCount = signals.filter((s) => s.priority === "high").length;
  const newSignalsCount = signals.filter((s) => s.status === "new").length;

  return (
    <>
      <Header title="Signals" subtitle="Real-time buying signals from your target accounts" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="bg-background rounded-2xl border border-border/50 p-5 space-y-5"
        >
          {/* Search and Actions Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search companies or signals..."
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  Clear filters
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.refresh()}
                className="text-muted-foreground"
              >
                <RefreshCw className="size-4 mr-1.5" />
                Refresh
              </Button>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm">
                  <Settings className="size-4 mr-1.5" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Icon */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="size-4" />
              <span className="text-xs font-medium">Filters</span>
            </div>

            <div className="h-5 w-px bg-border/60" />

            {/* Signal Type Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {signalFilters.map((filter) => {
                const isActive = activeTypes.includes(filter.type);
                return (
                  <button
                    key={filter.type}
                    onClick={() => toggleTypeFilter(filter.type)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                      isActive
                        ? "bg-accent text-white shadow-sm"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <div className={cn("size-1.5 rounded-full", filter.color)} />
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-border/60" />

            {/* Priority Filters */}
            <div className="flex items-center gap-1.5">
              {priorityFilters.map((filter) => {
                const isActive = activePriorities.includes(filter.priority);
                return (
                  <button
                    key={filter.priority}
                    onClick={() => togglePriorityFilter(filter.priority)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                      isActive
                        ? "bg-accent text-white shadow-sm"
                        : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-border/60" />

            {/* Date Presets */}
            <div className="flex items-center gap-1.5">
              {datePresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setDatePreset(preset.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                    activeDatePreset === preset.value
                      ? "bg-foreground text-background shadow-sm"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: easeOutExpo }}
          className="flex items-center gap-4 flex-wrap"
        >
          <div className="flex items-center gap-2 px-4 py-2.5 bg-background rounded-xl border border-border/50">
            <Radio className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">{totalCount}</span>
            <span className="text-xs text-muted-foreground">signals</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-xl border border-red-100">
            <Target className="size-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700">{highPriorityCount}</span>
            <span className="text-xs text-red-600">high priority</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 rounded-xl border border-accent/20">
            <Sparkles className="size-4 text-accent" />
            <span className="text-sm font-semibold text-accent">{newSignalsCount}</span>
            <span className="text-xs text-accent/80">new</span>
          </div>

          {totalPages > 1 && (
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background rounded-2xl p-6 border border-border/50 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="size-12 bg-muted rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-2xl"
          >
            <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="size-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">Failed to load signals</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.refresh()} className="ml-auto text-red-600">
              Retry
            </Button>
          </motion.div>
        )}

        {/* Signals List */}
        {!loading && !error && signals.length > 0 && (
          <>
            <div className="space-y-4">
              {signals.map((signal, index) => (
                <SignalCard key={signal.id} signal={signal} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: easeOutExpo }}
                className="flex items-center justify-center gap-2 pt-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1 px-3">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={cn(
                          "size-8 rounded-lg text-xs font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:bg-secondary"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && signals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center bg-background rounded-2xl border border-border/50"
          >
            <div className="size-16 rounded-2xl bg-gradient-to-br from-accent/20 to-orange-500/20 flex items-center justify-center mb-6">
              <Radio className="size-7 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No signals detected</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
              {hasActiveFilters
                ? "No signals match your current filters. Try adjusting or clearing your filters."
                : "Axidex will automatically detect buying signals when you configure your signal sources."}
            </p>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button onClick={clearAllFilters}>Clear Filters</Button>
              )}
              <Link href="/dashboard/settings">
                <Button variant={hasActiveFilters ? "outline" : "default"}>
                  <Settings className="size-4 mr-1.5" />
                  Configure Sources
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}

export default function SignalsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <SignalsPageContent />
    </Suspense>
  );
}
