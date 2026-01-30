"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Signal } from "@/types";

export function useRealtimeSignals(
  userId: string,
  onNewSignal: (signal: Signal) => void
) {
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to INSERT events on signals table
    const channel = supabase
      .channel("signals-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "signals",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Call callback with new signal
          onNewSignal(payload.new as Signal);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime subscription active");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime subscription error");
        }
      });

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNewSignal]);
}
