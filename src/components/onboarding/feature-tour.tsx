"use client";

import { TourStep } from "./tour-step";

interface TourStepConfig {
  targetId: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

// Tour steps configuration - 3 steps as recommended by research (under 5)
const TOUR_STEPS: TourStepConfig[] = [
  {
    targetId: "nav-signals",
    title: "Your Signal Feed",
    content:
      "See all detected buying signals here. Filter by type, priority, or company to focus on what matters.",
    position: "right",
  },
  {
    targetId: "btn-run-scraper",
    title: "Detect New Signals",
    content:
      "Click to scan for fresh buying signals from job boards, news, and LinkedIn.",
    position: "bottom",
  },
  {
    targetId: "nav-emails",
    title: "AI Email Drafts",
    content:
      "Generate personalized outreach emails for any signal with one click.",
    position: "right",
  },
];

interface FeatureTourProps {
  isActive: boolean;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

export function FeatureTour({
  isActive,
  currentStep,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}: FeatureTourProps) {
  if (!isActive) {
    return null;
  }

  const totalSteps = TOUR_STEPS.length;
  const currentStepConfig = TOUR_STEPS[currentStep];

  if (!currentStepConfig) {
    return null;
  }

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      // Last step - complete the tour
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <TourStep
      key={currentStep}
      targetId={currentStepConfig.targetId}
      title={currentStepConfig.title}
      content={currentStepConfig.content}
      position={currentStepConfig.position}
      step={currentStep}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrev={onPrev}
      onSkip={onSkip}
    />
  );
}
