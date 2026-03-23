"use client";

import { Globe, FileText, BarChart3, CheckCircle2 } from "lucide-react";
import type { ScanStatus } from "@/lib/api";

interface ScanProgressProps {
  status: ScanStatus | null;
}

const STAGES = [
  { key: "crawling", label: "Crawling", icon: Globe },
  { key: "analyzing", label: "Analyzing", icon: FileText },
  { key: "generating", label: "Generating", icon: FileText },
  { key: "scoring", label: "Scoring", icon: BarChart3 },
  { key: "completed", label: "Complete", icon: CheckCircle2 },
];

function getStageIndex(status: string): number {
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function ScanProgress({ status }: ScanProgressProps) {
  if (!status) return null;

  const currentIdx = getStageIndex(status.status);
  const progress = status.progress;

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      {/* Progress bar */}
      <div className="relative w-full h-2 rounded-full overflow-hidden mb-6"
        style={{ background: "var(--color-surface)" }}>
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: progress === 100
              ? "var(--color-success)"
              : "linear-gradient(90deg, var(--color-primary), var(--color-cta))",
          }}
        />
        {progress < 100 && (
          <div className="absolute top-0 left-0 w-full h-full scan-sweep" />
        )}
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between items-center gap-1">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;

          return (
            <div key={stage.key} className="flex flex-col items-center gap-2 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: isDone
                    ? "var(--color-success)"
                    : isActive
                    ? "var(--color-primary)"
                    : "var(--color-surface)",
                  boxShadow: isActive ? "0 0 20px rgba(59, 130, 246, 0.3)" : "none",
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{
                    color: isDone || isActive ? "white" : "var(--color-text-muted)",
                  }}
                />
              </div>
              <span
                className="text-xs font-medium text-center"
                style={{
                  color: isDone || isActive ? "var(--color-text)" : "var(--color-text-muted)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail text */}
      <p
        className="text-center text-sm mt-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        {status.stage_detail || `${status.status}...`}
        {status.pages_crawled > 0 && (
          <span className="ml-2" style={{ color: "var(--color-primary)" }}>
            ({status.pages_crawled} pages)
          </span>
        )}
      </p>
    </div>
  );
}
