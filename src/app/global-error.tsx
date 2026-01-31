"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "12px",
                color: "#1a1a1a",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "24px",
              }}
            >
              A critical error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#ea580c",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Try again
            </button>
            {error.digest && (
              <p
                style={{
                  marginTop: "16px",
                  fontSize: "12px",
                  color: "#9ca3af",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
