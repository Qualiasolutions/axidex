import type { CRMProvider, CRMIntegration, Signal, CRMSyncResult } from "@/types";
import type { CRMClient } from "./types";
import { HubSpotClient, getHubSpotAuthUrl, exchangeHubSpotCode } from "./hubspot";
import { SalesforceClient, getSalesforceAuthUrl, exchangeSalesforceCode } from "./salesforce";
import { PipedriveClient, getPipedriveAuthUrl, exchangePipedriveCode } from "./pipedrive";
import { ApolloClient, getApolloAuthUrl, exchangeApolloCode, validateApolloApiKey } from "./apollo";

export * from "./types";
export { HubSpotClient } from "./hubspot";
export { SalesforceClient } from "./salesforce";
export { PipedriveClient } from "./pipedrive";
export { ApolloClient, validateApolloApiKey } from "./apollo";

// Provider display info
export const CRM_PROVIDERS: Record<
  CRMProvider,
  { name: string; icon: string; color: string; description: string }
> = {
  hubspot: {
    name: "HubSpot",
    icon: "🟠",
    color: "#FF7A59",
    description: "Connect to HubSpot CRM to sync companies and deals",
  },
  salesforce: {
    name: "Salesforce",
    icon: "☁️",
    color: "#00A1E0",
    description: "Connect to Salesforce to sync accounts and opportunities",
  },
  pipedrive: {
    name: "Pipedrive",
    icon: "🟢",
    color: "#017737",
    description: "Connect to Pipedrive to sync organizations and deals",
  },
  zoho: {
    name: "Zoho CRM",
    icon: "🔵",
    color: "#E42527",
    description: "Connect to Zoho CRM to sync leads and accounts",
  },
  apollo: {
    name: "Apollo.io",
    icon: "🚀",
    color: "#5B5FC7",
    description: "Connect to Apollo.io for sales intelligence and outreach",
  },
};

/**
 * Create a CRM client instance for the given integration
 */
export function createCRMClient(integration: CRMIntegration): CRMClient {
  switch (integration.provider) {
    case "hubspot":
      return new HubSpotClient(
        integration.access_token,
        integration.refresh_token ?? undefined,
        integration.portal_id ?? undefined
      );
    case "salesforce":
      if (!integration.instance_url) {
        throw new Error("Salesforce integration missing instance_url");
      }
      return new SalesforceClient(
        integration.access_token,
        integration.instance_url,
        integration.refresh_token ?? undefined
      );
    case "pipedrive":
      return new PipedriveClient(
        integration.access_token,
        integration.account_id ?? undefined,
        integration.refresh_token ?? undefined
      );
    case "apollo":
      return new ApolloClient(integration.access_token);
    case "zoho":
      throw new Error("Zoho CRM integration not yet implemented");
    default:
      throw new Error(`Unknown CRM provider: ${integration.provider}`);
  }
}

/**
 * Get OAuth authorization URL for a CRM provider
 */
export function getCRMAuthUrl(
  provider: CRMProvider,
  redirectUri: string,
  state: string
): string {
  switch (provider) {
    case "hubspot":
      return getHubSpotAuthUrl(redirectUri, state);
    case "salesforce":
      return getSalesforceAuthUrl(redirectUri, state);
    case "pipedrive":
      return getPipedriveAuthUrl(redirectUri, state);
    case "apollo":
      return getApolloAuthUrl(redirectUri, state);
    case "zoho":
      throw new Error("Zoho CRM OAuth not yet implemented");
    default:
      throw new Error(`Unknown CRM provider: ${provider}`);
  }
}

/**
 * Exchange OAuth code for tokens
 */
export async function exchangeCRMCode(
  provider: CRMProvider,
  code: string,
  redirectUri: string
) {
  switch (provider) {
    case "hubspot":
      return exchangeHubSpotCode(code, redirectUri);
    case "salesforce":
      return exchangeSalesforceCode(code, redirectUri);
    case "pipedrive":
      return exchangePipedriveCode(code, redirectUri);
    case "apollo":
      return exchangeApolloCode(code, redirectUri);
    case "zoho":
      throw new Error("Zoho CRM OAuth not yet implemented");
    default:
      throw new Error(`Unknown CRM provider: ${provider}`);
  }
}

/**
 * Sync a signal to a CRM
 */
export async function syncSignalToCRM(
  integration: CRMIntegration,
  signal: Signal
): Promise<CRMSyncResult> {
  // Check if signal type and priority match sync settings
  if (!integration.auto_sync_enabled) {
    return {
      success: false,
      error: "Auto-sync is disabled for this integration",
    };
  }

  if (
    integration.sync_on_signal_types.length > 0 &&
    !integration.sync_on_signal_types.includes(signal.signal_type)
  ) {
    return {
      success: false,
      error: `Signal type ${signal.signal_type} not configured for sync`,
    };
  }

  if (
    integration.sync_on_priorities.length > 0 &&
    !integration.sync_on_priorities.includes(signal.priority)
  ) {
    return {
      success: false,
      error: `Signal priority ${signal.priority} not configured for sync`,
    };
  }

  const client = createCRMClient(integration);
  return client.syncSignal(signal, integration.field_mapping);
}

/**
 * Check if a provider requires specific environment variables
 */
export function validateProviderConfig(provider: CRMProvider): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  switch (provider) {
    case "hubspot":
      if (!process.env.HUBSPOT_CLIENT_ID) missing.push("HUBSPOT_CLIENT_ID");
      if (!process.env.HUBSPOT_CLIENT_SECRET) missing.push("HUBSPOT_CLIENT_SECRET");
      break;
    case "salesforce":
      if (!process.env.SALESFORCE_CLIENT_ID) missing.push("SALESFORCE_CLIENT_ID");
      if (!process.env.SALESFORCE_CLIENT_SECRET) missing.push("SALESFORCE_CLIENT_SECRET");
      break;
    case "pipedrive":
      if (!process.env.PIPEDRIVE_CLIENT_ID) missing.push("PIPEDRIVE_CLIENT_ID");
      if (!process.env.PIPEDRIVE_CLIENT_SECRET) missing.push("PIPEDRIVE_CLIENT_SECRET");
      break;
    case "apollo":
      // Apollo uses API key, which is stored per-user, not in env vars
      break;
    case "zoho":
      if (!process.env.ZOHO_CLIENT_ID) missing.push("ZOHO_CLIENT_ID");
      if (!process.env.ZOHO_CLIENT_SECRET) missing.push("ZOHO_CLIENT_SECRET");
      break;
  }

  return { valid: missing.length === 0, missing };
}
