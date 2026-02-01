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

const APOLLO_API_BASE = "https://api.apollo.io/v1";

export class ApolloClient implements CRMClient {
  provider = "apollo" as const;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetchWithTimeout(`${APOLLO_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": this.apiKey,
        ...options.headers,
      },
      timeout: 15000,
      retries: 2,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Apollo API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async refreshToken(): Promise<CRMTokenResponse> {
    // Apollo uses API keys, not OAuth tokens - no refresh needed
    return {
      access_token: this.apiKey,
      token_type: "api_key",
    };
  }

  async createCompany(data: CRMCompanyData): Promise<{ id: string }> {
    // Apollo calls companies "accounts" in their API
    const account: Record<string, string | undefined> = {
      name: data.name,
      domain: data.domain,
      website_url: data.website,
    };

    const result = await this.request<{ account: { id: string } }>(
      "/accounts",
      {
        method: "POST",
        body: JSON.stringify(account),
      }
    );

    return { id: result.account.id };
  }

  async findCompanyByDomain(domain: string): Promise<{ id: string } | null> {
    try {
      const result = await this.request<{
        accounts: { id: string }[];
      }>("/accounts/search", {
        method: "POST",
        body: JSON.stringify({
          q_organization_domains: domain,
          page: 1,
          per_page: 1,
        }),
      });

      return result.accounts?.length > 0 ? { id: result.accounts[0].id } : null;
    } catch {
      return null;
    }
  }

  async updateCompany(
    id: string,
    data: Partial<CRMCompanyData>
  ): Promise<void> {
    const account: Record<string, string | undefined> = {};
    if (data.name) account.name = data.name;
    if (data.domain) account.domain = data.domain;
    if (data.website) account.website_url = data.website;

    await this.request(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(account),
    });
  }

  async createContact(data: CRMContactData): Promise<{ id: string }> {
    const contact: Record<string, string | undefined> = {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      account_id: data.companyId,
    };

    const result = await this.request<{ contact: { id: string } }>(
      "/contacts",
      {
        method: "POST",
        body: JSON.stringify(contact),
      }
    );

    return { id: result.contact.id };
  }

  async findContactByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const result = await this.request<{
        contacts: { id: string }[];
      }>("/contacts/search", {
        method: "POST",
        body: JSON.stringify({
          q_emails: email,
          page: 1,
          per_page: 1,
        }),
      });

      return result.contacts?.length > 0 ? { id: result.contacts[0].id } : null;
    } catch {
      return null;
    }
  }

  async createDeal(data: CRMDealData): Promise<{ id: string }> {
    // Apollo calls deals "opportunities"
    const opportunity: Record<string, string | number | undefined> = {
      name: data.name,
      amount: data.amount,
      stage_name: data.stage,
      account_id: data.companyId,
    };

    const result = await this.request<{ opportunity: { id: string } }>(
      "/opportunities",
      {
        method: "POST",
        body: JSON.stringify(opportunity),
      }
    );

    return { id: result.opportunity.id };
  }

  async createNote(data: CRMNoteData): Promise<{ id: string }> {
    // Apollo uses "notes" or "activities" - we'll use notes
    const note: Record<string, string | undefined> = {
      body: data.content,
      account_id: data.companyId,
      contact_id: data.contactId,
    };

    const result = await this.request<{ note: { id: string } }>("/notes", {
      method: "POST",
      body: JSON.stringify(note),
    });

    return { id: result.note.id };
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

  // Apollo-specific: Enrich a company with Apollo data
  async enrichCompany(domain: string): Promise<{
    name?: string;
    industry?: string;
    employees?: number;
    revenue?: string;
    description?: string;
    linkedin_url?: string;
    twitter_url?: string;
    phone?: string;
    technologies?: string[];
  } | null> {
    try {
      const result = await this.request<{
        organization: {
          name?: string;
          industry?: string;
          estimated_num_employees?: number;
          annual_revenue?: string;
          short_description?: string;
          linkedin_url?: string;
          twitter_url?: string;
          phone?: string;
          technologies?: string[];
        };
      }>("/organizations/enrich", {
        method: "POST",
        body: JSON.stringify({ domain }),
      });

      const org = result.organization;
      return {
        name: org.name,
        industry: org.industry,
        employees: org.estimated_num_employees,
        revenue: org.annual_revenue,
        description: org.short_description,
        linkedin_url: org.linkedin_url,
        twitter_url: org.twitter_url,
        phone: org.phone,
        technologies: org.technologies,
      };
    } catch {
      return null;
    }
  }

  // Apollo-specific: Find contacts at a company
  async findContactsAtCompany(
    domain: string,
    options?: {
      titles?: string[];
      limit?: number;
    }
  ): Promise<
    {
      id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      title?: string;
      linkedinUrl?: string;
    }[]
  > {
    try {
      const searchParams: Record<string, string | string[] | number> = {
        q_organization_domains: domain,
        page: 1,
        per_page: options?.limit || 10,
      };

      if (options?.titles?.length) {
        searchParams.person_titles = options.titles;
      }

      const result = await this.request<{
        people: {
          id: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          title?: string;
          linkedin_url?: string;
        }[];
      }>("/people/search", {
        method: "POST",
        body: JSON.stringify(searchParams),
      });

      return (result.people || []).map((p) => ({
        id: p.id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        title: p.title,
        linkedinUrl: p.linkedin_url,
      }));
    } catch {
      return [];
    }
  }
}

// Apollo uses API key auth, not OAuth
export function getApolloAuthUrl(_redirectUri: string, _state: string): string {
  // Apollo doesn't use OAuth - return settings page where user enters API key
  throw new Error(
    "Apollo uses API key authentication. Please enter your API key in settings."
  );
}

export async function exchangeApolloCode(
  _code: string,
  _redirectUri: string
): Promise<CRMTokenResponse> {
  throw new Error(
    "Apollo uses API key authentication, not OAuth code exchange."
  );
}

// Validate Apollo API key
export async function validateApolloApiKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = new ApolloClient(apiKey);
    // Try to make a simple API call
    await client.findCompanyByDomain("example.com");
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid API key",
    };
  }
}
