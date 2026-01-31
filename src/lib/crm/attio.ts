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

const ATTIO_API_BASE = "https://api.attio.com/v2";

export class AttioClient implements CRMClient {
  provider = "attio" as const;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${ATTIO_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Attio API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async refreshToken(): Promise<CRMTokenResponse> {
    // Attio uses API keys, not OAuth tokens - no refresh needed
    return {
      access_token: this.apiKey,
      token_type: "api_key",
    };
  }

  async createCompany(data: CRMCompanyData): Promise<{ id: string }> {
    // Attio uses "objects" with type "companies"
    const record: Record<string, unknown> = {
      data: {
        values: {
          name: [{ value: data.name }],
        },
      },
    };

    if (data.domain) {
      record.data = {
        ...(record.data as object),
        values: {
          ...((record.data as { values: object }).values || {}),
          domains: [{ domain: data.domain }],
        },
      };
    }

    const result = await this.request<{ data: { id: { record_id: string } } }>(
      "/objects/companies/records",
      {
        method: "POST",
        body: JSON.stringify(record),
      }
    );

    return { id: result.data.id.record_id };
  }

  async findCompanyByDomain(domain: string): Promise<{ id: string } | null> {
    try {
      const result = await this.request<{
        data: { id: { record_id: string } }[];
      }>("/objects/companies/records/query", {
        method: "POST",
        body: JSON.stringify({
          filter: {
            domains: { contains: domain },
          },
          limit: 1,
        }),
      });

      return result.data?.length > 0
        ? { id: result.data[0].id.record_id }
        : null;
    } catch {
      return null;
    }
  }

  async updateCompany(
    id: string,
    data: Partial<CRMCompanyData>
  ): Promise<void> {
    const values: Record<string, unknown> = {};
    if (data.name) values.name = [{ value: data.name }];
    if (data.domain) values.domains = [{ domain: data.domain }];

    await this.request(`/objects/companies/records/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ data: { values } }),
    });
  }

  async createContact(data: CRMContactData): Promise<{ id: string }> {
    // Attio uses "people" object for contacts
    const values: Record<string, unknown> = {};

    if (data.email) {
      values.email_addresses = [{ email_address: data.email }];
    }
    if (data.firstName || data.lastName) {
      values.name = [
        {
          first_name: data.firstName || "",
          last_name: data.lastName || "",
        },
      ];
    }
    if (data.phone) {
      values.phone_numbers = [{ phone_number: data.phone }];
    }

    const result = await this.request<{ data: { id: { record_id: string } } }>(
      "/objects/people/records",
      {
        method: "POST",
        body: JSON.stringify({ data: { values } }),
      }
    );

    return { id: result.data.id.record_id };
  }

  async findContactByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const result = await this.request<{
        data: { id: { record_id: string } }[];
      }>("/objects/people/records/query", {
        method: "POST",
        body: JSON.stringify({
          filter: {
            email_addresses: { contains: email },
          },
          limit: 1,
        }),
      });

      return result.data?.length > 0
        ? { id: result.data[0].id.record_id }
        : null;
    } catch {
      return null;
    }
  }

  async createDeal(data: CRMDealData): Promise<{ id: string }> {
    // Attio uses "deals" object
    const values: Record<string, unknown> = {
      name: [{ value: data.name }],
    };

    if (data.amount) {
      values.value = [{ value: data.amount, currency_code: "USD" }];
    }
    if (data.stage) {
      values.stage = [{ status: data.stage }];
    }

    const result = await this.request<{ data: { id: { record_id: string } } }>(
      "/objects/deals/records",
      {
        method: "POST",
        body: JSON.stringify({ data: { values } }),
      }
    );

    return { id: result.data.id.record_id };
  }

  async createNote(data: CRMNoteData): Promise<{ id: string }> {
    // Attio uses "notes" which can be attached to records
    const note = {
      data: {
        format: "plaintext",
        content: data.content,
        parent_object: data.companyId ? "companies" : data.contactId ? "people" : "companies",
        parent_record_id: data.companyId || data.contactId || "",
      },
    };

    const result = await this.request<{ data: { id: { note_id: string } } }>(
      "/notes",
      {
        method: "POST",
        body: JSON.stringify(note),
      }
    );

    return { id: result.data.id.note_id };
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

// Attio uses API key auth, not OAuth
export function getAttioAuthUrl(_redirectUri: string, _state: string): string {
  throw new Error(
    "Attio uses API key authentication. Please enter your API key in settings."
  );
}

export async function exchangeAttioCode(
  _code: string,
  _redirectUri: string
): Promise<CRMTokenResponse> {
  throw new Error(
    "Attio uses API key authentication, not OAuth code exchange."
  );
}

// Validate Attio API key
export async function validateAttioApiKey(
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = new AttioClient(apiKey);
    // Try to list objects to validate the key
    await client.findCompanyByDomain("example.com");
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid API key",
    };
  }
}
