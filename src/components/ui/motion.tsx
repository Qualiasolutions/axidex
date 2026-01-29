"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef, type ReactNode } from "react";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = 0.4, direction = "up", ...props }, ref) => {
    const directionOffset = {
      up: { y: 16 },
      down: { y: -16 },
      left: { x: 16 },
      right: { x: -16 },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...directionOffset[direction] }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{
          duration,
          delay,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

FadeIn.displayName = "FadeIn";

interface StaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function Stagger({ children, staggerDelay = 0.05, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.1 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

StaggerItem.displayName = "StaggerItem";

export function HoverScale({
  children,
  scale = 1.02,
  className,
}: {
  children: ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
