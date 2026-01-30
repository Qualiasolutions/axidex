"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Signal, GeneratedEmail } from "@/types";

interface EmailGeneratorProps {
  signalId: string;
  signal: Signal;
  existingEmail?: GeneratedEmail;
}

export function EmailGenerator({ signalId, signal, existingEmail }: EmailGeneratorProps) {
  return (
    <div className="bg-[var(--bg-primary)] rounded-xl p-6 border border-[var(--border-subtle)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Generated Email
        </h3>
      </div>

      <div className="text-sm text-[var(--text-tertiary)]">
        Email generation will be implemented in Task 3
      </div>

      <Button variant="default">
        Generate Email
      </Button>
    </div>
  );
}
