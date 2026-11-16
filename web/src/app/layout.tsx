import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import { PostHogIdentifier } from "@/components/analytics/posthog-identifier";
import "./globals.css";

// Geometric sans closest to the REDSUN reference; used for headings and body.
const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertex",
  description:
    "Vertex is an AI-powered learning platform: ask in plain English and jump to the exact second a topic is taught.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${mulish.variable} h-full bg-neutral-50 antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#f97316",
              colorPrimaryForeground: "#ffffff",
              colorBackground: "#111216",
              colorForeground: "#f4f4f5",
              colorMuted: "#17181d",
              colorMutedForeground: "#8b8e98",
              colorInput: "#17181d",
              colorInputForeground: "#f4f4f5",
              colorBorder: "rgba(255, 255, 255, 0.1)",
              colorNeutral: "#f4f4f5",
              colorRing: "#f97316",
              colorModalBackdrop: "rgba(0, 0, 0, 0.7)",
              borderRadius: "12px",
              fontFamily: "var(--font-mulish)",
            },
          }}
        >
          <PostHogIdentifier />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
