"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          "active:scale-[0.98]",
          {
            "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]": variant === "primary",
            "bg-transparent text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]": variant === "secondary",
            "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]": variant === "ghost",
            "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90": variant === "danger",
          },
          {
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-10 px-4 text-sm gap-2": size === "md",
            "h-11 px-5 text-sm gap-2": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
