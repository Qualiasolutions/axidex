"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Loader2, Check, Bell, BellOff, MessageSquare, ExternalLink, ChevronDown, Link2, Unlink, Key } from "lucide-react";
import { CRM_PROVIDERS } from "@/lib/crm";
import type { CRMProvider } from "@/types";
import { ScraperConfigSection } from "@/components/settings/scraper-config";

const SIGNAL_TYPES = [
  { id: "hiring", label: "Hiring", description: "Job postings, team growth" },
  { id: "funding", label: "Funding", description: "Investment rounds, capital raises" },
  { id: "expansion", label: "Expansion", description: "New markets, locations" },
  { id: "partnership", label: "Partnership", description: "Strategic partnerships, integrations" },
  { id: "product_launch", label: "Product Launch", description: "New products, features" },
  { id: "leadership_change", label: "Leadership Change", description: "Executive changes, promotions" },
];

const PRIORITY_OPTIONS = [
  { id: "high", label: "High priority only", description: "Only the most important signals" },
  { id: "medium", label: "Medium and high", description: "Important signals and above" },
  { id: "low", label: "All signals", description: "Every signal we detect" },
];

interface NotificationPreferences {
  email_enabled: boolean;
  signal_types: string[];
  priority_threshold: string;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}

interface SlackSettings {
  workspace_id: string | null;
  workspace_name: string | null;
  channel_id: string | null;
  channel_name: string | null;
  enabled: boolean;
}

interface CRMIntegrationDisplay {
  id: string;
  provider: CRMProvider;
  connected_at: string;
  auto_sync_enabled: boolean;
  portal_id?: string | null;
  instance_url?: string | null;
}

const DEFAULT_PREFS: NotificationPreferences = {
  email_enabled: true,
  signal_types: SIGNAL_TYPES.map((t) => t.id),
  priority_threshold: "high",
};

const DEFAULT_SLACK: SlackSettings = {
  workspace_id: null,
  workspace_name: null,
  channel_id: null,
  channel_name: null,
  enabled: false,
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [slack, setSlack] = useState<SlackSettings>(DEFAULT_SLACK);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slackMessage, setSlackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [slackTesting, setSlackTesting] = useState(false);

  // CRM state
  const [crmIntegrations, setCrmIntegrations] = useState<CRMIntegrationDisplay[]>([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const [crmMessage, setCrmMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [apolloApiKey, setApolloApiKey] = useState("");
  const [apolloConnecting, setApolloConnecting] = useState(false);
  const [showApolloInput, setShowApolloInput] = useState(false);
  const [attioApiKey, setAttioApiKey] = useState("");
  const [attioConnecting, setAttioConnecting] = useState(false);
  const [showAttioInput, setShowAttioInput] = useState(false);

  // Handle OAuth callback messages
  useEffect(() => {
    const slackConnected = searchParams.get("slack_connected");
    const slackError = searchParams.get("slack_error");
    const crmConnected = searchParams.get("crm_connected");
    const crmError = searchParams.get("error");

    if (slackConnected === "true") {
      setSlackMessage({ type: "success", text: "Slack connected successfully! Select a channel below." });
    } else if (slackError) {
      const errorMessages: Record<string, string> = {
        access_denied: "Slack authorization was cancelled",
        no_code: "Authorization failed - no code received",
        not_configured: "Slack integration is not configured",
        save_failed: "Failed to save Slack credentials",
        unknown: "An unknown error occurred",
      };
      setSlackMessage({ type: "error", text: errorMessages[slackError] || `Error: ${slackError}` });
    }

    if (crmConnected) {
      const providerName = CRM_PROVIDERS[crmConnected as CRMProvider]?.name || crmConnected;
      setCrmMessage({ type: "success", text: `${providerName} connected successfully!` });
      loadCrmIntegrations();
    } else if (crmError) {
      setCrmMessage({ type: "error", text: crmError });
    }

    // Clear URL params after showing message
    if (slackConnected || slackError || crmConnected || crmError) {
      window.history.replaceState({}, "", "/dashboard/settings");
    }
  }, [searchParams]);

  const loadCrmIntegrations = async () => {
    setCrmLoading(true);
    try {
      const response = await fetch("/api/crm");
      const data = await response.json();
      if (!data.error) {
        setCrmIntegrations(data.integrations || []);
      }
    } catch (err) {
      console.error("Error loading CRM integrations:", err);
    }
    setCrmLoading(false);
  };

  useEffect(() => {
    const loadPreferences = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch notification preferences and Slack settings
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("notification_preferences, slack_workspace_id, slack_workspace_name, slack_channel_id, slack_channel_name, slack_enabled")
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error("Error loading preferences:", fetchError);
        setError("Failed to load preferences");
      } else if (data) {
        // Type assertion for JSONB column
        const savedPrefs = (data as { notification_preferences: NotificationPreferences | null }).notification_preferences;
        if (savedPrefs) {
          setPrefs(savedPrefs);
        }

        // Load Slack settings
        setSlack({
          workspace_id: data.slack_workspace_id,
          workspace_name: data.slack_workspace_name,
          channel_id: data.slack_channel_id,
          channel_name: data.slack_channel_name,
          enabled: data.slack_enabled ?? false,
        });
      }

      // Load CRM integrations
      await loadCrmIntegrations();

      setLoading(false);
    };

    loadPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to save preferences");
      setSaving(false);
      return;
    }

    // Update notification preferences
    // The notification_preferences column is JSONB, which accepts our object directly
    // Type assertion needed: Supabase's type inference doesn't connect our Database types properly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("profiles")
      .update({ notification_preferences: prefs })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error saving preferences:", updateError);
      setError("Failed to save preferences");
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }

    setSaving(false);
  };

  const toggleSignalType = (typeId: string) => {
    const types = prefs.signal_types.includes(typeId)
      ? prefs.signal_types.filter((t) => t !== typeId)
      : [...prefs.signal_types, typeId];
    setPrefs({ ...prefs, signal_types: types });
  };

  const loadChannels = async () => {
    if (channels.length > 0) {
      setChannelsOpen(!channelsOpen);
      return;
    }

    setChannelsLoading(true);
    try {
      const response = await fetch("/api/slack/channels");
      const data = await response.json();

      if (data.error) {
        setSlackMessage({ type: "error", text: data.error });
      } else {
        setChannels(data.channels || []);
        setChannelsOpen(true);
      }
    } catch {
      setSlackMessage({ type: "error", text: "Failed to load channels" });
    }
    setChannelsLoading(false);
  };

  const selectChannel = async (channel: SlackChannel) => {
    try {
      const response = await fetch("/api/slack/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: channel.id,
          channel_name: channel.name,
          enabled: true,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setSlackMessage({ type: "error", text: data.error });
      } else {
        setSlack({
          ...slack,
          channel_id: channel.id,
          channel_name: channel.name,
          enabled: true,
        });
        setChannelsOpen(false);
        setSlackMessage({ type: "success", text: `Notifications will be sent to #${channel.name}` });
      }
    } catch {
      setSlackMessage({ type: "error", text: "Failed to update channel" });
    }
  };

  const toggleSlackEnabled = async () => {
    const newEnabled = !slack.enabled;

    try {
      const response = await fetch("/api/slack/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: slack.channel_id,
          channel_name: slack.channel_name,
          enabled: newEnabled,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setSlackMessage({ type: "error", text: data.error });
      } else {
        setSlack({ ...slack, enabled: newEnabled });
      }
    } catch {
      setSlackMessage({ type: "error", text: "Failed to update Slack settings" });
    }
  };

  const disconnectCrm = async (integrationId: string, provider: CRMProvider) => {
    try {
      const response = await fetch(`/api/crm?id=${integrationId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.error) {
        setCrmMessage({ type: "error", text: data.error });
      } else {
        setCrmIntegrations((prev) => prev.filter((i) => i.id !== integrationId));
        setCrmMessage({ type: "success", text: `${CRM_PROVIDERS[provider].name} disconnected` });
      }
    } catch {
      setCrmMessage({ type: "error", text: "Failed to disconnect CRM" });
    }
  };

  const connectApollo = async () => {
    if (!apolloApiKey.trim()) {
      setCrmMessage({ type: "error", text: "Please enter your Apollo API key" });
      return;
    }

    setApolloConnecting(true);
    try {
      const response = await fetch("/api/crm/apollo/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apolloApiKey }),
      });
      const data = await response.json();

      if (data.error) {
        setCrmMessage({ type: "error", text: data.error });
      } else {
        setCrmMessage({ type: "success", text: "Apollo.io connected successfully!" });
        setApolloApiKey("");
        setShowApolloInput(false);
        await loadCrmIntegrations();
      }
    } catch {
      setCrmMessage({ type: "error", text: "Failed to connect Apollo" });
    }
    setApolloConnecting(false);
  };

  const connectAttio = async () => {
    if (!attioApiKey.trim()) {
      setCrmMessage({ type: "error", text: "Please enter your Attio API key" });
      return;
    }

    setAttioConnecting(true);
    try {
      const response = await fetch("/api/crm/attio/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: attioApiKey }),
      });
      const data = await response.json();

      if (data.error) {
        setCrmMessage({ type: "error", text: data.error });
      } else {
        setCrmMessage({ type: "success", text: "Attio connected successfully!" });
        setAttioApiKey("");
        setShowAttioInput(false);
        await loadCrmIntegrations();
      }
    } catch {
      setCrmMessage({ type: "error", text: "Failed to connect Attio" });
    }
    setAttioConnecting(false);
  };

  const toggleCrmSync = async (integrationId: string, enabled: boolean) => {
    try {
      const response = await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: integrationId, auto_sync_enabled: enabled }),
      });
      const data = await response.json();

      if (data.error) {
        setCrmMessage({ type: "error", text: data.error });
      } else {
        setCrmIntegrations((prev) =>
          prev.map((i) => (i.id === integrationId ? { ...i, auto_sync_enabled: enabled } : i))
        );
      }
    } catch {
      setCrmMessage({ type: "error", text: "Failed to update CRM settings" });
    }
  };

  const testSlack = async () => {
    setSlackTesting(true);
    setSlackMessage(null);
    try {
      const response = await fetch("/api/slack/test", {
        method: "POST",
      });
      const data = await response.json();

      if (data.error) {
        setSlackMessage({ type: "error", text: data.error });
      } else {
        setSlackMessage({ type: "success", text: data.message || "Test notification sent!" });
      }
    } catch {
      setSlackMessage({ type: "error", text: "Failed to send test notification" });
    }
    setSlackTesting(false);
  };

  const disconnectSlack = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("profiles")
      .update({
        slack_workspace_id: null,
        slack_workspace_name: null,
        slack_access_token: null,
        slack_channel_id: null,
        slack_channel_name: null,
        slack_enabled: false,
      })
      .eq("id", user.id);

    if (updateError) {
      setSlackMessage({ type: "error", text: "Failed to disconnect Slack" });
    } else {
      setSlack(DEFAULT_SLACK);
      setChannels([]);
      setSlackMessage({ type: "success", text: "Slack disconnected" });
    }
  };

  if (loading) {
    return (
      <main className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold text-foreground">Notification Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure how and when you want to be notified about new signals.
        </p>
      </motion.div>

      {/* Email toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {prefs.email_enabled ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <h2 className="font-medium text-foreground">Email Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for new signals matching your criteria
              </p>
            </div>
          </div>
          <button
            onClick={() => setPrefs({ ...prefs, email_enabled: !prefs.email_enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              prefs.email_enabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                prefs.email_enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Slack integration */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-medium text-foreground">Slack Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Get real-time signal alerts in your Slack channel
            </p>
          </div>
        </div>

        {slackMessage && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              slackMessage.type === "success"
                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {slackMessage.text}
          </div>
        )}

        {!slack.workspace_id ? (
          <a
            href="/api/slack/oauth"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A154B] text-white rounded-lg hover:bg-[#3a1039] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
            </svg>
            Connect Slack
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{slack.workspace_name}</p>
                <p className="text-xs text-muted-foreground">Connected workspace</p>
              </div>
              <button
                onClick={disconnectSlack}
                className="text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                Disconnect
              </button>
            </div>

            {/* Channel selector */}
            <div className="relative">
              <button
                onClick={loadChannels}
                disabled={channelsLoading}
                className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:border-muted-foreground/30 transition-colors"
              >
                <span className="text-sm">
                  {slack.channel_name ? `#${slack.channel_name}` : "Select a channel..."}
                </span>
                {channelsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${channelsOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {channelsOpen && channels.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-card border border-border rounded-lg shadow-lg">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => selectChannel(channel)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors ${
                        slack.channel_id === channel.id ? "bg-primary/5 text-primary" : ""
                      }`}
                    >
                      #{channel.name}
                      {channel.is_private && (
                        <span className="ml-2 text-xs text-muted-foreground">(private)</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Slack enabled toggle */}
            {slack.channel_id && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Send notifications to Slack
                  </span>
                  <button
                    onClick={toggleSlackEnabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      slack.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        slack.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Test Slack button */}
                {slack.enabled && (
                  <button
                    onClick={testSlack}
                    disabled={slackTesting}
                    className="w-full px-4 py-2 text-sm border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {slackTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending test...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        Send Test Notification
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Scraper Configuration */}
      <ScraperConfigSection />

      {/* CRM Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.17 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Link2 className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-medium text-foreground">CRM Integrations</h2>
            <p className="text-sm text-muted-foreground">
              Connect your CRM to automatically sync signals
            </p>
          </div>
        </div>

        {crmMessage && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              crmMessage.type === "success"
                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {crmMessage.text}
          </div>
        )}

        {crmLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected CRMs */}
            {crmIntegrations.map((integration) => {
              const provider = CRM_PROVIDERS[integration.provider];
              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{provider.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Connected {new Date(integration.connected_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Auto-sync</span>
                      <button
                        onClick={() => toggleCrmSync(integration.id, !integration.auto_sync_enabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          integration.auto_sync_enabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            integration.auto_sync_enabled ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <button
                      onClick={() => disconnectCrm(integration.id, integration.provider)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Disconnect"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Available CRMs to connect */}
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.entries(CRM_PROVIDERS) as [CRMProvider, typeof CRM_PROVIDERS[CRMProvider]][])
                .filter(([key]) => !crmIntegrations.some((i) => i.provider === key))
                .map(([key, provider]) => (
                  <div key={key}>
                    {key === "apollo" || key === "attio" ? (
                      <div className="border border-border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{provider.icon}</span>
                          <span className="font-medium text-foreground">{provider.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{provider.description}</p>

                        {(key === "apollo" ? showApolloInput : showAttioInput) ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Key className="w-4 h-4 text-muted-foreground" />
                              <input
                                type="password"
                                placeholder={`Enter ${provider.name} API key`}
                                value={key === "apollo" ? apolloApiKey : attioApiKey}
                                onChange={(e) => key === "apollo" ? setApolloApiKey(e.target.value) : setAttioApiKey(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={key === "apollo" ? connectApollo : connectAttio}
                                disabled={key === "apollo" ? apolloConnecting : attioConnecting}
                                className="flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                              >
                                {(key === "apollo" ? apolloConnecting : attioConnecting) ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  "Connect"
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  if (key === "apollo") {
                                    setShowApolloInput(false);
                                    setApolloApiKey("");
                                  } else {
                                    setShowAttioInput(false);
                                    setAttioApiKey("");
                                  }
                                }}
                                className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => key === "apollo" ? setShowApolloInput(true) : setShowAttioInput(true)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                          >
                            <Key className="w-4 h-4" />
                            Connect with API Key
                          </button>
                        )}
                      </div>
                    ) : key === "zoho" ? (
                      <div className="border border-border rounded-lg p-4 opacity-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{provider.icon}</span>
                          <span className="font-medium text-foreground">{provider.name}</span>
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Coming soon</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{provider.description}</p>
                      </div>
                    ) : (
                      <a
                        href={`/api/crm/${key}/oauth`}
                        className="block border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{provider.icon}</span>
                          <span className="font-medium text-foreground">{provider.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
                        <span className="text-xs text-primary flex items-center gap-1">
                          Connect <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Priority threshold */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h2 className="font-medium text-foreground mb-4">Priority Threshold</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Choose which signal priorities trigger notifications
        </p>
        <div className="space-y-3">
          {PRIORITY_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                prefs.priority_threshold === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <input
                type="radio"
                name="priority"
                checked={prefs.priority_threshold === opt.id}
                onChange={() => setPrefs({ ...prefs, priority_threshold: opt.id })}
                className="mt-0.5 h-4 w-4 text-primary border-border focus:ring-primary"
              />
              <div>
                <span className="font-medium text-foreground">{opt.label}</span>
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Signal types */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium text-foreground">Signal Types</h2>
            <p className="text-sm text-muted-foreground">
              Select which types of signals you want to be notified about
            </p>
          </div>
          <button
            onClick={() =>
              setPrefs({
                ...prefs,
                signal_types:
                  prefs.signal_types.length === SIGNAL_TYPES.length
                    ? []
                    : SIGNAL_TYPES.map((t) => t.id),
              })
            }
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {prefs.signal_types.length === SIGNAL_TYPES.length ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SIGNAL_TYPES.map((type) => {
            const isSelected = prefs.signal_types.includes(type.id);
            return (
              <label
                key={type.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSignalType(type.id)}
                  className="mt-0.5 h-4 w-4 text-primary border-border rounded focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-foreground">{type.label}</span>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Save button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex items-center gap-4"
      >
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            "Save preferences"
          )}
        </Button>
        {saveSuccess && (
          <span className="text-sm text-muted-foreground">
            Your preferences have been updated.
          </span>
        )}
      </motion.div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </main>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
