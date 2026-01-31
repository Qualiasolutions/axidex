"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type OnboardingPhase = "idle" | "welcome" | "tour" | "wizard" | "complete";

export interface OnboardingState {
  phase: OnboardingPhase;
  tourStep: number;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
}

export interface OnboardingActions {
  startOnboarding: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  startWizard: () => void;
  completeOnboarding: () => Promise<void>;
  skip: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const TOTAL_TOUR_STEPS = 3;

export function useOnboarding(): OnboardingState & OnboardingActions {
  const [phase, setPhase] = useState<OnboardingPhase>("idle");
  const [tourStep, setTourStep] = useState(0);
  // Default to true to avoid flash - only show onboarding if explicitly null
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // On mount, check if user exists and fetch onboarding status
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed_at")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching onboarding status:", error);
          setIsLoading(false);
          return;
        }

        // If onboarding_completed_at is null, user hasn't completed onboarding
        const completed = profile?.onboarding_completed_at !== null;
        setHasCompletedOnboarding(completed);

        // Auto-start onboarding if not completed
        if (!completed) {
          setPhase("welcome");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, []);

  const startOnboarding = useCallback(() => {
    setPhase("welcome");
  }, []);

  const startTour = useCallback(() => {
    setPhase("tour");
    setTourStep(0);
  }, []);

  const nextTourStep = useCallback(() => {
    if (tourStep < TOTAL_TOUR_STEPS - 1) {
      setTourStep((prev) => prev + 1);
    }
  }, [tourStep]);

  const prevTourStep = useCallback(() => {
    if (tourStep > 0) {
      setTourStep((prev) => prev - 1);
    }
  }, [tourStep]);

  const startWizard = useCallback(() => {
    setPhase("wizard");
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!userId) return;

    // Optimistic update
    setHasCompletedOnboarding(true);
    setPhase("complete");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        console.error("Error completing onboarding:", error);
        // Rollback on error
        setHasCompletedOnboarding(false);
        setPhase("tour");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setHasCompletedOnboarding(false);
      setPhase("tour");
    }
  }, [userId]);

  const skip = useCallback(async () => {
    if (!userId) return;

    // Optimistic update
    setHasCompletedOnboarding(true);
    setPhase("complete");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        console.error("Error skipping onboarding:", error);
        // Rollback on error
        setHasCompletedOnboarding(false);
        setPhase("welcome");
      }
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      setHasCompletedOnboarding(false);
      setPhase("welcome");
    }
  }, [userId]);

  const resetOnboarding = useCallback(async () => {
    if (!userId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed_at: null })
        .eq("id", userId);

      if (error) {
        console.error("Error resetting onboarding:", error);
        return;
      }

      setHasCompletedOnboarding(false);
      setPhase("welcome");
      setTourStep(0);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  }, [userId]);

  return {
    // State
    phase,
    tourStep,
    hasCompletedOnboarding,
    isLoading,
    // Actions
    startOnboarding,
    startTour,
    nextTourStep,
    prevTourStep,
    startWizard,
    completeOnboarding,
    skip,
    resetOnboarding,
  };
}
