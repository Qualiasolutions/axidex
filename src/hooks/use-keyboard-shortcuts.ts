"use client";

import { useEffect, useCallback } from "react";
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
        // Show keyboard shortcuts help (could open a modal)
        console.log("Keyboard shortcuts help");
      }

      if (key === "escape") {
        // Close any open modals/drawers
        const event = new CustomEvent("close-all-modals");
        window.dispatchEvent(event);
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
