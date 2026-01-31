"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RuleCard } from "@/components/rules/rule-card";
import { RuleCardSkeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import type { AutomationRule, SignalType, SignalPriority } from "@/types";
import { cn } from "@/lib/utils";
import { useRules } from "@/hooks/use-rules";
import {
  Plus,
  Zap,
  Mail,
  Bell,
  TrendingUp,
  Building2,
  Filter,
  Search,
  Sparkles,
  X,
} from "lucide-react";

// Rule templates for quick creation
const RULE_TEMPLATES = [
  {
    id: "high-priority-email",
    name: "Auto-draft for High Priority",
    description: "Draft emails automatically for high priority signals",
    icon: Mail,
    color: "from-blue-500 to-indigo-500",
    trigger_conditions: {
      priorities: ["high"] as SignalPriority[],
    },
    actions: [{ type: "generate_email" as const, config: {} }],
  },
  {
    id: "funding-notify",
    name: "Funding Alert",
    description: "Get notified when target companies raise funding",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
    trigger_conditions: {
      signal_types: ["funding"] as SignalType[],
    },
    actions: [{ type: "notify" as const, config: {} }],
  },
  {
    id: "hiring-email",
    name: "Hiring Outreach",
    description: "Draft outreach when companies are actively hiring",
    icon: Building2,
    color: "from-purple-500 to-violet-500",
    trigger_conditions: {
      signal_types: ["hiring"] as SignalType[],
      priorities: ["high", "medium"] as SignalPriority[],
    },
    actions: [{ type: "generate_email" as const, config: {} }],
  },
  {
    id: "all-signals-notify",
    name: "Notify on All Signals",
    description: "Get notified for every new signal detected",
    icon: Bell,
    color: "from-amber-500 to-orange-500",
    trigger_conditions: {},
    actions: [{ type: "notify" as const, config: {} }],
  },
];

function RulesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);

  const showActiveOnly = searchParams.get("active") === "true";

  const ITEMS_PER_PAGE = 20;
  const currentPage = parseInt(searchParams.get("page") || "1");
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Use SWR hook for data fetching
  const { rules, count: totalCount, isLoading, error, mutate } = useRules({
    active: showActiveOnly ? true : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchRules = useCallback(async () => {
    // Revalidate SWR cache
    await mutate();
  }, [mutate]);

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
    // Store current state for rollback
    const previousRules = rules;
    const previousCount = totalCount;

    // Optimistic update
    mutate(
      {
        rules: rules.map((r) => (r.id === rule.id ? { ...r, is_active: isActive } : r)),
        count: totalCount,
      },
      { revalidate: false }
    );

    try {
      const response = await fetch(`/api/rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rule");
      }

      // Revalidate to confirm
      mutate();
      toast.success(isActive ? "Rule activated" : "Rule paused");
    } catch (err) {
      console.error("Error toggling rule:", err);
      toast.error("Failed to update rule");
      // Rollback on error
      mutate(
        { rules: previousRules, count: previousCount },
        { revalidate: false }
      );
    }
  };

  const handleDeleteRule = async (rule: AutomationRule) => {
    if (!confirm(`Delete "${rule.name}"? This action cannot be undone.`)) {
      return;
    }

    // Store current state for rollback
    const previousRules = rules;
    const previousCount = totalCount;

    // Optimistically remove rule from list
    mutate(
      {
        rules: rules.filter((r) => r.id !== rule.id),
        count: totalCount - 1,
      },
      { revalidate: false }
    );

    try {
      const response = await fetch(`/api/rules/${rule.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete rule");
      }

      // Revalidate to confirm
      mutate();
      toast.success("Rule deleted");
    } catch (err) {
      console.error("Error deleting rule:", err);
      toast.error("Failed to delete rule");
      // Rollback on error
      mutate(
        { rules: previousRules, count: previousCount },
        { revalidate: false }
      );
    }
  };

  const handleDuplicateRule = async (rule: AutomationRule) => {
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${rule.name} (Copy)`,
          description: rule.description,
          trigger_conditions: rule.trigger_conditions,
          actions: rule.actions,
          is_active: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate rule");
      }

      const data = await response.json();
      // Optimistically update SWR cache
      mutate();
      toast.success("Rule duplicated");
    } catch (err) {
      console.error("Error duplicating rule:", err);
      toast.error("Failed to duplicate rule");
    }
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    const template = RULE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setCreatingFromTemplate(templateId);

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          trigger_conditions: template.trigger_conditions,
          actions: template.actions,
          is_active: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create rule");
      }

      const data = await response.json();
      // Optimistically update SWR cache
      mutate();
      setShowTemplates(false);
      toast.success(`Created "${template.name}" rule`);
    } catch (err) {
      console.error("Error creating rule from template:", err);
      toast.error("Failed to create rule");
    } finally {
      setCreatingFromTemplate(null);
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
  const filteredRules = searchQuery
    ? rules.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rules;

  return (
    <>
      <Header title="Rules" subtitle="Automate your signal workflow" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Hero section when no rules */}
        {!isLoading && rules.length === 0 && !showActiveOnly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/10 via-orange-500/5 to-transparent border border-accent/20 p-8"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-orange-500">
                  <Zap className="size-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Automate Your Workflow</h2>
                  <p className="text-sm text-muted-foreground">Set up rules to handle signals automatically</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-xl">
                Rules let you automatically draft emails, send notifications, or update signal statuses
                based on conditions you define. Start with a template or create your own.
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={() => setShowTemplates(true)} className="gap-2">
                  <Sparkles className="size-4" />
                  Use Template
                </Button>
                <Link href="/dashboard/rules/new">
                  <Button variant="outline" className="gap-2">
                    <Plus className="size-4" />
                    Create Custom
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Template modal */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowTemplates(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-background rounded-2xl border border-border shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Quick Start Templates</h3>
                    <p className="text-sm text-muted-foreground">Choose a template to get started quickly</p>
                  </div>
                  <button
                    onClick={() => setShowTemplates(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="size-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {RULE_TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    const isCreating = creatingFromTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleCreateFromTemplate(template.id)}
                        disabled={!!creatingFromTemplate}
                        className={cn(
                          "w-full flex items-start gap-4 p-4 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 transition-all text-left",
                          isCreating && "opacity-50"
                        )}
                      >
                        <div className={cn("p-3 rounded-xl bg-gradient-to-br shrink-0", template.color)}>
                          <Icon className="size-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                        </div>
                        {isCreating ? (
                          <span className="text-xs text-muted-foreground">Creating...</span>
                        ) : (
                          <Plus className="size-5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="p-4 border-t border-border">
                  <Link href="/dashboard/rules/new" onClick={() => setShowTemplates(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <Plus className="size-4" />
                      Create Custom Rule
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        {(rules.length > 0 || showActiveOnly) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rules..."
                  className="pl-9 pr-4 py-2 w-64 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" />
                <Button
                  variant={!showActiveOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (showActiveOnly) toggleActiveFilter();
                  }}
                >
                  All
                </Button>
                <Button
                  variant={showActiveOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!showActiveOnly) toggleActiveFilter();
                  }}
                >
                  Active Only
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} className="gap-2">
                <Sparkles className="size-4" />
                Templates
              </Button>
              <Link href="/dashboard/rules/new">
                <Button size="sm" className="gap-2">
                  <Plus className="size-4" />
                  New Rule
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stats bar */}
        {rules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <Badge variant="default" className="gap-1.5">
              <Zap className="size-3" />
              {totalCount} rule{totalCount !== 1 ? "s" : ""}
            </Badge>
            <Badge variant="success" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {activeCount} active
            </Badge>
            <Badge variant="default" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-gray-400" />
              {rules.length - activeCount} paused
            </Badge>
          </motion.div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <RuleCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-red-50 border border-red-200 rounded-2xl"
          >
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="ghost" size="sm" onClick={fetchRules} className="mt-2 text-red-600">
              Try again
            </Button>
          </motion.div>
        )}

        {/* Rules list */}
        {!isLoading && !error && filteredRules.length > 0 && (
          <>
            <div className="space-y-4">
              {filteredRules.map((rule, index) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onToggle={handleToggleRule}
                  onDelete={handleDeleteRule}
                  onDuplicate={handleDuplicateRule}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 pt-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Empty search results */}
        {!isLoading && !error && rules.length > 0 && filteredRules.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Search className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No rules found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No rules match "{searchQuery}"
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </motion.div>
        )}

        {/* Empty state for active filter */}
        {!isLoading && !error && rules.length === 0 && showActiveOnly && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center bg-background rounded-2xl border border-border"
          >
            <Zap className="size-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No active rules</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new rule or activate an existing one
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={toggleActiveFilter}>
                Show All Rules
              </Button>
              <Link href="/dashboard/rules/new">
                <Button className="gap-2">
                  <Plus className="size-4" />
                  New Rule
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
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <RulesPageContent />
    </Suspense>
  );
}
