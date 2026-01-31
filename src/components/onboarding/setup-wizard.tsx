"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Easing } from "motion/react";
import { Bell, MessageSquare, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const easeOutExpo = [0.16, 1, 0.3, 1] as Easing;

interface SetupWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface SignalType {
  id: string;
  label: string;
  description: string;
}

const SIGNAL_TYPES: SignalType[] = [
  { id: "hiring", label: "Hiring", description: "Job postings, team growth" },
  { id: "funding", label: "Funding", description: "Investment rounds" },
  { id: "expansion", label: "Expansion", description: "New markets" },
  { id: "partnership", label: "Partnership", description: "Strategic partnerships" },
];

export function SetupWizard({ isOpen, onComplete, onSkip }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [selectedSignalTypes, setSelectedSignalTypes] = useState<string[]>(
    SIGNAL_TYPES.map((t) => t.id)
  );
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const handleNext = () => {
    setDirection(1);
    setStep(2);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const toggleSignalType = (typeId: string) => {
    setSelectedSignalTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleComplete = async () => {
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const preferences = {
          email_enabled: emailEnabled,
          signal_types: selectedSignalTypes,
          priority_threshold: "high",
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("profiles")
          .update({ notification_preferences: preferences })
          .eq("id", user.id);
      }

      onComplete();
    } catch (error) {
      console.error("Error saving preferences:", error);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
          >
            {/* Step indicator */}
            <div className="mb-6 flex gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step >= 1 ? "bg-orange-500" : "bg-gray-200"
                }`}
              />
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step >= 2 ? "bg-orange-500" : "bg-gray-200"
                }`}
              />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon */}
                  <motion.div
                    className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: easeOutExpo,
                    }}
                  >
                    <Bell className="size-8 text-white" />
                  </motion.div>

                  <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                    Email Notifications
                  </h2>
                  <p className="mb-8 text-gray-600">
                    Get notified when new buying signals are detected for your
                    target accounts.
                  </p>

                  {/* Toggle */}
                  <div className="mb-8 flex items-center gap-4 rounded-xl bg-gray-50 px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      Email alerts
                    </span>
                    <button
                      onClick={() => setEmailEnabled(!emailEnabled)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        emailEnabled ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block size-5 transform rounded-full bg-white shadow-md transition-transform ${
                          emailEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        emailEnabled ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {emailEnabled ? "On" : "Off"}
                    </span>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon */}
                  <motion.div
                    className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: easeOutExpo,
                    }}
                  >
                    <MessageSquare className="size-8 text-white" />
                  </motion.div>

                  <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                    Signal Types
                  </h2>
                  <p className="mb-6 text-gray-600">
                    Choose which types of signals you want to track.
                  </p>

                  {/* Signal types grid */}
                  <div className="mb-6 grid w-full grid-cols-2 gap-3">
                    {SIGNAL_TYPES.map((type) => {
                      const isSelected = selectedSignalTypes.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          onClick={() => toggleSignalType(type.id)}
                          className={`relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-orange-500">
                              <Check className="size-3 text-white" />
                            </div>
                          )}
                          <span
                            className={`text-sm font-semibold ${
                              isSelected ? "text-orange-700" : "text-gray-900"
                            }`}
                          >
                            {type.label}
                          </span>
                          <span className="mt-0.5 text-xs text-gray-500">
                            {type.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {step === 1 ? (
                <>
                  <Button onClick={handleNext} size="lg" className="w-full">
                    Continue
                  </Button>
                  <Button
                    onClick={onSkip}
                    variant="ghost"
                    size="lg"
                    className="w-full text-gray-500"
                  >
                    Skip setup
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={onSkip}
                      variant="ghost"
                      size="lg"
                      className="flex-1 text-gray-500"
                    >
                      Skip setup
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
