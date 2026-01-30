import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Axidex - Signal Intelligence Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #fff7ed 0%, #ffffff 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#ea580c",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "20px",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span
              style={{
                fontSize: "72px",
                fontWeight: "bold",
                color: "#1a1a1a",
                letterSpacing: "-2px",
              }}
            >
              Axidex
            </span>
          </div>
          <p
            style={{
              fontSize: "32px",
              color: "#6b7280",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            Turn buying signals into revenue
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "40px",
            }}
          >
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "18px",
                color: "#1a1a1a",
              }}
            >
              AI-Powered Signals
            </div>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "18px",
                color: "#1a1a1a",
              }}
            >
              Smart Outreach
            </div>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "18px",
                color: "#1a1a1a",
              }}
            >
              Sales Intelligence
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
