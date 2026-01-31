"use client";

import { motion, useInView, type HTMLMotionProps, type Easing } from "motion/react";
import { forwardRef, useRef, type ReactNode } from "react";

// Shared easing curves - cast to Easing type for motion/react compatibility
const easeOutExpo = [0.16, 1, 0.3, 1] as Easing;
const easeOutQuart = [0.25, 1, 0.5, 1] as Easing;
const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  blur?: boolean;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = 0.5, direction = "up", blur = false, ...props }, ref) => {
    const directionOffset = {
      up: { y: 24 },
      down: { y: -24 },
      left: { x: 24 },
      right: { x: -24 },
      none: {},
    };

    return (
      <motion.div
        ref={ref}
        initial={{
          opacity: 0,
          ...directionOffset[direction],
          ...(blur ? { filter: "blur(8px)" } : {})
        }}
        animate={{
          opacity: 1,
          x: 0,
          y: 0,
          ...(blur ? { filter: "blur(0px)" } : {})
        }}
        transition={{
          duration,
          delay,
          ease: easeOutExpo,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

FadeIn.displayName = "FadeIn";

interface FadeInViewProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  amount?: number;
  blur?: boolean;
}

export const FadeInView = forwardRef<HTMLDivElement, FadeInViewProps>(
  ({ children, delay = 0, duration = 0.6, direction = "up", once = true, amount = 0.3, blur = false, ...props }, ref) => {
    const localRef = useRef<HTMLDivElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDivElement>) || localRef;
    const isInView = useInView(resolvedRef, { once, amount });

    const directionOffset = {
      up: { y: 32 },
      down: { y: -32 },
      left: { x: 32 },
      right: { x: -32 },
      none: {},
    };

    return (
      <motion.div
        ref={resolvedRef}
        initial={{
          opacity: 0,
          ...directionOffset[direction],
          ...(blur ? { filter: "blur(10px)" } : {})
        }}
        animate={isInView ? {
          opacity: 1,
          x: 0,
          y: 0,
          ...(blur ? { filter: "blur(0px)" } : {})
        } : {}}
        transition={{
          duration,
          delay,
          ease: easeOutExpo,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

FadeInView.displayName = "FadeInView";

interface StaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  delayChildren?: number;
}

export function Stagger({ children, staggerDelay = 0.06, delayChildren = 0.1, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: staggerDelay, delayChildren },
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
        hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      }}
      transition={{ duration: 0.45, ease: easeOutExpo }}
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
      whileHover={{ scale, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({
  children,
  className,
  shadow = true,
}: {
  children: ReactNode;
  className?: string;
  shadow?: boolean;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{
        y: -4,
        ...(shadow ? {
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1), 0 8px 16px -8px rgba(0,0,0,0.06)"
        } : {})
      }}
      transition={{ duration: 0.3, ease: easeOutQuart }}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  className,
}: {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
}) {
  const directionOffset = {
    left: { x: -40, y: 0 },
    right: { x: 40, y: 0 },
    up: { x: 0, y: -40 },
    down: { x: 0, y: 40 },
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: easeOutQuart }}
    >
      {children}
    </motion.div>
  );
}

// Counter animation
export function AnimatedCounter({
  value,
  duration = 1,
  className
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

// Magnetic button effect
export function MagneticWrapper({
  children,
  className,
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * strength;
    const y = (e.clientY - top - height / 2) * strength;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate(0, 0)';
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)' }}
    >
      {children}
    </motion.div>
  );
}
