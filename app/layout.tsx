import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "LiveCode Logic Trainer — Interactive Technical Interview Prep",
    template: "%s | LiveCode Logic Trainer",
  },
  description:
    "Practice timed JavaScript REST API coding challenges under strict interview time constraints (30 minutes max). Features AI-driven code reviews, recruiter personas, and real-time test execution.",
  keywords: [
    "Live Coding",
    "Technical Interview Prep",
    "JavaScript REST API",
    "Express.js",
    "System Design",
    "Backend Engineer",
    "Frontend Engineer",
    "Full Stack Engineer",
    "QA Engineer",
    "Groq AI",
    "Next.js 16",
  ],
  authors: [{ name: "LiveCode Logic Trainer Team" }],
  creator: "LiveCode Logic Trainer",
  publisher: "LiveCode Logic Trainer",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "LiveCode Logic Trainer — Master Live Coding Interviews in 30 Mins",
    description:
      "Interactive live coding trainer with real-time Express.js test execution, Groq AI assessments, recruiter persona feedback, and gamified achievements.",
    siteName: "LiveCode Logic Trainer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LiveCode Logic Trainer — Master Live Coding Interviews in 30 Mins",
    description:
      "Practice live coding challenges under strict 30-minute timers with instant local test execution and AI code evaluations.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 selection:bg-violet-100 selection:text-zinc-900" suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
