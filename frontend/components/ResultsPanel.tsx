"use client";

import { useState } from "react";
import { FileText, BarChart3, Shield } from "lucide-react";
import FilePreview from "./FilePreview";
import ScoreCard from "./ScoreCard";
import type { ScanResult } from "@/lib/api";

interface ResultsPanelProps {
  result: ScanResult;
}

type TabKey = "score" | "llms" | "agents";

const TABS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: "score", label: "AEO Score", icon: BarChart3 },
  { key: "llms", label: "llms.txt", icon: FileText },
  { key: "agents", label: "agents.txt", icon: Shield },
];

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("score");

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      {/* Header info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Scan Results
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            {result.url} — {result.pages_analyzed} pages analyzed
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
                isActive ? "tab-active" : "tab-inactive"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "score" && <ScoreCard score={result.score} />}
        {activeTab === "llms" && (
          <FilePreview filename="llms.txt" content={result.llms_txt} />
        )}
        {activeTab === "agents" && (
          <FilePreview filename="agents.txt" content={result.agents_txt} />
        )}
      </div>
    </div>
  );
}
