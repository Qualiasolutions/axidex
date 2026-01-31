"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/analytics/metric-card";
import { ChartCard } from "@/components/analytics/chart-card";
import { motion } from "motion/react";
import {
  Signal,
  TrendingUp,
  AlertTriangle,
  Send,
  FileText,
  MessageSquare,
  Loader2,
  Check,
} from "lucide-react";

// Dynamic imports for Recharts - reduces initial bundle by ~400KB
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
});
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const PieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { ssr: false }
);
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});

type Period = "today" | "week" | "month" | "quarter";

const periodOptions: { value: Period; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
];

const COLORS = {
  hiring: "#ea580c",
  funding: "#10b981",
  expansion: "#f59e0b",
  partnership: "#6366f1",
  product_launch: "#ec4899",
  leadership_change: "#8b5cf6",
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

interface AnalyticsData {
  metrics: {
    totalSignals: number;
    newSignals: number;
    highPriority: number;
    conversionRate: number;
    emailsDrafted: number;
    emailsSent: number;
  };
  charts: {
    signalsByType: Record<string, number>;
    signalsByPriority: Record<string, number>;
    signalsByDay: { date: string; count: number }[];
    signalsByStatus: Record<string, number>;
  };
}

function AnalyticsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingToSlack, setSendingToSlack] = useState(false);
  const [slackSuccess, setSlackSuccess] = useState(false);
  const [slackError, setSlackError] = useState<string | null>(null);

  const period = (searchParams.get("period") as Period) || "month";

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics?period=${period}`);

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [period]);

  const setPeriod = (value: Period) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "month") {
      params.delete("period");
    } else {
      params.set("period", value);
    }
    router.push(`/dashboard/analytics?${params.toString()}`);
  };

  const sendToSlack = async () => {
    setSendingToSlack(true);
    setSlackError(null);
    setSlackSuccess(false);

    try {
      const response = await fetch("/api/slack/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const result = await response.json();

      if (result.error) {
        setSlackError(result.error);
      } else {
        setSlackSuccess(true);
        setTimeout(() => setSlackSuccess(false), 3000);
      }
    } catch {
      setSlackError("Failed to send to Slack");
    }

    setSendingToSlack(false);
  };

  // Transform data for charts
  const signalsByTypeData = data
    ? Object.entries(data.charts.signalsByType).map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
        fill: COLORS[name as keyof typeof COLORS] || "#6b7280",
      }))
    : [];

  const signalsByPriorityData = data
    ? Object.entries(data.charts.signalsByPriority).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: COLORS[name as keyof typeof COLORS] || "#6b7280",
      }))
    : [];

  const signalsByDayData = data?.charts.signalsByDay || [];

  return (
    <>
      <Header title="Analytics" subtitle="Insights and metrics for your signals" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Period filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-tertiary)] mr-1">Period:</span>
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === option.value
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                router.push(`/dashboard/analytics?${params.toString()}`);
              }}
            >
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={sendToSlack}
              disabled={sendingToSlack || !data}
            >
              {sendingToSlack ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Sending...
                </>
              ) : slackSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Sent!
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Send to Slack
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Slack error message */}
        {slackError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
          >
            {slackError}
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-28 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
              ))}
            </div>
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

        {/* Analytics content */}
        {!loading && !error && data && (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <MetricCard
                title="Total Signals"
                value={data.metrics.totalSignals}
                icon={<Signal className="w-5 h-5" />}
                index={0}
              />
              <MetricCard
                title="New Signals"
                value={data.metrics.newSignals}
                icon={<TrendingUp className="w-5 h-5" />}
                index={1}
              />
              <MetricCard
                title="High Priority"
                value={data.metrics.highPriority}
                icon={<AlertTriangle className="w-5 h-5" />}
                index={2}
              />
              <MetricCard
                title="Conversion Rate"
                value={`${data.metrics.conversionRate}%`}
                icon={<TrendingUp className="w-5 h-5" />}
                index={3}
              />
              <MetricCard
                title="Emails Drafted"
                value={data.metrics.emailsDrafted}
                icon={<FileText className="w-5 h-5" />}
                index={4}
              />
              <MetricCard
                title="Emails Sent"
                value={data.metrics.emailsSent}
                icon={<Send className="w-5 h-5" />}
                index={5}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Signals over time */}
              <ChartCard
                title="Signals Over Time"
                subtitle="Daily signal count"
                className="lg:col-span-2"
                index={6}
              >
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={signalsByDayData}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        labelFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString();
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#ea580c"
                        strokeWidth={2}
                        dot={{ fill: "#ea580c", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Signals by type */}
              <ChartCard title="Signals by Type" index={7}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={signalsByTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                        labelLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Signals by priority */}
              <ChartCard title="Signals by Priority" index={8}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={signalsByPriorityData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11 }}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#ea580c" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && data && data.metrics.totalSignals === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 px-6 text-center bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)]"
          >
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No data yet
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-md mb-8 leading-relaxed">
              Analytics will populate once you have signals in your account. Start by adding signal sources or importing data.
            </p>
            <Button variant="default" onClick={() => router.push("/dashboard/signals")}>
              View Signals
            </Button>
          </motion.div>
        )}
      </main>
    </>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-[var(--bg-secondary)] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <AnalyticsPageContent />
    </Suspense>
  );
}
