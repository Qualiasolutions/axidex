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

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export class HubSpotClient implements CRMClient {
  provider = "hubspot" as const;
  private accessToken: string;
  private refreshTokenValue: string | null;
  private portalId: string | null;

  constructor(accessToken: string, refreshToken?: string, portalId?: string) {
    this.accessToken = accessToken;
    this.refreshTokenValue = refreshToken ?? null;
    this.portalId = portalId ?? null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${HUBSPOT_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HubSpot API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async refreshToken(): Promise<CRMTokenResponse> {
    if (!this.refreshTokenValue) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("https://api.hubapi.com/oauth/v1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.HUBSPOT_CLIENT_ID!,
        client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
        refresh_token: this.refreshTokenValue,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh HubSpot token");
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
    const properties: Record<string, string> = {
      name: data.name,
    };

    if (data.domain) properties.domain = data.domain;
    if (data.website) properties.website = data.website;
    if (data.industry) properties.industry = data.industry;
    if (data.description) properties.description = data.description;

    // Merge any custom properties
    if (data.properties) {
      Object.assign(properties, data.properties);
    }

    const result = await this.request<{ id: string }>(
      "/crm/v3/objects/companies",
      {
        method: "POST",
        body: JSON.stringify({ properties }),
      }
    );

    return { id: result.id };
  }

  async findCompanyByDomain(domain: string): Promise<{ id: string } | null> {
    try {
      const result = await this.request<{ results: { id: string }[] }>(
        `/crm/v3/objects/companies/search`,
        {
          method: "POST",
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "domain",
                    operator: "EQ",
                    value: domain,
                  },
                ],
              },
            ],
          }),
        }
      );

      return result.results.length > 0 ? { id: result.results[0].id } : null;
    } catch {
      return null;
    }
  }

  async updateCompany(
    id: string,
    data: Partial<CRMCompanyData>
  ): Promise<void> {
    const properties: Record<string, string> = {};
    if (data.name) properties.name = data.name;
    if (data.domain) properties.domain = data.domain;
    if (data.website) properties.website = data.website;
    if (data.industry) properties.industry = data.industry;
    if (data.description) properties.description = data.description;
    if (data.properties) Object.assign(properties, data.properties);

    await this.request(`/crm/v3/objects/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
  }

  async createContact(data: CRMContactData): Promise<{ id: string }> {
    const properties: Record<string, string> = {};
    if (data.email) properties.email = data.email;
    if (data.firstName) properties.firstname = data.firstName;
    if (data.lastName) properties.lastname = data.lastName;
    if (data.phone) properties.phone = data.phone;
    if (data.properties) Object.assign(properties, data.properties);

    const result = await this.request<{ id: string }>(
      "/crm/v3/objects/contacts",
      {
        method: "POST",
        body: JSON.stringify({ properties }),
      }
    );

    // Associate with company if provided
    if (data.companyId) {
      await this.request(
        `/crm/v3/objects/contacts/${result.id}/associations/companies/${data.companyId}/contact_to_company`,
        { method: "PUT" }
      );
    }

    return { id: result.id };
  }

  async findContactByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const result = await this.request<{ results: { id: string }[] }>(
        `/crm/v3/objects/contacts/search`,
        {
          method: "POST",
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  { propertyName: "email", operator: "EQ", value: email },
                ],
              },
            ],
          }),
        }
      );
      return result.results.length > 0 ? { id: result.results[0].id } : null;
    } catch {
      return null;
    }
  }

  async createDeal(data: CRMDealData): Promise<{ id: string }> {
    const properties: Record<string, string> = {
      dealname: data.name,
    };
    if (data.amount) properties.amount = String(data.amount);
    if (data.stage) properties.dealstage = data.stage;
    if (data.properties) Object.assign(properties, data.properties);

    const result = await this.request<{ id: string }>("/crm/v3/objects/deals", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });

    // Associate with company/contact if provided
    if (data.companyId) {
      await this.request(
        `/crm/v3/objects/deals/${result.id}/associations/companies/${data.companyId}/deal_to_company`,
        { method: "PUT" }
      );
    }
    if (data.contactId) {
      await this.request(
        `/crm/v3/objects/deals/${result.id}/associations/contacts/${data.contactId}/deal_to_contact`,
        { method: "PUT" }
      );
    }

    return { id: result.id };
  }

  async createNote(data: CRMNoteData): Promise<{ id: string }> {
    const result = await this.request<{ id: string }>("/crm/v3/objects/notes", {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: data.content,
          hs_timestamp: new Date().toISOString(),
        },
      }),
    });

    // Associate note with objects
    if (data.companyId) {
      await this.request(
        `/crm/v3/objects/notes/${result.id}/associations/companies/${data.companyId}/note_to_company`,
        { method: "PUT" }
      );
    }
    if (data.contactId) {
      await this.request(
        `/crm/v3/objects/notes/${result.id}/associations/contacts/${data.contactId}/note_to_contact`,
        { method: "PUT" }
      );
    }
    if (data.dealId) {
      await this.request(
        `/crm/v3/objects/notes/${result.id}/associations/deals/${data.dealId}/note_to_deal`,
        { method: "PUT" }
      );
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

      // Try to find existing company by domain
      if (signal.company_domain) {
        const existing = await this.findCompanyByDomain(signal.company_domain);
        if (existing) {
          companyId = existing.id;
        }
      }

      // Create company if not found
      if (!companyId) {
        const company = await this.createCompany({
          name: signal.company_name,
          domain: signal.company_domain || undefined,
          website: signal.company_domain
            ? `https://${signal.company_domain}`
            : undefined,
          industry: signal.metadata?.industry,
          description: `Signal detected: ${signal.title}`,
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

    let note = `📊 Signal Detected by Axidex\n\n`;
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
export function getHubSpotAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.HUBSPOT_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: "crm.objects.companies.write crm.objects.companies.read crm.objects.contacts.write crm.objects.contacts.read crm.objects.deals.write crm.objects.deals.read",
    state,
  });

  return `https://app.hubspot.com/oauth/authorize?${params}`;
}

export async function exchangeHubSpotCode(
  code: string,
  redirectUri: string
): Promise<CRMTokenResponse> {
  const response = await fetch("https://api.hubapi.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot token exchange failed: ${error}`);
  }

  const data = await response.json();

  // Get portal ID
  const accessInfoResponse = await fetch(
    `https://api.hubapi.com/oauth/v1/access-tokens/${data.access_token}`
  );
  const accessInfo = await accessInfoResponse.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    token_type: "Bearer",
    portal_id: String(accessInfo.hub_id),
  };
}
