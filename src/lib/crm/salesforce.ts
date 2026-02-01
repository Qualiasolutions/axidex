import type { Signal, CRMFieldMapping, CRMSyncResult } from "@/types";
import type {
  CRMClient,
  CRMCompanyData,
  CRMContactData,
  CRMDealData,
  CRMNoteData,
  CRMTokenResponse,
} from "./types";
import { SIGNAL_TYPE_LABELS, PRIORITY_LABELS } from "./types";
import { fetchWithTimeout } from "../fetch-with-timeout";

export class SalesforceClient implements CRMClient {
  provider = "salesforce" as const;
  private accessToken: string;
  private refreshTokenValue: string | null;
  private instanceUrl: string;

  constructor(accessToken: string, instanceUrl: string, refreshToken?: string) {
    this.accessToken = accessToken;
    this.instanceUrl = instanceUrl;
    this.refreshTokenValue = refreshToken ?? null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetchWithTimeout(`${this.instanceUrl}/services/data/v59.0${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      timeout: 15000,
      retries: 2,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Salesforce API error: ${response.status} - ${error}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async refreshToken(): Promise<CRMTokenResponse> {
    if (!this.refreshTokenValue) {
      throw new Error("No refresh token available");
    }

    const response = await fetchWithTimeout("https://login.salesforce.com/services/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.SALESFORCE_CLIENT_ID!,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
        refresh_token: this.refreshTokenValue,
      }),
      timeout: 10000,
      retries: 2,
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Salesforce token");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    if (data.instance_url) this.instanceUrl = data.instance_url;

    return {
      access_token: data.access_token,
      refresh_token: this.refreshTokenValue, // Salesforce doesn't return new refresh token
      token_type: "Bearer",
      instance_url: data.instance_url,
    };
  }

  async createCompany(data: CRMCompanyData): Promise<{ id: string }> {
    const account: Record<string, string> = {
      Name: data.name,
    };

    if (data.domain) account.Website = `https://${data.domain}`;
    if (data.website) account.Website = data.website;
    if (data.industry) account.Industry = data.industry;
    if (data.description) account.Description = data.description;

    const result = await this.request<{ id: string }>("/sobjects/Account", {
      method: "POST",
      body: JSON.stringify(account),
    });

    return { id: result.id };
  }

  async findCompanyByDomain(domain: string): Promise<{ id: string } | null> {
    try {
      const query = encodeURIComponent(
        `SELECT Id FROM Account WHERE Website LIKE '%${domain}%' LIMIT 1`
      );
      const result = await this.request<{ records: { Id: string }[] }>(
        `/query?q=${query}`
      );

      return result.records.length > 0 ? { id: result.records[0].Id } : null;
    } catch {
      return null;
    }
  }

  async updateCompany(
    id: string,
    data: Partial<CRMCompanyData>
  ): Promise<void> {
    const account: Record<string, string> = {};
    if (data.name) account.Name = data.name;
    if (data.domain) account.Website = `https://${data.domain}`;
    if (data.website) account.Website = data.website;
    if (data.industry) account.Industry = data.industry;
    if (data.description) account.Description = data.description;

    await this.request(`/sobjects/Account/${id}`, {
      method: "PATCH",
      body: JSON.stringify(account),
    });
  }

  async createContact(data: CRMContactData): Promise<{ id: string }> {
    const contact: Record<string, string> = {};
    if (data.email) contact.Email = data.email;
    if (data.firstName) contact.FirstName = data.firstName;
    if (data.lastName) contact.LastName = data.lastName;
    if (data.phone) contact.Phone = data.phone;
    if (data.companyId) contact.AccountId = data.companyId;

    // Salesforce requires LastName
    if (!contact.LastName) contact.LastName = "Unknown";

    const result = await this.request<{ id: string }>("/sobjects/Contact", {
      method: "POST",
      body: JSON.stringify(contact),
    });

    return { id: result.id };
  }

  async findContactByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const query = encodeURIComponent(
        `SELECT Id FROM Contact WHERE Email = '${email}' LIMIT 1`
      );
      const result = await this.request<{ records: { Id: string }[] }>(
        `/query?q=${query}`
      );

      return result.records.length > 0 ? { id: result.records[0].Id } : null;
    } catch {
      return null;
    }
  }

  async createDeal(data: CRMDealData): Promise<{ id: string }> {
    const opportunity: Record<string, string | number> = {
      Name: data.name,
      StageName: data.stage || "Prospecting",
      CloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now
    };

    if (data.amount) opportunity.Amount = data.amount;
    if (data.companyId) opportunity.AccountId = data.companyId;

    const result = await this.request<{ id: string }>("/sobjects/Opportunity", {
      method: "POST",
      body: JSON.stringify(opportunity),
    });

    return { id: result.id };
  }

  async createNote(data: CRMNoteData): Promise<{ id: string }> {
    // Salesforce uses ContentNote for notes
    const note: Record<string, string> = {
      Title: "Axidex Signal",
      Content: Buffer.from(data.content).toString("base64"),
    };

    const result = await this.request<{ id: string }>("/sobjects/ContentNote", {
      method: "POST",
      body: JSON.stringify(note),
    });

    // Link note to objects using ContentDocumentLink
    const linkedEntityId = data.companyId || data.contactId || data.dealId;
    if (linkedEntityId) {
      await this.request("/sobjects/ContentDocumentLink", {
        method: "POST",
        body: JSON.stringify({
          ContentDocumentId: result.id,
          LinkedEntityId: linkedEntityId,
          ShareType: "V",
        }),
      });
    }

    return { id: result.id };
  }

  async syncSignal(
    signal: Signal,
    _fieldMapping: CRMFieldMapping
  ): Promise<CRMSyncResult> {
    try {
      let companyId: string | undefined;
      let noteId: string | undefined;

      // Try to find existing account by domain
      if (signal.company_domain) {
        const existing = await this.findCompanyByDomain(signal.company_domain);
        if (existing) {
          companyId = existing.id;
        }
      }

      // Create account if not found
      if (!companyId) {
        const company = await this.createCompany({
          name: signal.company_name,
          domain: signal.company_domain || undefined,
          industry: signal.metadata?.industry,
          description: `Signal detected: ${signal.title}`,
        });
        companyId = company.id;
      }

      // Create task (Salesforce uses Task object for notes/activities)
      const taskContent = this.formatSignalNote(signal);
      const task = await this.createTask({
        subject: `Signal: ${signal.title}`,
        description: taskContent,
        accountId: companyId,
        priority: signal.priority === "high" ? "High" : "Normal",
      });
      noteId = task.id;

      return {
        success: true,
        companyId,
        noteId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async createTask(data: {
    subject: string;
    description: string;
    accountId?: string;
    priority?: string;
  }): Promise<{ id: string }> {
    const task: Record<string, string> = {
      Subject: data.subject,
      Description: data.description,
      Status: "Not Started",
      Priority: data.priority || "Normal",
    };

    if (data.accountId) task.WhatId = data.accountId;

    const result = await this.request<{ id: string }>("/sobjects/Task", {
      method: "POST",
      body: JSON.stringify(task),
    });

    return { id: result.id };
  }

  private formatSignalNote(signal: Signal): string {
    const typeLabel = SIGNAL_TYPE_LABELS[signal.signal_type] || signal.signal_type;
    const priorityLabel = PRIORITY_LABELS[signal.priority] || signal.priority;

    let note = `Signal Detected by Axidex\n\n`;
    note += `Type: ${typeLabel}\n`;
    note += `Priority: ${priorityLabel}\n`;
    note += `Title: ${signal.title}\n\n`;
    note += `Summary:\n${signal.summary}\n\n`;
    note += `Source: ${signal.source_name}\n`;
    note += `URL: ${signal.source_url}\n`;
    note += `Detected: ${new Date(signal.detected_at).toLocaleDateString()}\n`;

    if (signal.metadata) {
      note += `\nAdditional Info:\n`;
      if (signal.metadata.funding_amount)
        note += `- Funding: ${signal.metadata.funding_amount}\n`;
      if (signal.metadata.location)
        note += `- Location: ${signal.metadata.location}\n`;
      if (signal.metadata.job_titles?.length)
        note += `- Roles: ${signal.metadata.job_titles.join(", ")}\n`;
    }

    return note;
  }
}

// OAuth helpers
export function getSalesforceAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SALESFORCE_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: "api refresh_token",
    state,
  });

  return `https://login.salesforce.com/services/oauth2/authorize?${params}`;
}

export async function exchangeSalesforceCode(
  code: string,
  redirectUri: string
): Promise<CRMTokenResponse> {
  const response = await fetchWithTimeout(
    "https://login.salesforce.com/services/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SALESFORCE_CLIENT_ID!,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        code,
      }),
      timeout: 10000,
      retries: 2,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Salesforce token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: "Bearer",
    instance_url: data.instance_url,
  };
}
