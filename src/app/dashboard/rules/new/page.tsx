"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { ArrowLeft, Plus, X } from "lucide-react";
import type { SignalType, SignalPriority } from "@/types";

const signalTypes: { value: SignalType; label: string }[] = [
  { value: "hiring", label: "Hiring" },
  { value: "funding", label: "Funding" },
  { value: "expansion", label: "Expansion" },
  { value: "partnership", label: "Partnership" },
  { value: "product_launch", label: "Product Launch" },
  { value: "leadership_change", label: "Leadership Change" },
];

const priorities: { value: SignalPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const actionTypes = [
  { value: "generate_email", label: "Generate Email" },
  { value: "mark_status", label: "Change Status" },
  { value: "notify", label: "Send Notification" },
];

export default function NewRulePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<SignalType[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<SignalPriority[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const toggleType = (type: SignalType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePriority = (priority: SignalPriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]
    );
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords((prev) => [...prev, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Rule name is required");
      return;
    }
    if (selectedActions.length === 0) {
      setError("At least one action is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          trigger_conditions: {
            signal_types: selectedTypes.length > 0 ? selectedTypes : undefined,
            priorities: selectedPriorities.length > 0 ? selectedPriorities : undefined,
            keywords: keywords.length > 0 ? keywords : undefined,
          },
          actions: selectedActions.map((type) => ({
            type,
            config: {},
          })),
          is_active: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create rule");
      }

      router.push("/dashboard/rules");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create rule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="New Rule"
        subtitle="Create an automation rule"
        breadcrumbs={[
          { label: "Rules", href: "/dashboard/rules" },
          { label: "New Rule" },
        ]}
      />
      <main className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/rules")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Rules
            </Button>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleSubmit}
            className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-subtle)] space-y-6"
          >
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Auto-draft for high priority funding"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this rule do?"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
              />
            </div>

            {/* Trigger conditions */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                Trigger Conditions
              </h3>
              <p className="text-xs text-[var(--text-tertiary)]">
                Leave all empty to match any signal.
              </p>

              {/* Signal types */}
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-2">
                  Signal Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {signalTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleType(type.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        selectedTypes.includes(type.value)
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priorities */}
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-2">
                  Priorities
                </label>
                <div className="flex flex-wrap gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() => togglePriority(priority.value)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        selectedPriorities.includes(priority.value)
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-2">
                  Keywords
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="Add keyword..."
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addKeyword}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <Badge key={keyword} variant="default" className="gap-1">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">Actions *</h3>
              <p className="text-xs text-[var(--text-tertiary)]">
                What should happen when a signal matches?
              </p>
              <div className="flex flex-wrap gap-2">
                {actionTypes.map((action) => (
                  <button
                    key={action.value}
                    type="button"
                    onClick={() => toggleAction(action.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedActions.includes(action.value)
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/rules")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Rule"}
              </Button>
            </div>
          </motion.form>
        </div>
      </main>
    </>
  );
}
