"use client";

import { useState } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";

interface ScanFormProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export default function ScanForm({ onScan, isLoading }: ScanFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      setError("Please enter a URL");
      return;
    }
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }
    try {
      new URL(cleanUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    onScan(cleanUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "var(--color-surface)",
          border: `2px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
        }}
      >
        <Search
          className="w-5 h-5 ml-5 flex-shrink-0"
          style={{ color: "var(--color-text-muted)" }}
        />
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          placeholder="Enter any website URL..."
          disabled={isLoading}
          className="flex-1 px-4 py-4 text-base bg-transparent border-none outline-none"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
          }}
          autoFocus
        />
        <button
          id="scan-button"
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 mr-2 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all duration-200"
          style={{
            background: isLoading ? "var(--color-border)" : "var(--color-cta)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading)
              e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Scanning...</span>
            </>
          ) : (
            <>
              <span>Scan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {error && (
        <p
          className="mt-2 text-sm ml-2"
          style={{ color: "var(--color-error)" }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
