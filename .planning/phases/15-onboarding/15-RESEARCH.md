# Phase 15: Onboarding - Research

**Researched:** 2026-01-31
**Domain:** User onboarding, guided tours, setup wizards
**Confidence:** HIGH

## Summary

This research covers implementing user onboarding for Axidex, a signal intelligence platform. The phase requires three components: (1) welcome screen for new users after signup, (2) guided tour of key features, and (3) quick setup wizard for notification preferences.

The recommended approach uses the existing Motion (Framer Motion) library already in the project for all animations, combined with a custom lightweight implementation rather than a third-party tour library. This decision is driven by: the project's design system already uses Motion extensively, the onboarding requirements are straightforward (3 requirements), and avoiding additional bundle size/dependencies aligns with the premium minimalist aesthetic.

Onboarding state will be tracked in the existing `profiles` table using a new `onboarding_completed_at` column, allowing detection of new users and enabling "show tour again" functionality.

**Primary recommendation:** Build custom onboarding components with Motion, store state in profiles table, trigger on first dashboard visit.

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | 12.29.2 | Animations | Already used throughout app, FadeIn/Stagger/etc. components exist |
| sonner | 2.0.7 | Toast notifications | Already configured in app layout |
| Supabase | 2.93.3 | State persistence | Profiles table already exists, add onboarding column |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.563.0 | Icons | Welcome screen and tour step icons |
| tailwind-merge | 3.4.0 | Class merging | Custom styling with cn() utility |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom components | React Joyride | External dependency, 4.3k stars, good for complex tours but overkill for 3 steps |
| Custom components | Onborda | Next.js native, Framer Motion based, but adds dependency for simple use case |
| Custom components | NextStepjs | Lightweight, but we already have Motion - no value add |
| profiles table | localStorage | localStorage is simpler but doesn't persist across devices |

**Installation:**
```bash
# No new packages needed - all dependencies exist
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── onboarding/
│       ├── welcome-modal.tsx       # ONBR-01: Welcome screen modal
│       ├── feature-tour.tsx        # ONBR-02: Guided tour overlay
│       ├── setup-wizard.tsx        # ONBR-03: Notification preferences wizard
│       ├── tour-step.tsx           # Reusable tour step component
│       └── tour-context.tsx        # Tour state management
├── hooks/
│   └── use-onboarding.ts           # Onboarding state hook
└── app/
    └── dashboard/
        └── layout.tsx              # Add OnboardingProvider wrapper
```

### Pattern 1: Modal-First Welcome Screen
**What:** Full-screen modal overlay with welcome message and CTA
**When to use:** First time user hits dashboard after signup
**Example:**
```typescript
// Source: Existing motion.tsx patterns in project
import { motion, AnimatePresence } from "motion/react";

interface WelcomeModalProps {
  isOpen: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ isOpen, onStart, onSkip }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onSkip}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full">
              {/* Content */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Pattern 2: Highlight Box Tour
**What:** Spotlight effect highlighting UI elements with tooltip
**When to use:** After welcome screen, walking through key features
**Example:**
```typescript
// Source: Pattern derived from Onborda/NextStepjs approaches
interface TourStepProps {
  targetSelector: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

// Use getBoundingClientRect() to position spotlight
// Render backdrop with CSS clip-path or box-shadow for cutout effect
// Position tooltip relative to target element
```

### Pattern 3: State Machine for Tour Flow
**What:** Context provider managing tour state
**When to use:** Coordinating between welcome -> tour -> wizard
**Example:**
```typescript
// Source: Standard React Context pattern
interface OnboardingState {
  phase: "idle" | "welcome" | "tour" | "wizard" | "complete";
  tourStep: number;
  wizardStep: number;
}

type OnboardingAction =
  | { type: "START_ONBOARDING" }
  | { type: "START_TOUR" }
  | { type: "NEXT_TOUR_STEP" }
  | { type: "PREV_TOUR_STEP" }
  | { type: "START_WIZARD" }
  | { type: "COMPLETE_WIZARD" }
  | { type: "SKIP" };

// Reducer pattern for predictable state transitions
```

### Anti-Patterns to Avoid
- **Mounting tour before DOM ready:** Wait for useEffect to ensure target elements exist
- **Blocking interaction during tour:** Keep UI accessible, don't prevent scrolling/clicking
- **Not handling resize/scroll:** Tour highlight position must update on viewport changes
- **Forcing completion:** Always provide skip option, respect user autonomy

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | Custom toast system | Sonner (already installed) | Edge cases: stacking, dismissal, accessibility |
| Date formatting | Manual string manipulation | date-fns (already installed) | Localization, timezone handling |
| Animation easing | Custom easing functions | Motion's built-in easing | Already using easeOutExpo in motion.tsx |
| Class merging | Template literals | cn() from utils.ts | Handles conflicting Tailwind classes |

**Key insight:** The project already has a rich component library and utility set. Leverage existing EmptyState, Button, Badge, motion components.

## Common Pitfalls

### Pitfall 1: Tour Target Not in DOM
**What goes wrong:** Tour tries to highlight element that hasn't rendered yet
**Why it happens:** Server components, lazy loading, async data
**How to avoid:**
- Use useEffect with dependency on target existence
- Add fallback if element not found (skip step or show generic message)
- Consider MutationObserver for dynamic content
**Warning signs:** Console errors about null getBoundingClientRect, flickering spotlight

### Pitfall 2: Z-Index Wars
**What goes wrong:** Tour overlay appears behind other elements (modals, dropdowns)
**Why it happens:** Competing z-index values across components
**How to avoid:**
- Use z-50 for backdrop, z-60 for spotlight cutout, z-70 for tooltip
- Document z-index scale in globals.css
- Test with sidebar open, mobile nav, etc.
**Warning signs:** Elements peeking through overlay, wrong element highlighted

### Pitfall 3: Not Persisting State Properly
**What goes wrong:** User sees onboarding repeatedly, or never sees it
**Why it happens:** Race condition between auth check and onboarding check
**How to avoid:**
- Fetch onboarding status with user profile in single query
- Use optimistic update when marking complete
- Handle offline/error gracefully
**Warning signs:** Flash of onboarding on every page load, state not syncing

### Pitfall 4: Breaking on Mobile
**What goes wrong:** Tour tooltips overflow viewport, touch interactions fail
**Why it happens:** Fixed positioning doesn't account for mobile viewport
**How to avoid:**
- Use dynamic positioning that adapts to viewport
- Test with iOS Safari (100vh issues)
- Ensure touch targets are large enough
**Warning signs:** Tooltips cut off, can't dismiss on touch, scroll locked

### Pitfall 5: Overwhelming Users
**What goes wrong:** Too many steps, too much text, user abandons
**Why it happens:** Feature creep, trying to explain everything
**How to avoid:**
- Maximum 5-7 tour steps
- Keep text under 50 words per step
- Highlight "aha moment" features only (Signals, Email Generation)
**Warning signs:** High skip rate, users not completing tour

## Code Examples

### Welcome Screen with Animation
```typescript
// Source: Based on existing motion.tsx FadeIn pattern
"use client";

import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  userName?: string;
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ isOpen, userName, onStartTour, onSkip }: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-card border border-border rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onSkip}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome{userName ? `, ${userName}` : " to Axidex"}!
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You're all set to start detecting buying signals and generating
              personalized outreach. Let us show you around in 60 seconds.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={onStartTour} className="flex-1">
                Start Quick Tour
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

### Onboarding State Hook
```typescript
// Source: Standard React hook pattern with Supabase
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface OnboardingStatus {
  hasCompletedOnboarding: boolean;
  completedAt: string | null;
  isLoading: boolean;
}

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus>({
    hasCompletedOnboarding: true, // Default to true to avoid flash
    completedAt: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setStatus({ hasCompletedOnboarding: true, completedAt: null, isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking onboarding:", error);
        setStatus({ hasCompletedOnboarding: true, completedAt: null, isLoading: false });
        return;
      }

      setStatus({
        hasCompletedOnboarding: !!data?.onboarding_completed_at,
        completedAt: data?.onboarding_completed_at,
        isLoading: false,
      });
    };

    checkOnboarding();
  }, []);

  const completeOnboarding = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const completedAt = new Date().toISOString();

    // Optimistic update
    setStatus(prev => ({ ...prev, hasCompletedOnboarding: true, completedAt }));

    await supabase
      .from("profiles")
      .update({ onboarding_completed_at: completedAt })
      .eq("id", user.id);
  }, []);

  const resetOnboarding = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    setStatus(prev => ({ ...prev, hasCompletedOnboarding: false, completedAt: null }));

    await supabase
      .from("profiles")
      .update({ onboarding_completed_at: null })
      .eq("id", user.id);
  }, []);

  return { ...status, completeOnboarding, resetOnboarding };
}
```

### Tour Step Highlight Component
```typescript
// Source: Derived from Onborda/Driver.js spotlight patterns
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const updateRect = () => {
      setTargetRect(target.getBoundingClientRect());
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect);

    // Scroll target into view
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [targetId]);

  if (!targetRect) return null;

  const padding = 8;
  const spotlightStyle = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with spotlight cutout using box-shadow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75)`,
        }}
      >
        <div
          className="absolute rounded-lg"
          style={{
            ...spotlightStyle,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75)`,
            backgroundColor: "transparent",
          }}
        />
      </div>

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: position === "top" ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === "top" ? 10 : -10 }}
        className="absolute bg-card border border-border rounded-xl p-4 max-w-sm shadow-xl z-60"
        style={{
          top: position === "bottom"
            ? targetRect.bottom + padding + 12
            : targetRect.top - padding - 12 - 150, // Approximate tooltip height
          left: Math.max(16, targetRect.left),
        }}
      >
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
          <button onClick={onSkip} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{content}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={step === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button size="sm" onClick={onNext}>
            {step === totalSteps ? "Finish" : "Next"}
            {step < totalSteps && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
```

### Setup Wizard for Notification Preferences
```typescript
// Source: Based on existing settings/page.tsx pattern
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SIGNAL_TYPES = [
  { id: "hiring", label: "Hiring", description: "Job postings, team growth" },
  { id: "funding", label: "Funding", description: "Investment rounds" },
  { id: "expansion", label: "Expansion", description: "New markets" },
  { id: "partnership", label: "Partnership", description: "Strategic partnerships" },
];

interface SetupWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function SetupWizard({ isOpen, onComplete, onSkip }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(SIGNAL_TYPES.map(t => t.id));
  const [saving, setSaving] = useState(false);

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from("profiles")
        .update({
          notification_preferences: {
            email_enabled: emailEnabled,
            signal_types: selectedTypes,
            priority_threshold: "high",
          },
        })
        .eq("id", user.id);
    }

    setSaving(false);
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-card border border-border rounded-2xl p-8 max-w-lg w-full mx-4"
          >
            {/* Step indicator */}
            <div className="flex gap-2 mb-6">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Bell className="w-10 h-10 text-primary mb-4" />
                  <h2 className="text-xl font-bold mb-2">Email Notifications</h2>
                  <p className="text-muted-foreground mb-6">
                    Get notified when new buying signals are detected for your target accounts.
                  </p>

                  <button
                    onClick={() => setEmailEnabled(!emailEnabled)}
                    className={`w-full p-4 rounded-lg border transition-colors ${
                      emailEnabled
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Enable email alerts</span>
                      <div className={`w-10 h-6 rounded-full transition-colors ${
                        emailEnabled ? "bg-primary" : "bg-muted"
                      }`}>
                        <div className={`w-4 h-4 mt-1 rounded-full bg-white transition-transform ${
                          emailEnabled ? "translate-x-5" : "translate-x-1"
                        }`} />
                      </div>
                    </div>
                  </button>

                  <div className="flex gap-3 mt-6">
                    <Button variant="ghost" onClick={onSkip}>Skip setup</Button>
                    <Button className="flex-1" onClick={() => setStep(2)}>Continue</Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <MessageSquare className="w-10 h-10 text-primary mb-4" />
                  <h2 className="text-xl font-bold mb-2">Signal Types</h2>
                  <p className="text-muted-foreground mb-6">
                    Choose which types of signals you want to track.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {SIGNAL_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => toggleType(type.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedTypes.includes(type.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${
                            selectedTypes.includes(type.id)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30"
                          }`}>
                            {selectedTypes.includes(type.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-sm">{type.label}</span>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Complete Setup"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| React Joyride (class-based) | Hooks + AnimatePresence | 2023 | Better integration with modern React |
| localStorage persistence | Database persistence | 2024 | Cross-device sync, analytics potential |
| Inline styles for spotlight | CSS box-shadow cutout | 2024 | Better performance, simpler code |
| Multiple tour libraries | Built-in with Motion | 2025 | Reduced bundle, consistent animations |

**Deprecated/outdated:**
- introjs-react: Wrapper for non-React library, poor TypeScript support
- reactour: Less maintained since 2022, hooks API incomplete
- Shepherd.js wrappers: Overkill for simple use cases

## Open Questions

1. **Tour Target IDs**
   - What we know: Need stable IDs for tour highlight targets
   - What's unclear: Which exact elements to highlight (sidebar items? stats cards? specific buttons?)
   - Recommendation: Plan specifies element IDs based on requirements

2. **Multi-Device State**
   - What we know: Database persistence handles cross-device
   - What's unclear: Should tour restart on new device?
   - Recommendation: Single onboarding_completed_at flag, user can manually "restart tour" from settings

3. **A/B Testing Setup**
   - What we know: Could track tour completion for analytics
   - What's unclear: Whether to implement immediately
   - Recommendation: Defer, but structure code to easily add Vercel Analytics events later

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: `src/components/ui/motion.tsx`, `src/app/dashboard/settings/page.tsx`
- Motion (Framer Motion) - AnimatePresence, motion components already in use
- Supabase profiles table schema - verified from `src/types/database.ts`

### Secondary (MEDIUM confidence)
- [NextStepjs](https://nextstepjs.com/) - API patterns, verified via official website
- [Onborda](https://github.com/uixmat/onborda) - Architecture patterns, 1.3k GitHub stars
- [React Joyride](https://github.com/gilbarbara/react-joyride) - Industry standard, 4.3k+ GitHub stars

### Tertiary (LOW confidence)
- WebSearch results on SaaS onboarding best practices - general guidance only
- OnboardJS Supabase plugin - mentioned but not deeply verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project
- Architecture: HIGH - Patterns based on existing codebase conventions
- Pitfalls: MEDIUM - Based on common issues from multiple sources

**Research date:** 2026-01-31
**Valid until:** 60 days (stable domain, no fast-moving dependencies)
