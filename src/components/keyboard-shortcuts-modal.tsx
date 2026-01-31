"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Easing } from "motion/react";
import { X } from "lucide-react";

const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcutGroups = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["g", "d"], description: "Go to Dashboard" },
      { keys: ["g", "s"], description: "Go to Signals" },
      { keys: ["g", "e"], description: "Go to Emails" },
      { keys: ["g", "a"], description: "Go to Accounts" },
      { keys: ["g", "n"], description: "Go to Analytics" },
      { keys: ["g", "r"], description: "Go to Rules" },
      { keys: ["g", ","], description: "Go to Settings" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["j"], description: "Next item" },
      { keys: ["k"], description: "Previous item" },
      { keys: ["Enter"], description: "Open selected item" },
      { keys: ["Esc"], description: "Close modal / Deselect" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-subtle)] shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">Navigate faster with these shortcuts</p>
                </div>
                <button
                  onClick={onClose}
                  className="size-9 rounded-lg flex items-center justify-center hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-8">
                {shortcutGroups.map((group, groupIndex) => (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: groupIndex * 0.1, ease: easeOutExpo }}
                  >
                    <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                      {group.title}
                    </h3>
                    <div className="space-y-2">
                      {group.shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                        >
                          <span className="text-sm text-[var(--text-primary)] font-medium">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <span key={keyIndex} className="flex items-center gap-1">
                                <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-md shadow-sm">
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="text-[var(--text-tertiary)] text-xs font-medium">then</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] p-4">
                <p className="text-xs text-[var(--text-tertiary)] text-center">
                  Press <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded shadow-sm mx-1">?</kbd> anytime to toggle this dialog
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
