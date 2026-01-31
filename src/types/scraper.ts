export type ScrapeStatus = "pending" | "running" | "completed" | "failed";

export interface ScraperConfig {
  id: string;
  user_id: string;
  target_companies: string[];
  signal_keywords: string[];
  source_techcrunch: boolean;
  source_indeed: boolean;
  source_linkedin: boolean;
  source_company_newsrooms: boolean;
  scrape_interval_minutes: number;
  auto_scrape_enabled: boolean;
  created_at: string;
  updated_at: string;
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
  status: ScrapeStatus;
  started_at: string | null;
  completed_at: string | null;
  estimated_duration_seconds: number | null;
  progress: ScraperProgress;
  total_signals: number;
  signals_by_source: Record<string, number>;
  ai_enriched_count: number;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  created_at: string;
}

export interface ScraperStatusResponse {
  config: ScraperConfig | null;
  latestRun: ScrapeRun | null;
  isRunning: boolean;
  nextScheduledRun: string | null;
}
