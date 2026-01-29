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
          "inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#00a4ac] hover:bg-[#00c4cc] text-white focus:ring-[#00a4ac]": variant === "primary",
            "bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155] focus:ring-[#334155]": variant === "secondary",
            "bg-transparent hover:bg-[#1e293b] text-[#94a3b8] hover:text-white": variant === "ghost",
            "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600": variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
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
