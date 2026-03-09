import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SensorWatch AI — Industrial Monitoring System",
  description:
    "Real-time industrial sensor monitoring dashboard with AI-powered anomaly detection. Built with Next.js, PostgreSQL, and LLM integration.",
  keywords: [
    "industrial monitoring",
    "sensor dashboard",
    "anomaly detection",
    "AI",
    "Next.js",
  ],
  authors: [{ name: "Ronald González", url: "https://github.com/RonaldGGA" }],
  openGraph: {
    title: "SensorWatch AI",
    description:
      "Real-time industrial sensor monitoring with AI-powered anomaly detection.",
    url: "https://sensorwatch-ai.vercel.app",
    siteName: "SensorWatch AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
