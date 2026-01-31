"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { SignalCard } from "@/components/signals/signal-card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Mail,
  Target,
  Sparkles,
  Radio,
  Bell,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  Play,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import type { Easing } from "motion/react";
import Link from "next/link";
import type { DashboardStats, Signal } from "@/types";
import { useRealtimeSignals } from "@/hooks/use-realtime-signals";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

// Animated number counter component
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
}

// Live indicator component
function LiveIndicator() {
  return (
    <span className="relative flex size-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; trend: "up" | "down" };
  icon: React.ReactNode;
  gradient: string;
  index: number;
}

function StatCard({ title, value, change, icon, gradient, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: easeOutExpo }}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-6 hover:border-border transition-all duration-300"
    >
      {/* Gradient background */}
      <div className={cn("absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity", gradient)} />

      {/* Glow effect on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl", gradient.replace("bg-gradient", "bg-gradient").replace("to-r", "to-br"))}>
            <div className="text-white">{icon}</div>
          </div>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              change.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {change.trend === "up" ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {change.value}%
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-bold text-foreground tracking-tight">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </p>
      </div>
    </motion.div>
  );
}

function ActivityItem({ signal, index }: { signal: Signal; index: number }) {
  const typeColors: Record<string, string> = {
    hiring: "bg-blue-500",
    funding: "bg-emerald-500",
    expansion: "bg-amber-500",
    partnership: "bg-purple-500",
    product_launch: "bg-pink-500",
    leadership_change: "bg-indigo-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.06, ease: easeOutExpo }}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer"
    >
      <div className={cn("size-2 rounded-full mt-2 shrink-0", typeColors[signal.signal_type] || "bg-gray-400")} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
          {signal.company_name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{signal.title}</p>
      </div>
      <span className="text-[10px] text-muted-foreground/60 shrink-0">
        {new Date(signal.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setUserId(user.id);

      const [statsRes, signalsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/signals?limit=8")
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (signalsRes.ok) {
        const signalsData = await signalsRes.json();
        setRecentSignals(signalsData.signals || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunScraper = async () => {
    setScraping(true);
    setScrapeMessage(null);

    try {
      const response = await fetch("/api/scraper/trigger", { method: "POST" });
      const data = await response.json();

      if (data.error) {
        setScrapeMessage(data.error);
        setScraping(false);
        return;
      }

      setScrapeMessage("Scraping started! Refreshing data...");

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch("/api/scraper/status");
        const statusData = await statusRes.json();

        if (!statusData.isRunning) {
          clearInterval(pollInterval);
          setScraping(false);
          setScrapeMessage(`Scrape complete! Found ${statusData.latestRun?.total_signals || 0} signals.`);
          // Refresh dashboard data
          fetchData(true);
          // Clear message after 5 seconds
          setTimeout(() => setScrapeMessage(null), 5000);
        }
      }, 2000);

      // Timeout after 60 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setScraping(false);
      }, 60000);

    } catch (error) {
      console.error("Error triggering scrape:", error);
      setScrapeMessage("Failed to start scraper");
      setScraping(false);
    }
  };

  const handleNewSignal = useCallback((newSignal: Signal) => {
    setRecentSignals(prev => [newSignal, ...prev].slice(0, 8));
    setStats(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        total_signals: prev.total_signals + 1,
        new_signals: prev.new_signals + 1,
        high_priority: newSignal.priority === "high" ? prev.high_priority + 1 : prev.high_priority,
      };
    });
  }, []);

  useRealtimeSignals(userId || "", handleNewSignal);

  if (loading) {
    return (
      <>
        <Header title="Overview" subtitle="Your signal intelligence at a glance" />
        <main className="p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-background rounded-2xl p-6 border border-border/50 animate-pulse">
                <div className="size-10 bg-muted rounded-xl mb-4" />
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  if (!userId) {
    return (
      <>
        <Header title="Overview" subtitle="Your signal intelligence at a glance" />
        <main className="p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center mb-6">
              <Zap className="size-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome to Axidex</h2>
            <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const quickActions = [
    { icon: RefreshCw, label: "Scraping", href: "/dashboard/scraping", color: "from-orange-500 to-red-500" },
    { icon: Radio, label: "Signals", href: "/dashboard/signals", color: "from-blue-500 to-blue-600" },
    { icon: Mail, label: "Emails", href: "/dashboard/emails", color: "from-emerald-500 to-emerald-600" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", color: "from-purple-500 to-purple-600" },
  ];

  return (
    <>
      <Header title="Overview" subtitle="Your signal intelligence at a glance" />
      <main className="p-6 lg:p-8 space-y-8">
        {/* Scraper Status Banner */}
        {(scraping || scrapeMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border",
              scraping
                ? "bg-primary/5 border-primary/20"
                : "bg-emerald-500/5 border-emerald-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              {scraping ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-emerald-600" />
              )}
              <span className={cn("text-sm font-medium", scraping ? "text-primary" : "text-emerald-600")}>
                {scrapeMessage || "Scraping in progress..."}
              </span>
            </div>
            {!scraping && (
              <button
                onClick={() => setScrapeMessage(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ×
              </button>
            )}
          </motion.div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunScraper}
              disabled={scraping}
              size="sm"
              className="gap-2 hover-lift"
            >
              {scraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Scraper
                </>
              )}
            </Button>
            <Button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              size="sm"
              variant="outline"
              className="gap-2 hover-lift"
            >
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <LiveIndicator />
            <p className="text-xs text-muted-foreground">
              Live · {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Signals"
            value={stats?.total_signals || 0}
            change={{ value: 12, trend: "up" }}
            icon={<Radio className="size-5" />}
            gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
            index={0}
          />
          <StatCard
            title="High Priority"
            value={stats?.high_priority || 0}
            change={{ value: 8, trend: "up" }}
            icon={<Target className="size-5" />}
            gradient="bg-gradient-to-r from-red-500 to-rose-500"
            index={1}
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversion_rate || 0}%`}
            change={{ value: 3, trend: "up" }}
            icon={<TrendingUp className="size-5" />}
            gradient="bg-gradient-to-r from-emerald-500 to-green-500"
            index={2}
          />
          <StatCard
            title="Emails Drafted"
            value={stats?.emails_drafted || 0}
            icon={<Mail className="size-5" />}
            gradient="bg-gradient-to-r from-violet-500 to-purple-500"
            index={3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Signals - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: easeOutExpo }}
            className="xl:col-span-2 bg-background rounded-2xl border border-border/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
                  <Sparkles className="size-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Recent Signals</h2>
                  <p className="text-xs text-muted-foreground">Latest buying intent detected</p>
                </div>
              </div>
              <Link
                href="/dashboard/signals"
                className="text-xs font-medium text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 group"
              >
                View all
                <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recentSignals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <Radio className="size-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">No signals yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mb-4">
                  Configure your signal sources to start detecting buying signals.
                </p>
                <Link href="/dashboard/signals">
                  <Button size="sm" variant="outline">Explore Signals</Button>
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {recentSignals.slice(0, 4).map((signal, index) => (
                  <SignalCard key={signal.id} signal={signal} index={index} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: easeOutExpo }}
              className="bg-background rounded-2xl border border-border/50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Activity</h3>
                </div>
                <span className="text-[10px] text-muted-foreground">Last 24h</span>
              </div>

              <div className="p-2 max-h-[280px] overflow-y-auto">
                {recentSignals.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No recent activity</p>
                ) : (
                  recentSignals.slice(0, 6).map((signal, index) => (
                    <ActivityItem key={signal.id} signal={signal} index={index} />
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: easeOutExpo }}
              className="bg-background rounded-2xl border border-border/50 p-5"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary hover-lift transition-all"
                  >
                    <div className={cn("size-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", action.color)}>
                      <action.icon className="size-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-foreground group-hover:text-accent transition-colors">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Pro Tip Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: easeOutExpo }}
              className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-orange-500/5 p-5"
            >
              <div className="absolute top-0 right-0 size-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-4 text-accent" />
                  <span className="text-xs font-semibold text-accent uppercase tracking-wider">Pro Tip</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  Set up automation rules to instantly draft personalized emails when high-priority signals are detected.
                </p>
                <Link
                  href="/dashboard/rules"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent mt-3 hover:underline"
                >
                  Create Rule
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
