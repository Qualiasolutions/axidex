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

const PIPEDRIVE_API_BASE = "https://api.pipedrive.com/v1";

export class PipedriveClient implements CRMClient {
  provider = "pipedrive" as const;
  private accessToken: string;
  private refreshTokenValue: string | null;
  private companyDomain: string | null;

  constructor(accessToken: string, companyDomain?: string, refreshToken?: string) {
    this.accessToken = accessToken;
    this.companyDomain = companyDomain ?? null;
    this.refreshTokenValue = refreshToken ?? null;
  }

  private get apiBase(): string {
    return this.companyDomain
      ? `https://${this.companyDomain}.pipedrive.com/api/v1`
      : PIPEDRIVE_API_BASE;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(`${this.apiBase}${endpoint}`);
    url.searchParams.set("api_token", this.accessToken);

    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pipedrive API error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(`Pipedrive error: ${result.error}`);
    }

    return result.data;
  }

  async refreshToken(): Promise<CRMTokenResponse> {
    if (!this.refreshTokenValue) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("https://oauth.pipedrive.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PIPEDRIVE_CLIENT_ID}:${process.env.PIPEDRIVE_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshTokenValue,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh Pipedrive token");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshTokenValue = data.refresh_token;

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: "Bearer",
    };
  }

  async createCompany(data: CRMCompanyData): Promise<{ id: string }> {
    const organization: Record<string, string | number | boolean> = {
      name: data.name,
    };

    // Pipedrive doesn't have a domain field, use custom field or address
    if (data.website) {
      // Website is stored in a custom field or via API add-on
    }

    const result = await this.request<{ id: number }>("/organizations", {
      method: "POST",
      body: JSON.stringify(organization),
    });

    return { id: String(result.id) };
  }

  async findCompanyByDomain(domain: string): Promise<{ id: string } | null> {
    try {
      // Pipedrive search by name (domain search requires custom fields)
      const result = await this.request<{ items: { item: { id: number } }[] }>(
        `/organizations/search?term=${encodeURIComponent(domain)}&limit=1`
      );

      return result.items?.length > 0
        ? { id: String(result.items[0].item.id) }
        : null;
    } catch {
      return null;
    }
  }

  async updateCompany(
    id: string,
    data: Partial<CRMCompanyData>
  ): Promise<void> {
    const organization: Record<string, string> = {};
    if (data.name) organization.name = data.name;

    await this.request(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(organization),
    });
  }

  async createContact(data: CRMContactData): Promise<{ id: string }> {
    const person: Record<string, string | number | { value: string; primary: boolean }[]> = {
      name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown",
    };

    if (data.email) {
      person.email = [{ value: data.email, primary: true }];
    }
    if (data.phone) {
      person.phone = [{ value: data.phone, primary: true }];
    }
    if (data.companyId) {
      person.org_id = parseInt(data.companyId);
    }

    const result = await this.request<{ id: number }>("/persons", {
      method: "POST",
      body: JSON.stringify(person),
    });

    return { id: String(result.id) };
  }

  async findContactByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const result = await this.request<{ items: { item: { id: number } }[] }>(
        `/persons/search?term=${encodeURIComponent(email)}&fields=email&limit=1`
      );

      return result.items?.length > 0
        ? { id: String(result.items[0].item.id) }
        : null;
    } catch {
      return null;
    }
  }

  async createDeal(data: CRMDealData): Promise<{ id: string }> {
    const deal: Record<string, string | number> = {
      title: data.name,
    };

    if (data.amount) deal.value = data.amount;
    if (data.stage) deal.stage_id = parseInt(data.stage);
    if (data.companyId) deal.org_id = parseInt(data.companyId);
    if (data.contactId) deal.person_id = parseInt(data.contactId);

    const result = await this.request<{ id: number }>("/deals", {
      method: "POST",
      body: JSON.stringify(deal),
    });

    return { id: String(result.id) };
  }

  async createNote(data: CRMNoteData): Promise<{ id: string }> {
    const note: Record<string, string | number> = {
      content: data.content,
    };

    if (data.companyId) note.org_id = parseInt(data.companyId);
    if (data.contactId) note.person_id = parseInt(data.contactId);
    if (data.dealId) note.deal_id = parseInt(data.dealId);

    const result = await this.request<{ id: number }>("/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });

    return { id: String(result.id) };
  }

  async syncSignal(
    signal: Signal,
    _fieldMapping: CRMFieldMapping
  ): Promise<CRMSyncResult> {
    try {
      let companyId: string | undefined;
      let noteId: string | undefined;

      // Try to find existing organization by name/domain
      if (signal.company_domain) {
        const existing = await this.findCompanyByDomain(signal.company_domain);
        if (existing) {
          companyId = existing.id;
        }
      }

      // Create organization if not found
      if (!companyId) {
        const company = await this.createCompany({
          name: signal.company_name,
          domain: signal.company_domain || undefined,
          website: signal.company_domain
            ? `https://${signal.company_domain}`
            : undefined,
        });
        companyId = company.id;
      }

      // Create note with signal details
      const noteContent = this.formatSignalNote(signal);
      const note = await this.createNote({
        content: noteContent,
        companyId,
      });
      noteId = note.id;

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

  private formatSignalNote(signal: Signal): string {
    const typeLabel = SIGNAL_TYPE_LABELS[signal.signal_type] || signal.signal_type;
    const priorityLabel = PRIORITY_LABELS[signal.priority] || signal.priority;

    let note = `<b>📊 Signal Detected by Axidex</b><br><br>`;
    note += `<b>Type:</b> ${typeLabel}<br>`;
    note += `<b>Priority:</b> ${priorityLabel}<br>`;
    note += `<b>Title:</b> ${signal.title}<br><br>`;
    note += `<b>Summary:</b><br>${signal.summary}<br><br>`;
    note += `<b>Source:</b> ${signal.source_name}<br>`;
    note += `<b>URL:</b> <a href="${signal.source_url}">${signal.source_url}</a><br>`;
    note += `<b>Detected:</b> ${new Date(signal.detected_at).toLocaleDateString()}<br>`;

    if (signal.metadata) {
      note += `<br><b>Additional Info:</b><br>`;
      if (signal.metadata.funding_amount)
        note += `• Funding: ${signal.metadata.funding_amount}<br>`;
      if (signal.metadata.location)
        note += `• Location: ${signal.metadata.location}<br>`;
      if (signal.metadata.job_titles?.length)
        note += `• Roles: ${signal.metadata.job_titles.join(", ")}<br>`;
    }

    return note;
  }
}

// OAuth helpers
export function getPipedriveAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.PIPEDRIVE_CLIENT_ID!,
    redirect_uri: redirectUri,
    state,
  });

  return `https://oauth.pipedrive.com/oauth/authorize?${params}`;
}

export async function exchangePipedriveCode(
  code: string,
  redirectUri: string
): Promise<CRMTokenResponse> {
  const response = await fetch("https://oauth.pipedrive.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.PIPEDRIVE_CLIENT_ID}:${process.env.PIPEDRIVE_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pipedrive token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: "Bearer",
  };
}
