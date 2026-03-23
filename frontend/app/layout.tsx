import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "AEO Scanner by AgentSpace",
  description:
    "Make any website agent-ready. Generate llms.txt, agents.txt, and get your AEO score — free & open-source.",
  keywords: ["AEO", "AI agents", "llms.txt", "agents.txt", "SEO for AI", "agent optimization"],
  openGraph: {
    title: "AEO Scanner by AgentSpace",
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
