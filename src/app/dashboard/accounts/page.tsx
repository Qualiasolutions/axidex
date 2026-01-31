"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountCard } from "@/components/accounts/account-card";
import { AccountCardSkeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useAccounts } from "@/hooks/use-accounts";

type SortBy = "last_signal" | "signal_count" | "company_name";

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "last_signal", label: "Recent Activity" },
  { value: "signal_count", label: "Signal Count" },
  { value: "company_name", label: "Company Name" },
];

function AccountsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const sortBy = (searchParams.get("sortBy") as SortBy) || "last_signal";
  const minSignals = parseInt(searchParams.get("minSignals") || "0");

  const [searchInput, setSearchInput] = useState(searchQuery);

  const ITEMS_PER_PAGE = 20;
  const currentPage = parseInt(searchParams.get("page") || "1");
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Use SWR hook for data fetching
  const { accounts, count: totalCount, isLoading, error } = useAccounts({
    search: searchQuery || undefined,
    sortBy: sortBy as "signals" | "priority" | "recent",
    minSignals: minSignals > 0 ? minSignals : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  });

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
        router.push(`/dashboard/accounts?${params.toString()}`);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, router, searchParams]);

  const setSortBy = (value: SortBy) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "last_signal") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }
    params.delete("page");
    router.push(`/dashboard/accounts?${params.toString()}`);
  };

  const setMinSignalsFilter = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 0) {
      params.delete("minSignals");
    } else {
      params.set("minSignals", value.toString());
    }
    params.delete("page");
    router.push(`/dashboard/accounts?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    router.push(`/dashboard/accounts?${params.toString()}`);
  };

  const totalSignals = accounts.reduce((sum, a) => sum + a.signal_count, 0);
  const highPriorityAccounts = accounts.filter((a) => a.high_priority_count > 0).length;

  return (
    <>
      <Header title="Accounts" subtitle="Companies aggregated from your signals" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Sort options */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[var(--text-tertiary)] mr-1">Sort by:</span>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === option.value
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/dashboard/accounts?${params.toString()}`);
              }}
            >
              Refresh
            </Button>
          </div>

          {/* Min signals filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Min signals:</span>
            {[0, 2, 5, 10].map((value) => (
              <button
                key={value}
                onClick={() => setMinSignalsFilter(value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  minSignals === value
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {value === 0 ? "All" : `${value}+`}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Search:</span>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Company name or domain..."
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
            {totalPages > 1 ? `${accounts.length} of ${totalCount}` : `${accounts.length}`} accounts
          </Badge>
          <span className="text-[var(--border-default)]">·</span>
          <Badge variant="accent">{totalSignals} total signals</Badge>
          <Badge variant="danger">{highPriorityAccounts} with high priority</Badge>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <AccountCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        {/* Accounts list */}
        {!isLoading && !error && accounts.length > 0 && (
          <>
            <div className="space-y-4">
              {accounts.map((account, index) => (
                <AccountCard key={account.company_domain || account.company_name} account={account} index={index} />
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
        {!isLoading && !error && accounts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No accounts found
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-8 leading-relaxed">
              {searchQuery || minSignals > 0
                ? "No accounts match your current filters. Try adjusting your filters or clearing them to see all accounts."
                : "Accounts are automatically created from your signals. Once you have signals for companies, they will appear here."}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {(searchQuery || minSignals > 0) && (
                <Button
                  variant="default"
                  onClick={() => {
                    router.push("/dashboard/accounts");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button
                variant={searchQuery || minSignals > 0 ? "secondary" : "default"}
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

export default function AccountsPage() {
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
      <AccountsPageContent />
    </Suspense>
  );
}
