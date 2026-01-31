"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface ShortcutMap {
  [key: string]: string | (() => void);
}

const navigationShortcuts: ShortcutMap = {
  "g d": "/dashboard",
  "g s": "/dashboard/signals",
  "g e": "/dashboard/emails",
  "g a": "/dashboard/accounts",
  "g n": "/dashboard/analytics",
  "g r": "/dashboard/rules",
  "g ,": "/dashboard/settings",
};

export function useKeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if modifier keys are pressed (except for specific combos)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      // Handle two-key sequences (g + letter)
      if (key === "g") {
        // Set up listener for next key
        const handleSecondKey = (e: KeyboardEvent) => {
          const secondKey = e.key.toLowerCase();
          const combo = `g ${secondKey}`;

          if (navigationShortcuts[combo]) {
            e.preventDefault();
            const destination = navigationShortcuts[combo];
            if (typeof destination === "string") {
              router.push(destination);
            } else {
              destination();
            }
          }

          // Remove listener after handling
          window.removeEventListener("keydown", handleSecondKey);
        };

        // Clear listener after timeout
        const timeout = setTimeout(() => {
          window.removeEventListener("keydown", handleSecondKey);
        }, 1000);

        window.addEventListener("keydown", handleSecondKey, { once: true });

        return () => clearTimeout(timeout);
      }

      // Single key shortcuts
      if (key === "?") {
        event.preventDefault();
        setShowHelp((prev) => !prev);
      }

      if (key === "escape") {
        // Clear selection first, then close modals
        if (selectedIndex !== null) {
          setSelectedIndex(null);
        } else {
          const event = new CustomEvent("close-all-modals");
          window.dispatchEvent(event);
        }
      }

      // List navigation shortcuts
      if (key === "j") {
        event.preventDefault();
        const event_ = new CustomEvent("signal-list-next");
        window.dispatchEvent(event_);
      }

      if (key === "k") {
        event.preventDefault();
        const event_ = new CustomEvent("signal-list-prev");
        window.dispatchEvent(event_);
      }

      if (key === "enter") {
        const event_ = new CustomEvent("signal-list-open");
        window.dispatchEvent(event_);
      }
    },
    [router, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    showHelp,
    setShowHelp,
    selectedIndex,
    setSelectedIndex,
  };
}
