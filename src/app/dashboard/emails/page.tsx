"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailCard } from "@/components/emails/email-card";
import { motion } from "motion/react";
import type { GeneratedEmail, EmailTone, EmailStatus } from "@/types";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  formatISO,
} from "date-fns";

const toneFilters: { tone: EmailTone; label: string }[] = [
  { tone: "professional", label: "Professional" },
  { tone: "casual", label: "Casual" },
  { tone: "enthusiastic", label: "Enthusiastic" },
];

const statusFilters: { status: EmailStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "sent", label: "Sent" },
];

type DatePreset = "today" | "week" | "month" | "all";

const datePresets: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

function EmailsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const activeTones = searchParams.get("tones")?.split(",").filter(Boolean) || [];
  const activeStatuses = searchParams.get("statuses")?.split(",").filter(Boolean) || [];
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
        router.push(`/dashboard/emails?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    async function fetchEmails() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (activeTones.length > 0) params.set("tones", activeTones.join(","));
        if (activeStatuses.length > 0) params.set("statuses", activeStatuses.join(","));
        if (searchQuery) params.set("search", searchQuery);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        params.set("limit", ITEMS_PER_PAGE.toString());
        params.set("offset", offset.toString());

        const response = await fetch(`/api/emails?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }

        const data = await response.json();
        setEmails(data.emails || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch emails");
        setEmails([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchEmails();
  }, [activeTones.join(","), activeStatuses.join(","), searchQuery, from, to, currentPage]);

  const toggleToneFilter = (tone: EmailTone) => {
    const current = new Set(activeTones);
    if (current.has(tone)) {
      current.delete(tone);
    } else {
      current.add(tone);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (current.size > 0) {
      params.set("tones", Array.from(current).join(","));
    } else {
      params.delete("tones");
    }
    params.delete("page");

    router.push(`/dashboard/emails?${params.toString()}`);
  };

  const toggleStatusFilter = (status: EmailStatus) => {
    const current = new Set(activeStatuses);
    if (current.has(status)) {
      current.delete(status);
    } else {
      current.add(status);
    }

    const params = new URLSearchParams(searchParams.toString());
    if (current.size > 0) {
      params.set("statuses", Array.from(current).join(","));
    } else {
      params.delete("statuses");
    }
    params.delete("page");

    router.push(`/dashboard/emails?${params.toString()}`);
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

    router.push(`/dashboard/emails?${params.toString()}`);
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
    router.push(`/dashboard/emails?${params.toString()}`);
  };

  const draftCount = emails.filter((e) => e.status === "draft").length;
  const sentCount = emails.filter((e) => e.status === "sent").length;

  return (
    <>
      <Header title="Emails" subtitle="AI-generated outreach emails from your signals" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Tone filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--text-tertiary)] mr-1">Tone:</span>
              <Button
                variant={activeTones.length === 0 ? "default" : "secondary"}
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("tones");
                  params.delete("page");
                  router.push(`/dashboard/emails?${params.toString()}`);
                }}
              >
                All Tones
              </Button>
              <div className="flex items-center gap-1">
                {toneFilters.map((filter) => {
                  const isActive = activeTones.includes(filter.tone);
                  return (
                    <button
                      key={filter.tone}
                      onClick={() => toggleToneFilter(filter.tone)}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/dashboard/emails?${params.toString()}`);
              }}
            >
              Refresh
            </Button>
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Status:</span>
            <Button
              variant={activeStatuses.length === 0 ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("statuses");
                params.delete("page");
                router.push(`/dashboard/emails?${params.toString()}`);
              }}
            >
              All Statuses
            </Button>
            <div className="flex items-center gap-1">
              {statusFilters.map((filter) => {
                const isActive = activeStatuses.includes(filter.status);
                return (
                  <button
                    key={filter.status}
                    onClick={() => toggleStatusFilter(filter.status)}
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
                placeholder="Subject or body..."
                className="w-48 px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label="Clear search"
                >
                  x
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
            {totalPages > 1 ? `${emails.length} of ${totalCount}` : `${emails.length}`} emails
          </Badge>
          <span className="text-[var(--border-default)]">·</span>
          <Badge variant="warning">{draftCount} drafts</Badge>
          <Badge variant="success">{sentCount} sent</Badge>
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

        {/* Emails list */}
        {!loading && !error && emails.length > 0 && (
          <>
            <div className="space-y-4">
              {emails.map((email, index) => (
                <EmailCard key={email.id} email={email} index={index} />
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
        {!loading && !error && emails.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No emails yet
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-8 leading-relaxed">
              {activeTones.length > 0 || activeStatuses.length > 0 || searchQuery || from
                ? "No emails match your current filters. Try adjusting your filters or clearing them to see all emails."
                : "Generate emails from your signals to start building your outreach library. Click 'Draft Email' on any signal to get started."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {(activeTones.length > 0 || activeStatuses.length > 0 || searchQuery || from) && (
                <Button
                  variant="default"
                  onClick={() => {
                    router.push("/dashboard/emails");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button
                variant={activeTones.length > 0 || activeStatuses.length > 0 || searchQuery || from ? "secondary" : "default"}
                onClick={() => router.push("/dashboard/signals")}
              >
                View Signals
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}

export default function EmailsPage() {
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
      <EmailsPageContent />
    </Suspense>
  );
}
