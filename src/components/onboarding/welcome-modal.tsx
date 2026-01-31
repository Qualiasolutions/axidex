"use client";

import { motion, AnimatePresence, type Easing } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const easeOutExpo = [0.16, 1, 0.3, 1] as Easing;

interface WelcomeModalProps {
  isOpen: boolean;
  userName?: string;
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeModal({
  isOpen,
  userName,
  onStartTour,
  onSkip,
}: WelcomeModalProps) {
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
            onClick={onSkip}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
          >
            {/* Close button */}
            <button
              onClick={onSkip}
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
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
                <Sparkles className="size-8 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                className="mb-2 text-2xl font-semibold text-gray-900"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: easeOutExpo }}
              >
                {userName ? `Welcome, ${userName}!` : "Welcome to Axidex"}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="mb-8 text-gray-600"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: easeOutExpo }}
              >
                You&apos;re all set to start detecting buying signals and
                generating personalized outreach. Let us show you around in 60
                seconds.
              </motion.p>

              {/* Actions */}
              <motion.div
                className="flex w-full flex-col gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25, ease: easeOutExpo }}
              >
                <Button onClick={onStartTour} size="lg" className="w-full">
                  Start Quick Tour
                </Button>
                <Button
                  onClick={onSkip}
                  variant="ghost"
                  size="lg"
                  className="w-full text-gray-500"
                >
                  Skip for now
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
