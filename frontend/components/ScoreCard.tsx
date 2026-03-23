"use client";

import type { AEOScore } from "@/lib/api";

interface ScoreCardProps {
  score: AEOScore;
}

function getGradeColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "#10B981";
  if (grade === "B") return "#3B82F6";
  if (grade === "C") return "#F59E0B";
  return "#EF4444";
}

function CategoryBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? "var(--color-success)" : value >= 40 ? "var(--color-warning)" : "var(--color-error)";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color }}>
          {value}
        </span>
      </div>
      <div className="w-full h-2 rounded-full" style={{ background: "var(--color-background)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ScoreCard({ score }: ScoreCardProps) {
  const gradeColor = getGradeColor(score.grade);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score.total / 100) * circumference;

  return (
    <div className="animate-fade-in-up">
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Score circle */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="var(--color-background)"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={gradeColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="score-circle"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-3xl font-bold"
                style={{ fontFamily: "var(--font-heading)", color: gradeColor }}
              >
                {score.total}
              </span>
              <span
                className="text-lg font-semibold"
                style={{ color: gradeColor }}
              >
                {score.grade}
              </span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 w-full space-y-4">
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-heading)" }}
            >
              Score Breakdown
            </h3>
            <CategoryBar label="Structured Data" value={score.breakdown.structured_data} />
            <CategoryBar label="Semantic HTML" value={score.breakdown.semantic_html} />
            <CategoryBar label="Meta Quality" value={score.breakdown.meta_quality} />
            <CategoryBar label="Agent Readiness" value={score.breakdown.agent_readiness} />
          </div>
        </div>

        {/* Recommendations */}
        {score.recommendations.length > 0 && (
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
            <h4
              className="text-sm font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-heading)" }}
            >
              Recommendations
            </h4>
            <ul className="space-y-2">
              {score.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--color-warning)" }}
                  />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
