import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEO Platform — Agent Engine Optimization",
  description:
    "Make any website agent-ready. Generate llms.txt, agents.txt, and get your AEO score — free & open-source.",
  keywords: ["AEO", "AI agents", "llms.txt", "agents.txt", "SEO for AI", "agent optimization"],
  openGraph: {
    title: "AEO Platform — Agent Engine Optimization",
    description: "Make any website agent-ready. Free & open-source.",
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
