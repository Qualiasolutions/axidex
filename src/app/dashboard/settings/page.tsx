"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Loader2, Check, Bell, BellOff } from "lucide-react";
import type { Json } from "@/types/database";

// Type for notification preferences stored as JSONB
type NotificationPrefsJson = Json;

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

const DEFAULT_PREFS: NotificationPreferences = {
  email_enabled: true,
  signal_types: SIGNAL_TYPES.map((t) => t.id),
  priority_threshold: "high",
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch notification preferences
      // Using explicit typing to avoid Supabase inference issues
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("notification_preferences")
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
      }

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
