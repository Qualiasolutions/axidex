"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        },
        classNames: {
          success: "!bg-emerald-50 !border-emerald-200 !text-emerald-800",
          error: "!bg-red-50 !border-red-200 !text-red-800",
        },
      }}
    />
  );
}
