"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
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
} from "lucide-react";
import type { ScraperConfig, ScrapeRun, ScraperStatusResponse } from "@/types/scraper";

const SOURCE_OPTIONS = [
  {
    id: "source_techcrunch",
    label: "TechCrunch",
    description: "Funding rounds, startup news",
    icon: Rss,
  },
  {
    id: "source_indeed",
    label: "Job Boards",
    description: "Indeed job postings",
    icon: Briefcase,
  },
  {
    id: "source_linkedin",
    label: "LinkedIn",
    description: "LinkedIn jobs (requires Bright Data)",
    icon: Link,
    requiresCredentials: true,
  },
  {
    id: "source_company_newsrooms",
    label: "Company Newsrooms",
    description: "Press releases, announcements",
    icon: Newspaper,
  },
];

const DEFAULT_COMPANIES = ["Stripe", "Shopify", "HubSpot", "Salesforce", "Twilio"];

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

    // Poll for updates if a scrape is running
    const interval = setInterval(() => {
      if (isRunning) {
        loadStatus();
      }
    }, 5000);

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
    if (config.target_companies.includes(newCompany.trim())) {
      setNewCompany("");
      return;
    }
    setConfig({
      ...config,
      target_companies: [...config.target_companies, newCompany.trim()],
    });
    setNewCompany("");
  };

  const removeCompany = (company: string) => {
    if (!config) return;
    setConfig({
      ...config,
      target_companies: config.target_companies.filter((c) => c !== company),
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
    if (!latestRun?.progress || Object.keys(latestRun.progress).length === 0) return 0;
    const sources = Object.values(latestRun.progress);
    const completed = sources.filter((s) => s.status === "completed").length;
    return Math.round((completed / sources.length) * 100);
  };

  const getTimeRemaining = () => {
    if (!latestRun?.estimated_duration_seconds || !latestRun.started_at) return null;
    const started = new Date(latestRun.started_at).getTime();
    const now = Date.now();
    const elapsed = (now - started) / 1000;
    const remaining = Math.max(0, latestRun.estimated_duration_seconds - elapsed);

    if (remaining < 60) return `${Math.round(remaining)}s remaining`;
    return `${Math.round(remaining / 60)}m remaining`;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground text-center py-4">
          Failed to load scraper configuration
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className={`w-5 h-5 text-primary ${isRunning ? "animate-spin" : ""}`} />
          <div>
            <h2 className="font-medium text-foreground">Signal Scraper</h2>
            <p className="text-sm text-muted-foreground">
              Configure which companies and sources to monitor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerScrape}
            disabled={isRunning || triggering}
          >
            {triggering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
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

      {/* Scrape Status */}
      {(isRunning || latestRun) && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isRunning ? "Scraping in progress..." : "Last scrape"}
            </span>
            {isRunning && getTimeRemaining() && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getTimeRemaining()}
              </span>
            )}
            {!isRunning && latestRun?.completed_at && (
              <span className="text-muted-foreground">
                {new Date(latestRun.completed_at).toLocaleString()}
              </span>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {latestRun?.progress &&
                  Object.entries(latestRun.progress).map(([source, data]) => (
                    <span
                      key={source}
                      className={`text-xs px-2 py-1 rounded-full ${
                        data.status === "completed"
                          ? "bg-green-500/10 text-green-600"
                          : data.status === "running"
                          ? "bg-primary/10 text-primary"
                          : data.status === "failed"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {source}: {data.signals} signals
                    </span>
                  ))}
              </div>
            </div>
          )}

          {!isRunning && latestRun && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-600" />
                {latestRun.total_signals} signals found
              </span>
              {latestRun.ai_enriched_count > 0 && (
                <span className="text-muted-foreground">
                  {latestRun.ai_enriched_count} AI-enriched
                </span>
              )}
            </div>
          )}

          {nextScheduledRun && !isRunning && (
            <p className="text-xs text-muted-foreground">
              Next scheduled: {new Date(nextScheduledRun).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Auto-scrape toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div>
          <p className="font-medium text-foreground">Automatic Scraping</p>
          <p className="text-sm text-muted-foreground">
            Run scraper every {config.scrape_interval_minutes} minutes
          </p>
        </div>
        <button
          onClick={() => setConfig({ ...config, auto_scrape_enabled: !config.auto_scrape_enabled })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            config.auto_scrape_enabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.auto_scrape_enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Scrape interval */}
      {config.auto_scrape_enabled && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Scrape Interval</label>
          <select
            value={config.scrape_interval_minutes}
            onChange={(e) =>
              setConfig({ ...config, scrape_interval_minutes: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every hour</option>
            <option value={120}>Every 2 hours</option>
            <option value={360}>Every 6 hours</option>
            <option value={720}>Every 12 hours</option>
            <option value={1440}>Once daily</option>
          </select>
        </div>
      )}

      {/* Target Companies */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <label className="font-medium text-foreground">Target Companies</label>
          </div>
          <button
            onClick={() =>
              setConfig({
                ...config,
                target_companies:
                  config.target_companies.length === 0 ? DEFAULT_COMPANIES : [],
              })
            }
            className="text-xs text-primary hover:text-primary/80"
          >
            {config.target_companies.length === 0 ? "Add defaults" : "Clear all"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {config.target_companies.map((company) => (
            <span
              key={company}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {company}
              <button
                onClick={() => removeCompany(company)}
                className="hover:text-primary/70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCompany()}
            placeholder="Add a company..."
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          />
          <Button variant="outline" size="sm" onClick={addCompany}>
            Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          These companies will be monitored for job postings and press releases.
        </p>
      </div>

      {/* Sources */}
      <div className="space-y-3">
        <label className="font-medium text-foreground">Data Sources</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOURCE_OPTIONS.map((source) => {
            const isEnabled = config[source.id as keyof ScraperConfig] as boolean;
            const Icon = source.icon;

            return (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-colors ${
                  isEnabled
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 ${
                    isEnabled ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{source.label}</span>
                    {source.requiresCredentials && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Pro</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isEnabled
                      ? "border-primary bg-primary text-white"
                      : "border-muted-foreground/30"
                  }`}
                >
                  {isEnabled && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-4 pt-2">
        <Button onClick={handleSave} disabled={saving}>
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
        {saveSuccess && (
          <span className="text-sm text-muted-foreground">Configuration updated.</span>
        )}
      </div>
    </motion.div>
  );
}
