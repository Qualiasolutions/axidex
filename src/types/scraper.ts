export type ScrapeStatus = "pending" | "running" | "completed" | "failed";

export interface ScraperConfig {
  id: string;
  user_id: string;
  target_companies: string[] | null;
  signal_keywords: string[] | null;
  source_techcrunch: boolean | null;
  source_indeed: boolean | null;
  source_linkedin: boolean | null;
  source_company_newsrooms: boolean | null;
  scrape_interval_minutes: number | null;
  auto_scrape_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScraperProgress {
  [source: string]: {
    status: "pending" | "running" | "completed" | "failed";
    signals: number;
    error?: string;
  };
}

export interface ScrapeRun {
  id: string;
  user_id: string | null;
  status: ScrapeStatus | null;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_seconds: number | null;
  progress: ScraperProgress;
  total_signals: number | null;
  signals_by_source: Record<string, number>;
  ai_enriched_count: number | null;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  created_at: string | null;
}

export interface ScraperStatusResponse {
  config: ScraperConfig | null;
  latestRun: ScrapeRun | null;
  isRunning: boolean;
  nextScheduledRun: string | null;
}
