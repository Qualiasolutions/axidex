"use client";

import { useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Signal } from "@/types";

export function useRealtimeSignals(
  userId: string,
  onNewSignal: (signal: Signal) => void
) {
  // Use ref to avoid subscription churn when callback changes
  const callbackRef = useRef(onNewSignal);
  callbackRef.current = onNewSignal;

  // Memoize supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {

    if (!userId) return;

    // Subscribe to INSERT events on signals table
    const channel = supabase
      .channel(`signals-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signals",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Call callback via ref to avoid stale closures
          callbackRef.current(payload.new as Signal);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);
}
