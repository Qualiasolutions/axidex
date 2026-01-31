"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, type Easing } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const easeOutExpo = [0.16, 1, 0.3, 1] as Easing;

interface TourStepProps {
  targetId: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SPOTLIGHT_PADDING = 8;
const TOOLTIP_OFFSET = 16;

export function TourStep({
  targetId,
  title,
  content,
  position = "bottom",
  step,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: TourStepProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const updatePosition = useCallback(() => {
    const target = document.getElementById(targetId);
    if (!target) {
      // Target not found - skip this step gracefully
      console.warn(`Tour target not found: ${targetId}`);
      onNext();
      return;
    }

    // Scroll target into view
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Small delay to let scroll complete
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Calculate tooltip position based on requested position
      const tooltipWidth = 320; // max-w-xs
      const tooltipHeight = 180; // approximate
      let x = 0;
      let y = 0;

      switch (position) {
        case "top":
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.top - tooltipHeight - TOOLTIP_OFFSET - SPOTLIGHT_PADDING;
          break;
        case "bottom":
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.bottom + TOOLTIP_OFFSET + SPOTLIGHT_PADDING;
          break;
        case "left":
          x = rect.left - tooltipWidth - TOOLTIP_OFFSET - SPOTLIGHT_PADDING;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
        case "right":
          x = rect.right + TOOLTIP_OFFSET + SPOTLIGHT_PADDING;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
      }

      // Keep tooltip within viewport bounds
      const padding = 16;
      x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));

      setTooltipPosition({ x, y });
    }, 300);
  }, [targetId, position, onNext]);

  useEffect(() => {
    updatePosition();

    // Update on resize/scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  const isLastStep = step === totalSteps - 1;
  const isFirstStep = step === 0;

  // Create spotlight box-shadow (dark overlay with cutout)
  const spotlightStyle = targetRect
    ? {
        boxShadow: `
          0 0 0 9999px rgba(0, 0, 0, 0.7),
          0 0 0 ${SPOTLIGHT_PADDING}px rgba(0, 0, 0, 0.7) inset
        `,
        top: targetRect.top - SPOTLIGHT_PADDING,
        left: targetRect.left - SPOTLIGHT_PADDING,
        width: targetRect.width + SPOTLIGHT_PADDING * 2,
        height: targetRect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  if (!targetRect) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Spotlight overlay with cutout */}
        <motion.div
          className="absolute rounded-xl"
          style={spotlightStyle || undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Tooltip */}
        <motion.div
          className="absolute z-[60] w-80 max-w-xs rounded-xl bg-white p-5 shadow-xl"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease: easeOutExpo }}
        >
          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Skip tour"
          >
            <X className="size-4" />
          </button>

          {/* Progress indicator */}
          <div className="mb-2 text-xs font-medium text-orange-600">
            Step {step + 1} of {totalSteps}
          </div>

          {/* Title */}
          <h3 className="mb-2 pr-8 text-base font-semibold text-gray-900">
            {title}
          </h3>

          {/* Content */}
          <p className="mb-4 text-sm text-gray-600">{content}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrev}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>

            <Button size="sm" onClick={onNext} className="gap-1">
              {isLastStep ? "Finish" : "Next"}
              {!isLastStep && <ChevronRight className="size-4" />}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
