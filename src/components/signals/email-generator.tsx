"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Signal, GeneratedEmail } from "@/types";
import type { EmailTone } from "@/lib/ai/email-generator";
import { motion } from "motion/react";
import { toast } from "sonner";

interface EmailGeneratorProps {
  signalId: string;
  signal: Signal;
  existingEmail?: GeneratedEmail;
}

interface GeneratedEmailData {
  id: string;
  subject: string;
  body: string;
  tone: EmailTone;
  created_at: string;
}

export function EmailGenerator({ signalId, signal, existingEmail }: EmailGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<GeneratedEmailData | null>(null);
  const [selectedTone, setSelectedTone] = useState<EmailTone>("professional");
  const [copySuccess, setCopySuccess] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  // Load existing email on mount
  useEffect(() => {
    if (existingEmail) {
      setEmail({
        id: existingEmail.id,
        subject: existingEmail.subject,
        body: existingEmail.body,
        tone: existingEmail.tone,
        created_at: existingEmail.created_at,
      });
      setSelectedTone(existingEmail.tone);
    }
  }, [existingEmail]);

  const toneOptions: { value: EmailTone; label: string; description: string }[] = [
    {
      value: "professional",
      label: "Professional",
      description: "Business-focused and concise",
    },
    {
      value: "casual",
      label: "Casual",
      description: "Friendly and approachable",
    },
    {
      value: "enthusiastic",
      label: "Enthusiastic",
      description: "Energetic and excited",
    },
  ];

  const handleGenerateEmail = async () => {
    setLoading(true);
    setError(null);
    setCopySuccess(false);

    try {
      const response = await fetch(`/api/signals/${signalId}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tone: selectedTone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate email");
      }

      const data = await response.json();
      setEmail(data);
      toast.success("Email generated");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate email";
      setError(errorMsg);
      toast.error("Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!email) return;

    const emailText = `Subject: ${email.subject}\n\n${email.body}`;

    try {
      await navigator.clipboard.writeText(emailText);
      setCopySuccess(true);
      toast.success("Email copied to clipboard");

      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard");
      toast.error("Failed to copy email");
    }
  };

  const handleSendEmail = async () => {
    if (!email || !recipientEmail) return;

    setSending(true);
    setError(null);
    setSendSuccess(false);

    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: email.id,
          recipientEmail: recipientEmail.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-subtle)] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          AI Email Generator
        </h3>
        {email && (
          <Badge variant="success">
            Generated {new Date(email.created_at).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {/* Tone selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-tertiary)]">
          Email Tone
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {toneOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedTone(option.value)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTone === option.value
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="flex items-center gap-2">
        <Button
          variant="default"
          onClick={handleGenerateEmail}
          disabled={loading}
          className="min-w-[140px]"
        >
          {loading ? "Generating..." : email ? "Regenerate Email" : "Generate Email"}
        </Button>
        {email && (
          <Button
            variant="ghost"
            onClick={handleCopyToClipboard}
            disabled={loading}
            className="min-w-[120px]"
          >
            {copySuccess ? "✓ Copied!" : "Copy to Clipboard"}
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Generated email display */}
      {email && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-4 border-t border-[var(--border-subtle)] space-y-4"
        >
          {/* Subject */}
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
              Subject
            </label>
            <div className="px-3 py-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]">
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {email.subject}
              </p>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="text-xs font-medium text-[var(--text-tertiary)] block mb-1">
              Body
            </label>
            <div className="px-4 py-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)]">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {email.body}
              </p>
            </div>
          </div>

          {/* Send email section */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
            <label className="text-xs font-medium text-[var(--text-tertiary)] block">
              Send to Recipient
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@company.com"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                disabled={sending}
              />
              <Button
                variant="default"
                onClick={handleSendEmail}
                disabled={sending || !recipientEmail.trim()}
                className="min-w-[100px]"
              >
                {sending ? "Sending..." : sendSuccess ? "✓ Sent!" : "Send"}
              </Button>
            </div>
            {sendSuccess && (
              <p className="text-xs text-green-600">
                Email sent successfully to {recipientEmail}
              </p>
            )}
          </div>

          {/* Tone badge */}
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <span>Tone:</span>
            <Badge variant="default">
              {toneOptions.find((t) => t.value === email.tone)?.label || email.tone}
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && !email && (
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="h-10 bg-[var(--bg-secondary)] rounded-lg animate-pulse" />
          <div className="h-32 bg-[var(--bg-secondary)] rounded-lg animate-pulse" />
        </div>
      )}
    </div>
  );
}
