"use client";

import { useEffect, useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { WelcomeModal } from "./welcome-modal";
import { FeatureTour } from "./feature-tour";
import { SetupWizard } from "./setup-wizard";
import { createClient } from "@/lib/supabase/client";

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const {
    phase,
    tourStep,
    hasCompletedOnboarding,
    isLoading,
    startTour,
    nextTourStep,
    prevTourStep,
    startWizard,
    completeOnboarding,
    skip,
  } = useOnboarding();

  const [userName, setUserName] = useState<string | undefined>();

  // Fetch user name for welcome modal
  useEffect(() => {
    async function fetchUserName() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(" ")[0]);
      }
    }
    fetchUserName();
  }, []);

  // Don't render anything while loading or if user has completed onboarding
  if (isLoading || hasCompletedOnboarding) {
    return <>{children}</>;
  }

  const handleWelcomeStartTour = () => {
    startTour();
  };

  const handleWelcomeSkip = async () => {
    await skip();
  };

  const handleTourComplete = () => {
    startWizard();
  };

  const handleTourSkip = async () => {
    await completeOnboarding();
  };

  const handleWizardComplete = async () => {
    await completeOnboarding();
  };

  const handleWizardSkip = async () => {
    await completeOnboarding();
  };

  return (
    <>
      {children}

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={phase === "welcome"}
        userName={userName}
        onStartTour={handleWelcomeStartTour}
        onSkip={handleWelcomeSkip}
      />

      {/* Feature Tour */}
      <FeatureTour
        isActive={phase === "tour"}
        currentStep={tourStep}
        onNext={nextTourStep}
        onPrev={prevTourStep}
        onSkip={handleTourSkip}
        onComplete={handleTourComplete}
      />

      {/* Setup Wizard */}
      <SetupWizard
        isOpen={phase === "wizard"}
        onComplete={handleWizardComplete}
        onSkip={handleWizardSkip}
      />
    </>
  );
}
