"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/layout/header";
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
  Pause,
  History,
  Target,
  Globe,
  Database,
  Activity,
  Calendar,
  ArrowRight,
  Settings2,
  Layers,
} from "lucide-react";
import type {
  ScraperConfig,
  ScrapeRun,
  ScraperStatusResponse,
} from "@/types/scraper";
import { cn } from "@/lib/utils";

const SOURCE_OPTIONS = [
  {
    id: "source_techcrunch",
    label: "TechCrunch",
    description: "Funding rounds, startup news, and tech industry updates",
    icon: Rss,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-600",
  },
  {
    id: "source_indeed",
    label: "Job Boards",
    description: "Indeed job postings indicating growth and hiring",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-600",
  },
  {
    id: "source_linkedin",
    label: "LinkedIn",
    description: "Professional network job postings via Bright Data",
    icon: Link,
    color: "from-sky-500 to-blue-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    textColor: "text-sky-600",
    requiresCredentials: true,
  },
  {
    id: "source_company_newsrooms",
    label: "Newsrooms",
    description: "Official press releases and company announcements",
    icon: Newspaper,
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-600",
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
  { value: 15, label: "15 min", description: "Real-time" },
  { value: 30, label: "30 min", description: "Recommended", recommended: true },
  { value: 60, label: "1 hour", description: "Standard" },
  { value: 120, label: "2 hours", description: "Light" },
  { value: 360, label: "6 hours", description: "Check-ins" },
  { value: 720, label: "12 hours", description: "Twice daily" },
  { value: 1440, label: "24 hours", description: "Daily" },
];

// Animated progress ring component
function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold text-foreground"
        >
          {progress}%
        </motion.span>
        <span className="text-xs text-muted-foreground">Complete</span>
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
      transition={{
        delay: index * 0.03,
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="group inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 text-primary rounded-xl text-sm font-medium border border-primary/20 transition-all duration-200 shadow-sm hover:shadow"
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
      transition={{ delay: index * 0.08 }}
      onClick={onToggle}
      className={cn(
        "relative group flex flex-col p-5 rounded-2xl border text-left transition-all duration-300 overflow-hidden",
        isEnabled
          ? "border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 shadow-lg shadow-primary/5"
          : "border-border hover:border-muted-foreground/30 bg-card hover:bg-secondary/50"
      )}
    >
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
        />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={cn(
            "p-3 rounded-xl transition-all duration-300",
            isEnabled ? source.bgColor : "bg-muted"
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6 transition-colors",
              isEnabled ? source.textColor : "text-muted-foreground"
            )}
          />
        </div>

        <div
          className={cn(
            "relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0",
            isEnabled ? "bg-primary" : "bg-muted"
          )}
        >
          <motion.div
            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
            animate={{ x: isEnabled ? 24 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </div>

      <div className="relative mt-4 space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-semibold text-base transition-colors",
              isEnabled ? "text-foreground" : "text-foreground/80"
            )}
          >
            {source.label}
          </span>
          {source.requiresCredentials && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border border-amber-500/20">
              PRO
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {source.description}
        </p>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1 transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100",
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
        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border",
        config.color
      )}
    >
      <Icon
        className={cn("w-3.5 h-3.5", status === "running" && "animate-spin")}
      />
      <span className="capitalize">{label.replace("_", " ")}</span>
      {signalCount !== undefined && signalCount > 0 && (
        <span className="font-bold bg-current/10 px-1.5 py-0.5 rounded">
          {signalCount}
        </span>
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

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
          )}
        </div>
        {trend && (
          <div
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-lg",
              trend === "up" && "bg-emerald-500/10 text-emerald-600",
              trend === "down" && "bg-red-500/10 text-red-600",
              trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ScrapingPage() {
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

  // Tab state
  const [activeTab, setActiveTab] = useState<"overview" | "config" | "history">(
    "overview"
  );

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
    }, 2000);

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
        // Start polling more frequently
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

  const getEnabledSourcesCount = () => {
    if (!config) return 0;
    return SOURCE_OPTIONS.filter(
      (s) => config[s.id as keyof ScraperConfig]
    ).length;
  };

  if (loading) {
    return (
      <>
        <Header
          title="Signal Scraper"
          subtitle="Configure and monitor your signal detection pipeline"
        />
        <main className="p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading scraper...</p>
          </div>
        </main>
      </>
    );
  }

  if (!config) {
    return (
      <>
        <Header
          title="Signal Scraper"
          subtitle="Configure and monitor your signal detection pipeline"
        />
        <main className="p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle className="w-10 h-10 text-destructive" />
            <p className="text-muted-foreground text-center">
              Failed to load scraper configuration
            </p>
            <Button onClick={loadStatus} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Signal Scraper"
        subtitle="Configure and monitor your signal detection pipeline"
      />

      <main className="p-6 lg:p-8 space-y-6">
        {/* Hero section with run control */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {isRunning ? (
                <ProgressRing progress={getProgressPercentage()} />
              ) : (
                <div className="relative">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <RefreshCw className="w-12 h-12 text-primary" />
                  </div>
                  {config.auto_scrape_enabled && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-emerald-500 text-white text-[10px] font-bold">
                        A
                      </span>
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  {isRunning ? "Scraping in Progress" : "Ready to Scrape"}
                  {isRunning && <Zap className="w-5 h-5 text-primary" />}
                </h2>
                <p className="text-muted-foreground max-w-md">
                  {isRunning
                    ? `Scanning ${getEnabledSourcesCount()} sources for buying signals...`
                    : `Monitor ${(config.target_companies ?? []).length} companies across ${getEnabledSourcesCount()} data sources`}
                </p>
                {isRunning && getTimeRemaining() && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {getTimeRemaining()} remaining
                    </span>
                    <span className="text-muted-foreground">
                      <Activity className="w-4 h-4 inline mr-1" />
                      {getElapsedTime()} elapsed
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleTriggerScrape}
                disabled={isRunning || triggering}
                size="lg"
                className={cn(
                  "text-base px-6 h-12 rounded-xl",
                  isRunning && "bg-primary/80"
                )}
              >
                {triggering ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Starting...
                  </>
                ) : isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Run Scraper
                  </>
                )}
              </Button>
              {isRunning && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                  disabled
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>

          {/* Live progress during scrape */}
          <AnimatePresence>
            {isRunning && latestRun?.progress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-border/50"
              >
                <div className="flex flex-wrap gap-2">
                  {Object.entries(latestRun.progress).map(([source, data]) => (
                    <StatusIndicator
                      key={source}
                      status={data.status}
                      label={source}
                      signalCount={data.signals}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Target}
            label="Target Companies"
            value={(config.target_companies ?? []).length}
            sublabel="Being monitored"
            delay={0.1}
          />
          <StatCard
            icon={Globe}
            label="Data Sources"
            value={getEnabledSourcesCount()}
            sublabel={`of ${SOURCE_OPTIONS.length} available`}
            delay={0.15}
          />
          <StatCard
            icon={Database}
            label="Last Run Signals"
            value={latestRun?.total_signals ?? 0}
            sublabel={
              latestRun?.completed_at
                ? `${new Date(latestRun.completed_at).toLocaleDateString()}`
                : "No runs yet"
            }
            trend={
              latestRun?.total_signals
                ? latestRun.total_signals > 0
                  ? "up"
                  : "neutral"
                : undefined
            }
            delay={0.2}
          />
          <StatCard
            icon={Calendar}
            label="Next Scheduled"
            value={
              nextScheduledRun
                ? new Date(nextScheduledRun).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"
            }
            sublabel={
              config.auto_scrape_enabled
                ? `Every ${config.scrape_interval_minutes}m`
                : "Auto-scrape off"
            }
            delay={0.25}
          />
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-border">
          {[
            { id: "overview", label: "Overview", icon: Layers },
            { id: "config", label: "Configuration", icon: Settings2 },
            { id: "history", label: "Run History", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "overview" | "config" | "history")
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              {/* Target Companies */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Target Companies
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {(config.target_companies ?? []).length} companies
                        monitored
                      </p>
                    </div>
                  </div>
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
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {(config.target_companies ?? []).length === 0
                      ? "Add defaults"
                      : "Clear all"}
                  </button>
                </div>

                <div className="min-h-[100px] p-4 rounded-xl bg-muted/30 border border-border mb-4">
                  {(config.target_companies ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      No companies added yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence mode="popLayout">
                        {(config.target_companies ?? []).map(
                          (company, index) => (
                            <CompanyChip
                              key={company}
                              company={company}
                              onRemove={() => removeCompany(company)}
                              index={index}
                            />
                          )
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCompany()}
                      placeholder="Add a company..."
                      className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all pr-10"
                    />
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <Button variant="outline" onClick={addCompany}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Data Sources */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Rss className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Data Sources
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {getEnabledSourcesCount()} of {SOURCE_OPTIONS.length}{" "}
                      enabled
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {SOURCE_OPTIONS.map((source) => {
                    const Icon = source.icon;
                    const isEnabled = config[
                      source.id as keyof ScraperConfig
                    ] as boolean;

                    return (
                      <button
                        key={source.id}
                        onClick={() => toggleSource(source.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                          isEnabled
                            ? "border-primary/30 bg-primary/5"
                            : "border-border hover:border-muted-foreground/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              isEnabled ? source.bgColor : "bg-muted"
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-4 h-4",
                                isEnabled
                                  ? source.textColor
                                  : "text-muted-foreground"
                              )}
                            />
                          </div>
                          <span
                            className={cn(
                              "font-medium",
                              isEnabled
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {source.label}
                          </span>
                          {source.requiresCredentials && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
                              PRO
                            </span>
                          )}
                        </div>
                        <div
                          className={cn(
                            "w-9 h-5 rounded-full transition-colors",
                            isEnabled ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <motion.div
                            className="w-4 h-4 rounded-full bg-white shadow-sm mt-0.5"
                            animate={{ x: isEnabled ? 18 : 2 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Last Run Summary */}
              {latestRun && (
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Last Scrape Results
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {latestRun.completed_at
                            ? new Date(latestRun.completed_at).toLocaleString()
                            : "In progress..."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {latestRun.total_signals ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          signals found
                        </p>
                      </div>
                      {(latestRun.ai_enriched_count ?? 0) > 0 && (
                        <div className="text-right pl-4 border-l border-border">
                          <p className="text-2xl font-bold text-primary">
                            {latestRun.ai_enriched_count}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI enriched
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {latestRun.signals_by_source &&
                    Object.keys(latestRun.signals_by_source).length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(latestRun.signals_by_source).map(
                          ([source, count]) => (
                            <div
                              key={source}
                              className="p-3 rounded-xl bg-muted/30 border border-border"
                            >
                              <p className="text-xs text-muted-foreground capitalize mb-1">
                                {source.replace("_", " ")}
                              </p>
                              <p className="text-lg font-semibold text-foreground">
                                {count}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Auto-scrape toggle */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <RefreshCw className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Automatic Scraping
                      </h3>
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
                      "relative w-14 h-8 rounded-full transition-all duration-300",
                      config.auto_scrape_enabled ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <motion.span
                      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm"
                      animate={{ x: config.auto_scrape_enabled ? 28 : 4 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {config.auto_scrape_enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Scrape Interval
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                              "relative p-3 rounded-xl text-center transition-all duration-200 border",
                              config.scrape_interval_minutes === option.value
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                : "bg-card hover:bg-muted border-border"
                            )}
                          >
                            {option.recommended && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                                BEST
                              </span>
                            )}
                            <div className="font-semibold text-sm">
                              {option.label}
                            </div>
                            <div className="text-[10px] opacity-70">
                              {option.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data Sources Grid */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Rss className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Data Sources
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select which sources to scrape for signals
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {SOURCE_OPTIONS.map((source, index) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      isEnabled={
                        config[source.id as keyof ScraperConfig] as boolean
                      }
                      onToggle={() => toggleSource(source.id)}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              {/* Target Companies */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Target Companies
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {(config.target_companies ?? []).length} companies being
                        monitored
                      </p>
                    </div>
                  </div>
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
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    {(config.target_companies ?? []).length === 0 ? (
                      <>
                        <Plus className="w-4 h-4" />
                        Add defaults
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        Clear all
                      </>
                    )}
                  </button>
                </div>

                <div className="min-h-[120px] p-4 rounded-xl bg-muted/30 border border-border mb-4">
                  {(config.target_companies ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No companies added. Add companies to monitor for signals.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence mode="popLayout">
                        {(config.target_companies ?? []).map(
                          (company, index) => (
                            <CompanyChip
                              key={company}
                              company={company}
                              onRemove={() => removeCompany(company)}
                              index={index}
                            />
                          )
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCompany()}
                      placeholder="Add a company to monitor..."
                      className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
                    />
                    <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <Button onClick={addCompany} className="px-5">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
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
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Run History
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Previous scrape runs and their results
                  </p>
                </div>
              </div>

              {latestRun ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {latestRun.status === "completed" ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : latestRun.status === "running" ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : latestRun.status === "failed" ? (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-foreground capitalize">
                          {latestRun.status}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {latestRun.started_at
                          ? new Date(latestRun.started_at).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Signals Found</p>
                        <p className="font-semibold text-foreground">
                          {latestRun.total_signals ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">AI Enriched</p>
                        <p className="font-semibold text-foreground">
                          {latestRun.ai_enriched_count ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-semibold text-foreground">
                          {latestRun.completed_at && latestRun.started_at
                            ? `${Math.round(
                                (new Date(latestRun.completed_at).getTime() -
                                  new Date(latestRun.started_at).getTime()) /
                                  1000
                              )}s`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Full history coming soon
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No scrape runs yet</p>
                  <Button
                    onClick={handleTriggerScrape}
                    className="mt-4"
                    disabled={triggering}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run First Scrape
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
