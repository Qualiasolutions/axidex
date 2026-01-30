import Anthropic from "@anthropic-ai/sdk";
import type { Signal } from "@/types";

export type EmailTone = "professional" | "casual" | "enthusiastic";

export interface GeneratedEmailContent {
  subject: string;
  body: string;
}

/**
 * Generate a personalized outreach email based on a buying signal using Claude.
 */
export async function generateEmail(
  signal: Signal,
  tone: EmailTone = "professional"
): Promise<GeneratedEmailContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env.local file."
    );
  }

  const anthropic = new Anthropic({
    apiKey,
  });

  // Build context-rich prompt
  const toneGuidelines = {
    professional:
      "Use a professional, respectful tone. Be concise and business-focused.",
    casual:
      "Use a friendly, approachable tone. Keep it conversational but still respectful.",
    enthusiastic:
      "Use an enthusiastic, energetic tone. Show genuine excitement about the opportunity.",
  };

  const metadataContext = signal.metadata
    ? Object.entries(signal.metadata)
        .filter(([_, value]) => value)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(", ")}`;
          }
          return `${key}: ${value}`;
        })
        .join("\n")
    : "";

  const systemPrompt = `You are a sales development representative writing personalized outreach emails.

Your emails should:
- Reference the specific signal/news that triggered the outreach
- Be concise (2-3 short paragraphs max)
- Focus on how you can help, not just selling
- Include a clear, low-friction call to action
- Avoid generic templates and buzzwords
- ${toneGuidelines[tone]}

Return ONLY a JSON object with two fields:
{
  "subject": "email subject line (max 60 characters)",
  "body": "email body text (plain text, no HTML)"
}`;

  const userPrompt = `Write an outreach email based on this buying signal:

Company: ${signal.company_name}
${signal.company_domain ? `Website: ${signal.company_domain}` : ""}

Signal Type: ${signal.signal_type}
Signal: ${signal.title}
Details: ${signal.summary}

${metadataContext ? `Additional Context:\n${metadataContext}` : ""}

Source: ${signal.source_name}

Generate an email that references this specific signal and offers relevant value.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text content from response
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in Claude response");
    }

    // Parse JSON response
    const responseText = textContent.text.trim();

    // Try to extract JSON from potential markdown code blocks
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonText);

    if (!parsed.subject || !parsed.body) {
      throw new Error("Invalid email format returned from Claude");
    }

    return {
      subject: parsed.subject,
      body: parsed.body,
    };
  } catch (error) {
    console.error("Error generating email:", error);

    if (error instanceof Error) {
      if (error.message.includes("authentication") || error.message.includes("API key")) {
        throw new Error(
          "Anthropic API authentication failed. Please check your ANTHROPIC_API_KEY."
        );
      }
      throw new Error(`Failed to generate email: ${error.message}`);
    }

    throw new Error("Failed to generate email. Please try again.");
  }
}
