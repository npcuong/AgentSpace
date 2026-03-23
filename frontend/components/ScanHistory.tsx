"use client";

import { useEffect, useState } from "react";
import { Clock, ExternalLink } from "lucide-react";

interface HistoryItem {
  url: string;
  score: number;
  timestamp: string;
}

interface ScanHistoryProps {
  onSelectUrl: (url: string) => void;
}

export function ScanHistory({ onSelectUrl }: ScanHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("aeo_scan_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 text-left animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
        <h3 className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
          Recent Scans
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectUrl(item.url)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border hover:shadow-sm"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <span className="truncate max-w-[150px]">{new URL(item.url).hostname}</span>
            <span
              className="px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold"
              style={{
                background:
                  item.score >= 80 ? "rgba(16, 185, 129, 0.1)" :
                  item.score >= 50 ? "rgba(245, 158, 11, 0.1)" :
                  "rgba(239, 68, 68, 0.1)",
                color:
                  item.score >= 80 ? "var(--color-success)" :
                  item.score >= 50 ? "var(--color-warning)" :
                  "var(--color-error)",
              }}
            >
              {item.score}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper to save to history
export function saveToHistory(url: string, score: number) {
  try {
    const stored = localStorage.getItem("aeo_scan_history");
    let history: HistoryItem[] = stored ? JSON.parse(stored) : [];
    
    // Remove if exists
    history = history.filter(item => item.url !== url);
    
    // Add to front
    history.unshift({
      url,
      score,
      timestamp: new Date().toISOString()
    });
    
    // Keep max 5
    if (history.length > 5) {
      history = history.slice(0, 5);
    }
    
    localStorage.setItem("aeo_scan_history", JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
}
