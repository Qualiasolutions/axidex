import type { Signal, CRMProvider, CRMFieldMapping, CRMSyncResult } from "@/types";

// OAuth configuration for each CRM provider
export interface CRMOAuthConfig {
  provider: CRMProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

// Token response from OAuth flow
export interface CRMTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
  // Provider-specific
  instance_url?: string; // Salesforce
  portal_id?: string; // HubSpot
}

// Base CRM client interface
export interface CRMClient {
  provider: CRMProvider;

  // Token management
  refreshToken(): Promise<CRMTokenResponse>;

  // Company operations
  createCompany(data: CRMCompanyData): Promise<{ id: string }>;
  findCompanyByDomain(domain: string): Promise<{ id: string } | null>;
  updateCompany(id: string, data: Partial<CRMCompanyData>): Promise<void>;

  // Contact operations
  createContact(data: CRMContactData): Promise<{ id: string }>;
  findContactByEmail(email: string): Promise<{ id: string } | null>;

  // Deal operations
  createDeal(data: CRMDealData): Promise<{ id: string }>;

  // Note/Activity operations
  createNote(data: CRMNoteData): Promise<{ id: string }>;

  // Sync a signal to CRM
  syncSignal(signal: Signal, fieldMapping: CRMFieldMapping): Promise<CRMSyncResult>;
}

// Normalized data structures for CRM operations
export interface CRMCompanyData {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  description?: string;
  properties?: Record<string, string>;
}

export interface CRMContactData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyId?: string;
  properties?: Record<string, string>;
}

export interface CRMDealData {
  name: string;
  amount?: number;
  stage?: string;
  companyId?: string;
  contactId?: string;
  properties?: Record<string, string>;
}

export interface CRMNoteData {
  content: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
}

// Signal type to CRM lead source mapping
export const SIGNAL_TYPE_LABELS: Record<string, string> = {
  hiring: "Job Posting / Hiring",
  funding: "Funding Announcement",
  expansion: "Business Expansion",
  partnership: "Partnership News",
  product_launch: "Product Launch",
  leadership_change: "Leadership Change",
};

// Priority to CRM priority mapping
export const PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
