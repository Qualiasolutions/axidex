"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignalCard } from "@/components/signals/signal-card";
import { motion } from "motion/react";
import type { Signal, SignalType, SignalPriority } from "@/types";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  formatISO,
} from "date-fns";

const signalFilters: { type: SignalType; label: string }[] = [
  { type: "hiring", label: "Hiring" },
  { type: "funding", label: "Funding" },
  { type: "expansion", label: "Expansion" },
  { type: "partnership", label: "Partnership" },
  { type: "product_launch", label: "Launch" },
  { type: "leadership_change", label: "Leadership" },
];

const priorityFilters: { priority: SignalPriority; label: string }[] = [
  { priority: "high", label: "High" },
  { priority: "medium", label: "Medium" },
  { priority: "low", label: "Low" },
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

  // Read current filters from URL
  const activeTypes = searchParams.get("types")?.split(",").filter(Boolean) || [];
  const activePriorities = searchParams.get("priorities")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("search") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  // Local state for search input (for debounce)
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const currentPage = parseInt(searchParams.get("page") || "1");
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Sync searchInput from URL on mount
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Debounce search input to URL (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) {
        params.set("search", searchInput);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset to page 1 when search changes

      // Only update if different from current URL
      if (params.toString() !== searchParams.toString()) {
        router.push(`/dashboard/signals?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch signals when filters change
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

  // Toggle type filter
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
    params.delete("page"); // Reset to page 1 when filters change

    router.push(`/dashboard/signals?${params.toString()}`);
  };

  // Toggle priority filter
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
    params.delete("page"); // Reset to page 1 when filters change

    router.push(`/dashboard/signals?${params.toString()}`);
  };

  // Set date range filter
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
    params.delete("page"); // Reset to page 1 when filters change

    router.push(`/dashboard/signals?${params.toString()}`);
  };

  // Determine active date preset
  const getActiveDatePreset = (): DatePreset => {
    if (!from && !to) return "all";

    const now = new Date();

    // Check if matches today
    const todayFrom = formatISO(startOfDay(now));
    const todayTo = formatISO(endOfDay(now));
    if (from.startsWith(todayFrom.split("T")[0]) && to.startsWith(todayTo.split("T")[0])) {
      return "today";
    }

    // Check if matches this week (approximate)
    const weekFrom = formatISO(startOfWeek(now));
    if (from.startsWith(weekFrom.split("T")[0])) {
      return "week";
    }

    // Check if matches this month (approximate)
    const monthFrom = formatISO(startOfMonth(now));
    if (from.startsWith(monthFrom.split("T")[0])) {
      return "month";
    }

    return "all";
  };

  const activeDatePreset = getActiveDatePreset();

  // Navigate to a specific page
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/dashboard/signals?${params.toString()}`);
  };

  // Calculate stats
  const highPriorityCount = signals.filter((s) => s.priority === "high").length;
  const newSignalsCount = signals.filter((s) => s.status === "new").length;

  return (
    <>
      <Header title="Signals" subtitle="Real-time buying signals from your target accounts" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Type filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--text-tertiary)] mr-1">Type:</span>
              <Button
                variant={activeTypes.length === 0 ? "default" : "secondary"}
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("types");
                  params.delete("page");
                  router.push(`/dashboard/signals?${params.toString()}`);
                }}
              >
                All Types
              </Button>
              <div className="flex items-center gap-1">
                {signalFilters.map((filter) => {
                  const isActive = activeTypes.includes(filter.type);
                  return (
                    <button
                      key={filter.type}
                      onClick={() => toggleTypeFilter(filter.type)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isActive
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  router.push(`/dashboard/signals?${params.toString()}`);
                }}
              >
                Refresh
              </Button>
              <Link href="/dashboard/settings">
                <Button variant="default" size="sm">
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Priority filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Priority:</span>
            <Button
              variant={activePriorities.length === 0 ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("priorities");
                params.delete("page");
                router.push(`/dashboard/signals?${params.toString()}`);
              }}
            >
              All Priorities
            </Button>
            <div className="flex items-center gap-1">
              {priorityFilters.map((filter) => {
                const isActive = activePriorities.includes(filter.priority);
                return (
                  <button
                    key={filter.priority}
                    onClick={() => togglePriorityFilter(filter.priority)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Search:</span>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Company name or title..."
                className="w-48 px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Time:</span>
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setDatePreset(preset.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeDatePreset === preset.value
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]"
        >
          <span className="text-xs text-[var(--text-tertiary)]">Showing</span>
          <Badge variant="default">
            {totalPages > 1 ? `${signals.length} of ${totalCount}` : `${signals.length}`} signals
          </Badge>
          <span className="text-[var(--border-default)]">·</span>
          <Badge variant="danger">{highPriorityCount} high priority</Badge>
          <Badge variant="accent">{newSignalsCount} new</Badge>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Signals list */}
        {!loading && !error && signals.length > 0 && (
          <>
            <div className="space-y-4">
              {signals.map((signal, index) => (
                <SignalCard key={signal.id} signal={signal} index={index} />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={!hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && signals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No signals detected
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-8 leading-relaxed">
              {activeTypes.length > 0 || activePriorities.length > 0 || searchQuery || from
                ? "No signals match your current filters or search. Try adjusting your filters or clearing them to see all signals."
                : "Axidex will automatically detect buying signals when you configure your signal sources. Add news feeds, job board scrapers, and funding announcement monitors to get started."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {(activeTypes.length > 0 || activePriorities.length > 0 || searchQuery || from) && (
                <Button
                  variant="default"
                  onClick={() => {
                    router.push("/dashboard/signals");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Link href="/dashboard/settings">
                <Button variant={activeTypes.length > 0 || activePriorities.length > 0 || searchQuery || from ? "secondary" : "default"}>
                  Configure Notifications
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
          <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <SignalsPageContent />
    </Suspense>
  );
}
