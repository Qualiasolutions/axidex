"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  Check,
  X,
  Play,
  Clock,
  RefreshCw,
  Building2,
  Rss,
  Briefcase,
  Newspaper,
  Link,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Plus,
} from "lucide-react";
import type {
  ScraperConfig,
  ScrapeRun,
  ScraperStatusResponse,
} from "@/types/scraper";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  // Configurable sources (stored in DB)
  {
    id: "source_techcrunch",
    label: "TechCrunch",
    description: "Funding rounds & startup news",
    icon: Rss,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    id: "source_indeed",
    label: "Job Boards",
    description: "Indeed job postings",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    id: "source_linkedin",
    label: "LinkedIn",
    description: "LinkedIn jobs (Bright Data)",
    icon: Link,
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    requiresCredentials: true,
  },
  {
    id: "source_company_newsrooms",
    label: "Newsrooms",
    description: "Press releases & announcements",
    icon: Newspaper,
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
];

// Always-on sources (no DB config needed - free APIs)
const ALWAYS_ON_SOURCES = [
  {
    id: "hackernews",
    label: "Hacker News",
    description: "Top tech & startup stories",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "googlenews",
    label: "Google News",
    description: "Company-specific news articles",
    icon: Newspaper,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "prnewswire",
    label: "PR Newswire",
    description: "Official press releases",
    icon: Rss,
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-500/10",
  },
  {
    id: "globenewswire",
    label: "GlobeNewswire",
    description: "More press releases",
    icon: Rss,
    color: "from-teal-500 to-emerald-500",
    bgColor: "bg-teal-500/10",
  },
  {
    id: "techblogs",
    label: "Tech Blogs",
    description: "VentureBeat, Wired, Ars Technica",
    icon: Newspaper,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "producthunt",
    label: "Product Hunt",
    description: "Daily product launches",
    icon: TrendingUp,
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "reddit",
    label: "Reddit",
    description: "r/startups, r/SaaS, r/Entrepreneur",
    icon: Rss,
    color: "from-orange-600 to-red-600",
    bgColor: "bg-orange-600/10",
  },
];

const DEFAULT_COMPANIES = [
  "Stripe",
  "Shopify",
  "HubSpot",
  "Salesforce",
  "Twilio",
];

const INTERVAL_OPTIONS = [
  { value: 15, label: "15 min", description: "Real-time monitoring" },
  { value: 30, label: "30 min", description: "Recommended" },
  { value: 60, label: "1 hour", description: "Standard" },
  { value: 120, label: "2 hours", description: "Light usage" },
  { value: 360, label: "6 hours", description: "Daily check-ins" },
  { value: 720, label: "12 hours", description: "Twice daily" },
  { value: 1440, label: "24 hours", description: "Once daily" },
];

// Animated progress ring component
function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/50"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-lg font-bold text-foreground"
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
}

// Company chip component
function CompanyChip({
  company,
  onRemove,
  index,
}: {
  company: string;
  onRemove: () => void;
  index: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -10 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 transition-all duration-200"
    >
      <Building2 className="w-3.5 h-3.5 opacity-70" />
      {company}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded-full hover:bg-primary/20 transition-colors opacity-60 group-hover:opacity-100"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  );
}

// Source card component
function SourceCard({
  source,
  isEnabled,
  onToggle,
  index,
}: {
  source: (typeof SOURCE_OPTIONS)[0];
  isEnabled: boolean;
  onToggle: () => void;
  index: number;
}) {
  const Icon = source.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onToggle}
      className={cn(
        "relative group flex flex-col p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden",
        isEnabled
          ? "border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 shadow-sm"
          : "border-border hover:border-muted-foreground/30 bg-card hover:bg-secondary/50"
      )}
    >
      {/* Animated background glow */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={cn(
            "p-2.5 rounded-lg transition-all duration-300",
            isEnabled ? source.bgColor : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5 transition-colors",
              isEnabled ? "text-foreground" : "text-muted-foreground"
            )}
          />
        </div>

        {/* Toggle indicator */}
        <div
          className={cn(
            "relative w-10 h-6 rounded-full transition-all duration-300 flex-shrink-0",
            isEnabled ? "bg-primary" : "bg-muted"
          )}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ x: isEnabled ? 20 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </div>

      <div className="relative mt-3 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-semibold transition-colors",
              isEnabled ? "text-foreground" : "text-foreground/80"
            )}
          >
            {source.label}
          </span>
          {source.requiresCredentials && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border border-amber-500/20">
              PRO
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{source.description}</p>
      </div>

      {/* Hover effect line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100",
          `bg-gradient-to-r ${source.color}`
        )}
      />
    </motion.button>
  );
}

// Status indicator component
function StatusIndicator({
  status,
  label,
  signalCount,
}: {
  status: "pending" | "running" | "completed" | "failed";
  label: string;
  signalCount?: number;
}) {
  const statusConfig = {
    pending: {
      color: "bg-muted text-muted-foreground",
      icon: Clock,
      pulse: false,
    },
    running: {
      color: "bg-primary/10 text-primary border-primary/20",
      icon: Loader2,
      pulse: true,
    },
    completed: {
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: Check,
      pulse: false,
    },
    failed: {
      color: "bg-red-500/10 text-red-600 border-red-500/20",
      icon: AlertCircle,
      pulse: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border",
        config.color
      )}
    >
      <Icon
        className={cn("w-3.5 h-3.5", status === "running" && "animate-spin")}
      />
      <span>{label}</span>
      {signalCount !== undefined && signalCount > 0 && (
        <span className="font-bold">{signalCount}</span>
      )}
      {config.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
      )}
    </motion.div>
  );
}

export function ScraperConfigSection() {
  const [config, setConfig] = useState<ScraperConfig | null>(null);
  const [latestRun, setLatestRun] = useState<ScrapeRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [nextScheduledRun, setNextScheduledRun] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCompany, setNewCompany] = useState("");
  const [triggering, setTriggering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/scraper/status");
      const data: ScraperStatusResponse = await response.json();

      if (data.config) {
        setConfig(data.config);
      }
      setLatestRun(data.latestRun);
      setIsRunning(data.isRunning);
      setNextScheduledRun(data.nextScheduledRun);
    } catch (err) {
      console.error("Error loading scraper status:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStatus();

    const interval = setInterval(() => {
      if (isRunning) {
        loadStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, loadStatus]);

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/scraper/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_companies: config.target_companies,
          signal_keywords: config.signal_keywords,
          source_techcrunch: config.source_techcrunch,
          source_indeed: config.source_indeed,
          source_linkedin: config.source_linkedin,
          source_company_newsrooms: config.source_company_newsrooms,
          scrape_interval_minutes: config.scrape_interval_minutes,
          auto_scrape_enabled: config.auto_scrape_enabled,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setConfig(data.config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      setError("Failed to save configuration");
    }

    setSaving(false);
  };

  const handleTriggerScrape = async () => {
    setTriggering(true);
    setError(null);

    try {
      const response = await fetch("/api/scraper/trigger", {
        method: "POST",
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setIsRunning(true);
        loadStatus();
      }
    } catch {
      setError("Failed to trigger scrape");
    }

    setTriggering(false);
  };

  const addCompany = () => {
    if (!config || !newCompany.trim()) return;
    const companies = config.target_companies ?? [];
    if (companies.includes(newCompany.trim())) {
      setNewCompany("");
      return;
    }
    setConfig({
      ...config,
      target_companies: [...companies, newCompany.trim()],
    });
    setNewCompany("");
    inputRef.current?.focus();
  };

  const removeCompany = (company: string) => {
    if (!config) return;
    const companies = config.target_companies ?? [];
    setConfig({
      ...config,
      target_companies: companies.filter((c) => c !== company),
    });
  };

  const toggleSource = (sourceId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      [sourceId]: !config[sourceId as keyof ScraperConfig],
    });
  };

  const getProgressPercentage = () => {
    if (!latestRun?.progress || Object.keys(latestRun.progress).length === 0)
      return 0;
    const sources = Object.values(latestRun.progress);
    const completed = sources.filter((s) => s.status === "completed").length;
    return Math.round((completed / sources.length) * 100);
  };

  const getTimeRemaining = () => {
    if (!latestRun?.estimated_duration_seconds || !latestRun.started_at)
      return null;
    const started = new Date(latestRun.started_at).getTime();
    const now = Date.now();
    const elapsed = (now - started) / 1000;
    const remaining = Math.max(
      0,
      latestRun.estimated_duration_seconds - elapsed
    );

    if (remaining < 60) return `${Math.round(remaining)}s`;
    return `${Math.round(remaining / 60)}m ${Math.round(remaining % 60)}s`;
  };

  const getElapsedTime = () => {
    if (!latestRun?.started_at) return null;
    const started = new Date(latestRun.started_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - started) / 1000);

    if (elapsed < 60) return `${elapsed}s`;
    return `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl p-8"
      >
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">
            Loading configuration...
          </p>
        </div>
      </motion.div>
    );
  }

  if (!config) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-2xl p-8"
      >
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground text-center">
            Failed to load scraper configuration
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header with gradient accent */}
      <div className="relative p-6 border-b border-border bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className={cn(
                  "p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20",
                  isRunning && "animate-pulse"
                )}
              >
                <RefreshCw
                  className={cn(
                    "w-6 h-6 text-primary",
                    isRunning && "animate-spin"
                  )}
                />
              </div>
              {isRunning && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                Signal Scraper
                <Sparkles className="w-4 h-4 text-primary" />
              </h2>
              <p className="text-sm text-muted-foreground">
                Monitor companies for buying signals in real-time
              </p>
            </div>
          </div>

          <Button
            onClick={handleTriggerScrape}
            disabled={isRunning || triggering}
            className={cn(
              "relative overflow-hidden",
              isRunning && "bg-primary/80"
            )}
          >
            {triggering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Now
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Live Scrape Status */}
        <AnimatePresence mode="wait">
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative overflow-hidden"
            >
              <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-primary/10 border border-primary/20">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
                </div>

                <div className="flex items-center gap-6">
                  <ProgressRing progress={getProgressPercentage()} />

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">
                          Scraping in progress
                        </span>
                      </div>
                      {getTimeRemaining() && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>~{getTimeRemaining()} remaining</span>
                        </div>
                      )}
                    </div>

                    {/* Source status pills */}
                    <div className="flex flex-wrap gap-2">
                      {latestRun?.progress &&
                        Object.entries(latestRun.progress).map(
                          ([source, data]) => (
                            <StatusIndicator
                              key={source}
                              status={data.status}
                              label={source}
                              signalCount={data.signals}
                            />
                          )
                        )}
                    </div>

                    {/* Elapsed time */}
                    {getElapsedTime() && (
                      <p className="text-xs text-muted-foreground">
                        Elapsed: {getElapsedTime()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Last run summary */}
        {!isRunning && latestRun && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-muted/30 border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Last scrape completed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {latestRun.completed_at &&
                      new Date(latestRun.completed_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-foreground">
                    {latestRun.total_signals}
                  </span>
                  <span className="text-muted-foreground">signals</span>
                </div>
                {(latestRun.ai_enriched_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>{latestRun.ai_enriched_count} AI-enriched</span>
                  </div>
                )}
              </div>
            </div>
            {nextScheduledRun && (
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Next scheduled: {new Date(nextScheduledRun).toLocaleString()}
              </div>
            )}
          </motion.div>
        )}

        {/* Auto-scrape toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <RefreshCw className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Automatic Scraping
                </p>
                <p className="text-sm text-muted-foreground">
                  {config.auto_scrape_enabled
                    ? `Running every ${config.scrape_interval_minutes} minutes`
                    : "Disabled - manual runs only"}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setConfig({
                  ...config,
                  auto_scrape_enabled: !config.auto_scrape_enabled,
                })
              }
              className={cn(
                "relative w-12 h-7 rounded-full transition-all duration-300",
                config.auto_scrape_enabled ? "bg-primary" : "bg-muted"
              )}
            >
              <motion.span
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{ x: config.auto_scrape_enabled ? 24 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Interval selector */}
          <AnimatePresence>
            {config.auto_scrape_enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Scrape Interval
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {INTERVAL_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setConfig({
                          ...config,
                          scrape_interval_minutes: option.value,
                        })
                      }
                      className={cn(
                        "p-2 rounded-lg text-center transition-all duration-200 border",
                        config.scrape_interval_minutes === option.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/50 hover:bg-muted border-border"
                      )}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Target Companies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-medium text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Target Companies
              <span className="text-xs text-muted-foreground font-normal">
                ({(config.target_companies ?? []).length})
              </span>
            </label>
            <button
              onClick={() =>
                setConfig({
                  ...config,
                  target_companies:
                    (config.target_companies ?? []).length === 0
                      ? DEFAULT_COMPANIES
                      : [],
                })
              }
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              {(config.target_companies ?? []).length === 0 ? (
                <>
                  <Plus className="w-3 h-3" />
                  Add defaults
                </>
              ) : (
                <>
                  <X className="w-3 h-3" />
                  Clear all
                </>
              )}
            </button>
          </div>

          {/* Company chips */}
          <div className="min-h-[44px] p-3 rounded-xl bg-muted/30 border border-border">
            {(config.target_companies ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-1">
                No companies added. Add companies to monitor for signals.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {(config.target_companies ?? []).map((company, index) => (
                    <CompanyChip
                      key={company}
                      company={company}
                      onRemove={() => removeCompany(company)}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Add company input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCompany()}
                placeholder="Add a company to monitor..."
                className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
              />
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Button variant="outline" onClick={addCompany} className="px-4">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Configurable Data Sources */}
        <div className="space-y-4">
          <label className="font-medium text-foreground flex items-center gap-2">
            <Rss className="w-4 h-4 text-muted-foreground" />
            Configurable Sources
            <span className="text-xs text-muted-foreground font-normal">
              (
              {
                SOURCE_OPTIONS.filter(
                  (s) => config[s.id as keyof ScraperConfig]
                ).length
              }{" "}
              active)
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOURCE_OPTIONS.map((source, index) => (
              <SourceCard
                key={source.id}
                source={source}
                isEnabled={config[source.id as keyof ScraperConfig] as boolean}
                onToggle={() => toggleSource(source.id)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Always-On Sources */}
        <div className="space-y-4">
          <label className="font-medium text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Always-On Sources
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {ALWAYS_ON_SOURCES.length} active
            </span>
          </label>
          <p className="text-sm text-muted-foreground -mt-2">
            These free sources run automatically with every scrape.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALWAYS_ON_SOURCES.map((source, index) => {
              const Icon = source.icon;
              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10"
                >
                  <div className={cn("p-2 rounded-lg", source.bgColor)}>
                    <Icon className="w-4 h-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {source.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {source.description}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <AnimatePresence mode="wait">
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-emerald-600"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Configuration saved successfully
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
