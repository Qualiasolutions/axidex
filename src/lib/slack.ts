import type { Signal } from "@/types";
import { fetchWithTimeout } from "./fetch-with-timeout";

interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
}

interface SlackTextObject {
  type: string;
  text: string;
  emoji?: boolean;
}

interface SlackBlock {
  type: string;
  text?: SlackTextObject;
  accessory?: {
    type: string;
    text?: SlackTextObject;
    url?: string;
  };
  elements?: Array<{
    type: string;
    text: string;
  }>;
}

const priorityEmoji: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

const typeEmoji: Record<string, string> = {
  hiring: "👥",
  funding: "💰",
  expansion: "🌍",
  partnership: "🤝",
  product_launch: "🚀",
  leadership_change: "👔",
};

export function buildSignalMessage(
  signal: Signal,
  dashboardUrl: string
): SlackMessage {
  const priorityIcon = priorityEmoji[signal.priority] || "⚪";
  const typeIcon = typeEmoji[signal.signal_type] || "📊";

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${priorityIcon} New ${signal.priority.toUpperCase()} Priority Signal`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${signal.company_name}*\n${typeIcon} ${signal.title}`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "View in Dashboard",
          emoji: true,
        },
        url: `${dashboardUrl}/dashboard/signals/${signal.id}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: signal.summary,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Source: <${signal.source_url}|${signal.source_name}>`,
        },
      ],
    },
  ];

  return {
    channel: "", // Will be set when sending
    text: `${priorityIcon} New ${signal.priority} priority signal from ${signal.company_name}: ${signal.title}`,
    blocks,
  };
}

export async function postToSlack(
  accessToken: string,
  channelId: string,
  signal: Signal,
  dashboardUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const message = buildSignalMessage(signal, dashboardUrl);
  message.channel = channelId;

  try {
    const response = await fetchWithTimeout("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
      timeout: 10000,
      retries: 2,
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Slack API error:", data.error);
      return { ok: false, error: data.error };
    }

    return { ok: true };
  } catch (err) {
    console.error("Error posting to Slack:", err);
    return { ok: false, error: "Failed to post message" };
  }
}
