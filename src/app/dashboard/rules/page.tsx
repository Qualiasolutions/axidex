"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RuleCard } from "@/components/rules/rule-card";
import { motion } from "motion/react";
import type { AutomationRule } from "@/types";
import { Plus } from "lucide-react";

function RulesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const showActiveOnly = searchParams.get("active") === "true";

  const ITEMS_PER_PAGE = 20;
  const currentPage = parseInt(searchParams.get("page") || "1");
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  useEffect(() => {
    async function fetchRules() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (showActiveOnly) params.set("active", "true");
        params.set("limit", ITEMS_PER_PAGE.toString());
        params.set("offset", offset.toString());

        const response = await fetch(`/api/rules?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch rules");
        }

        const data = await response.json();
        setRules(data.rules || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch rules");
        setRules([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchRules();
  }, [showActiveOnly, currentPage]);

  const toggleActiveFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showActiveOnly) {
      params.delete("active");
    } else {
      params.set("active", "true");
    }
    params.delete("page");
    router.push(`/dashboard/rules?${params.toString()}`);
  };

  const handleToggleRule = async (rule: AutomationRule, isActive: boolean) => {
    try {
      const response = await fetch(`/api/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rule");
      }

      // Update local state
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, is_active: isActive } : r))
      );
    } catch (err) {
      console.error("Error toggling rule:", err);
    }
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/dashboard/rules?${params.toString()}`);
  };

  const activeCount = rules.filter((r) => r.is_active).length;
  const inactiveCount = rules.filter((r) => !r.is_active).length;

  return (
    <>
      <Header title="Rules" subtitle="Automation rules for signal handling" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Show:</span>
            <Button
              variant={!showActiveOnly ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                if (showActiveOnly) toggleActiveFilter();
              }}
            >
              All Rules
            </Button>
            <Button
              variant={showActiveOnly ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                if (!showActiveOnly) toggleActiveFilter();
              }}
            >
              Active Only
            </Button>
          </div>
          <Link href="/dashboard/rules/new">
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Rule
            </Button>
          </Link>
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
            {totalPages > 1 ? `${rules.length} of ${totalCount}` : `${rules.length}`} rules
          </Badge>
          <span className="text-[var(--border-default)]">·</span>
          <Badge variant="success">{activeCount} active</Badge>
          <Badge variant="default">{inactiveCount} inactive</Badge>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] animate-pulse"
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

        {/* Rules list */}
        {!loading && !error && rules.length > 0 && (
          <>
            <div className="space-y-4">
              {rules.map((rule, index) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={handleToggleRule}
                  index={index}
                />
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
        {!loading && !error && rules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No automation rules
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-8 leading-relaxed">
              {showActiveOnly
                ? "No active rules found. Create a new rule or enable an existing one."
                : "Create automation rules to automatically handle signals. Rules can generate emails, change statuses, or send notifications."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {showActiveOnly && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    router.push("/dashboard/rules");
                  }}
                >
                  Show All Rules
                </Button>
              )}
              <Link href="/dashboard/rules/new">
                <Button variant="default" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Rule
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}

export default function RulesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <RulesPageContent />
    </Suspense>
  );
}
