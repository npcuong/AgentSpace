"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";

interface FilePreviewProps {
  filename: string;
  content: string;
}

export default function FilePreview({ filename, content }: FilePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = content.split("\n").length;

  return (
    <div className="animate-fade-in-up">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-xl"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)" }}
          >
            {filename}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-background)",
              color: "var(--color-text-muted)",
            }}
          >
            {lineCount} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-200"
            style={{
              color: copied ? "var(--color-success)" : "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all duration-200 text-white"
            style={{ background: "var(--color-cta)" }}
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Code content */}
      <div
        className="code-preview p-4 rounded-b-xl max-h-96 overflow-y-auto"
        style={{ background: "#0D1117" }}
      >
        <div className="flex">
          {/* Line numbers */}
          <div
            className="pr-4 mr-4 text-right select-none flex-shrink-0"
            style={{
              color: "#475569", // Always muted dark
              borderRight: "1px solid #334155", // Always dark border
              minWidth: "3rem",
            }}
          >
            {content.split("\n").map((_, i) => (
              <div key={i} className="leading-6 text-xs">
                {i + 1}
              </div>
            ))}
          </div>
          {/* Content */}
          <pre className="leading-6 text-xs flex-1" style={{ color: "#F8FAFC" }}>
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}
