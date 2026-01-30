"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Signal, GeneratedEmail } from "@/types";
import type { EmailTone } from "@/lib/ai/email-generator";
import { motion } from "motion/react";

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
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<GeneratedEmailData | null>(null);
  const [selectedTone, setSelectedTone] = useState<EmailTone>("professional");
  const [copySuccess, setCopySuccess] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
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

      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard");
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
