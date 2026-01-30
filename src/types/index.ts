export type SignalType = "hiring" | "funding" | "expansion" | "partnership" | "product_launch" | "leadership_change";

export type SignalPriority = "high" | "medium" | "low";

export type SignalStatus = "new" | "reviewed" | "contacted" | "converted" | "dismissed";

export interface Signal {
  id: string;
  company_name: string;
  company_domain: string;
  company_logo?: string;
  signal_type: SignalType;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  priority: SignalPriority;
  status: SignalStatus;
  detected_at: string;
  created_at: string;
  metadata?: {
    funding_amount?: string;
    job_titles?: string[];
    location?: string;
    industry?: string;
  };
}

export interface GeneratedEmail {
  id: string;
  signal_id: string;
  subject: string;
  body: string;
  tone: "professional" | "casual" | "enthusiastic";
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  company_name?: string;
  created_at: string;
}

export interface SignalFilter {
  types?: SignalType[];
  priorities?: SignalPriority[];
  statuses?: SignalStatus[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface DashboardStats {
  total_signals: number;
  new_signals: number;
  high_priority: number;
  conversion_rate: number;
  emails_drafted: number;
  signals_by_type: Record<SignalType, number>;
  signals_by_day: { date: string; count: number }[];
}
