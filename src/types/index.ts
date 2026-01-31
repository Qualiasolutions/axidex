export type SignalType = "hiring" | "funding" | "expansion" | "partnership" | "product_launch" | "leadership_change";

export type SignalPriority = "high" | "medium" | "low";

export type SignalStatus = "new" | "reviewed" | "contacted" | "converted" | "dismissed";

export interface Signal {
  id: string;
  company_name: string;
  company_domain: string | null;
  company_logo?: string | null;
  signal_type: SignalType;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  priority: SignalPriority;
  status: SignalStatus;
  detected_at: string;
  created_at: string;
  deleted_at?: string | null;
  embedding?: string | null;
  metadata?: {
    funding_amount?: string;
    job_titles?: string[];
    location?: string;
    industry?: string;
  } | null;
}

export type EmailTone = "professional" | "casual" | "enthusiastic";
export type EmailStatus = "draft" | "sent";

export interface GeneratedEmail {
  id: string;
  signal_id: string;
  user_id: string;
  subject: string;
  body: string;
  tone: EmailTone;
  status: EmailStatus;
  created_at: string;
  deleted_at: string | null;
  signal?: Signal;
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

// Aggregated account from signals
export interface Account {
  company_domain: string;
  company_name: string;
  company_logo: string | null;
  signal_count: number;
  high_priority_count: number;
  last_signal: string;
}

// Automation rule
export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  trigger_conditions: {
    signal_types?: SignalType[];
    priorities?: SignalPriority[];
    keywords?: string[];
    companies?: string[];
  };
  actions: {
    type: "generate_email" | "mark_status" | "notify" | "push_to_crm";
    config: Record<string, unknown>;
  }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// CRM Integration types
export type CRMProvider = "hubspot" | "salesforce" | "pipedrive" | "zoho" | "apollo";

export type CRMSyncStatus = "pending" | "syncing" | "success" | "failed";

export interface CRMFieldMapping {
  company_name: string;
  company_domain: string;
  signal_type: string;
  title: string;
  summary: string;
  priority: string;
  source_url: string;
  [key: string]: string;
}

export interface CRMIntegration {
  id: string;
  user_id: string;
  provider: CRMProvider;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  instance_url: string | null;
  portal_id: string | null;
  account_id: string | null;
  connected_at: string;
  connected_by_email: string | null;
  auto_sync_enabled: boolean;
  sync_on_signal_types: SignalType[];
  sync_on_priorities: SignalPriority[];
  field_mapping: CRMFieldMapping;
  create_company: boolean;
  create_contact: boolean;
  create_deal: boolean;
  create_note: boolean;
  created_at: string;
  updated_at: string;
}

export interface CRMSyncLog {
  id: string;
  integration_id: string;
  signal_id: string;
  user_id: string;
  status: CRMSyncStatus;
  started_at: string;
  completed_at: string | null;
  crm_company_id: string | null;
  crm_contact_id: string | null;
  crm_deal_id: string | null;
  crm_note_id: string | null;
  error_message: string | null;
  error_code: string | null;
  retry_count: number;
  created_at: string;
}

// CRM API response types
export interface CRMCompany {
  id: string;
  name: string;
  domain?: string;
  website?: string;
}

export interface CRMContact {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface CRMDeal {
  id: string;
  name: string;
  stage?: string;
  amount?: number;
}

export interface CRMSyncResult {
  success: boolean;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  noteId?: string;
  error?: string;
}
