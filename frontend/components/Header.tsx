"use client";

import { Activity, Github } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav
        className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3 rounded-2xl"
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--color-border)",
        }}
      >
        <a href="/" className="flex items-center gap-2 cursor-pointer group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-primary)" }}
          >
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            AgentSpace
          </span>
          <span className="hidden sm:inline-block text-xs font-semibold ml-2 px-2 py-0.5 rounded-md" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--color-primary)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            AEO Scanner
          </span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/aeo-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200"
            style={{
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.color = "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border)";
              e.currentTarget.style.color = "var(--color-text-muted)";
            }}
          >
            <Github className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">GitHub</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
