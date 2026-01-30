import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
  Preview,
} from "@react-email/components";

interface SignalAlertEmailProps {
  userName: string;
  companyName: string;
  signalType: string;
  signalTitle: string;
  signalSummary?: string;
  priority: string;
  dashboardUrl: string;
  settingsUrl: string;
}

// Map signal types to readable labels
const signalTypeLabels: Record<string, string> = {
  hiring: "Hiring",
  funding: "Funding",
  expansion: "Expansion",
  partnership: "Partnership",
  product_launch: "Product Launch",
  leadership_change: "Leadership Change",
};

// Map priority to colors
const priorityColors: Record<string, string> = {
  high: "#dc2626",
  medium: "#ea580c",
  low: "#16a34a",
};

export function SignalAlertEmail({
  userName,
  companyName,
  signalType,
  signalTitle,
  signalSummary,
  priority,
  dashboardUrl,
  settingsUrl,
}: SignalAlertEmailProps) {
  const signalLabel = signalTypeLabels[signalType] || signalType;
  const priorityColor = priorityColors[priority] || "#6b7280";

  return (
    <Html>
      <Head />
      <Preview>
        New {priority}-priority signal: {companyName} - {signalLabel}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Axidex</Text>
          </Section>

          {/* Priority badge */}
          <Section style={badgeSection}>
            <Text
              style={{
                ...priorityBadge,
                backgroundColor: priorityColor,
              }}
            >
              {priority.toUpperCase()} PRIORITY
            </Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={paragraph}>
              We detected a new <strong>{signalLabel.toLowerCase()}</strong>{" "}
              signal for <strong>{companyName}</strong>:
            </Text>

            {/* Signal card */}
            <Section style={signalCard}>
              <Text style={signalTitleStyle}>{signalTitle}</Text>
              {signalSummary && (
                <Text style={signalSummaryStyle}>{signalSummary}</Text>
              )}
              <Text style={signalMeta}>
                {signalLabel} &bull; {priority} priority
              </Text>
            </Section>

            <Text style={paragraph}>
              View the full details and generate a personalized outreach email
              in your dashboard.
            </Text>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                View Signal in Dashboard
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you have email notifications
              enabled for {signalLabel.toLowerCase()} signals.
            </Text>
            <Text style={footerText}>
              <Link href={settingsUrl} style={footerLink}>
                Update notification preferences
              </Link>
            </Text>
            <Text style={footerCopyright}>
              &copy; {new Date().getFullYear()} Axidex. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

const header = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const logo = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#ea580c",
  margin: "0",
};

const badgeSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const priorityBadge = {
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "4px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#ffffff",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const content = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "32px",
  border: "1px solid #e5e7eb",
};

const greeting = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 16px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#4b5563",
  margin: "0 0 16px 0",
};

const signalCard = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "20px",
  border: "1px solid #e5e7eb",
};

const signalTitleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 8px 0",
};

const signalSummaryStyle = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 12px 0",
  lineHeight: "20px",
};

const signalMeta = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  marginTop: "24px",
};

const button = {
  backgroundColor: "#ea580c",
  color: "#ffffff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
  display: "inline-block",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 8px 0",
};

const footerLink = {
  color: "#ea580c",
  textDecoration: "underline",
};

const footerCopyright = {
  fontSize: "11px",
  color: "#d1d5db",
  marginTop: "16px",
};

export default SignalAlertEmail;
