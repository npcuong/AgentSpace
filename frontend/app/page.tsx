"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import ScanForm from "@/components/ScanForm";
import ScanProgress from "@/components/ScanProgress";
import ResultsPanel from "@/components/ResultsPanel";
import { startScan, getScanStatus, getScanResults } from "@/lib/api";
import type { ScanStatus, ScanResult } from "@/lib/api";
import { Zap, FileText, Shield, BarChart3, Github, ArrowRight } from "lucide-react";

export default function Home() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const clearPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => () => clearPolling(), []);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setError("");
    setScanResult(null);
    setScanStatus(null);

    try {
      const res = await startScan(url);
      const scanId = res.scan_id;

      // Poll for status
      pollRef.current = setInterval(async () => {
        try {
          const status = await getScanStatus(scanId);
          setScanStatus(status);

          if (status.status === "completed") {
            clearPolling();
            const results = await getScanResults(scanId);
            setScanResult(results);
            setIsScanning(false);
            setTimeout(() => {
              resultsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 300);
          } else if (status.status === "failed") {
            clearPolling();
            setError(status.error || "Scan failed");
            setIsScanning(false);
          }
        } catch {
          // Status not ready yet, keep polling
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan");
      setIsScanning(false);
    }
  };

  const FEATURES = [
    {
      icon: FileText,
      title: "llms.txt Generator",
      desc: "Auto-generate llms.txt files to help AI models understand your website content and structure.",
    },
    {
      icon: Shield,
      title: "agents.txt Generator",
      desc: "Declare what AI agents can do on your site — permissions, capabilities, and API discovery.",
    },
    {
      icon: BarChart3,
      title: "AEO Score (0-100)",
      desc: "Get a comprehensive agent-readiness score with actionable recommendations to improve.",
    },
    {
      icon: Zap,
      title: "Instant Analysis",
      desc: "Scan up to 20 pages, analyze structured data, semantic HTML, and meta quality in seconds.",
    },
  ];

  return (
    <div className="min-h-screen hero-gradient">
      <Header />

      {/* Hero section */}
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 animate-fade-in-up"
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-heading)",
            }}
          >
            <Zap className="w-3 h-3" />
            Free & Open Source
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up animate-delay-100"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Make any website{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--color-primary), #60A5FA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              agent-ready
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-200"
            style={{ color: "var(--color-text-muted)" }}
          >
            Generate{" "}
            <code
              className="px-1.5 py-0.5 rounded text-sm"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              llms.txt
            </code>{" "}
            and{" "}
            <code
              className="px-1.5 py-0.5 rounded text-sm"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-primary)",
                fontFamily: "var(--font-heading)",
              }}
            >
              agents.txt
            </code>{" "}
            for any website. Get your AEO score and optimization tips.
          </p>

          {/* Scan form */}
          <div className="animate-fade-in-up animate-delay-300">
            <ScanForm onScan={handleScan} isLoading={isScanning} />
          </div>

          {/* Error display */}
          {error && (
            <div
              className="mt-4 px-4 py-3 rounded-xl text-sm max-w-2xl mx-auto"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "var(--color-error)",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Progress */}
        {isScanning && scanStatus && (
          <div className="max-w-4xl mx-auto mb-16">
            <ScanProgress status={scanStatus} />
          </div>
        )}

        {/* Results */}
        {scanResult && (
          <div ref={resultsRef} className="max-w-4xl mx-auto mb-16">
            <ResultsPanel result={scanResult} />
          </div>
        )}

        {/* Features grid */}
        {!scanResult && !isScanning && (
          <div className="max-w-4xl mx-auto mt-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`rounded-2xl p-6 transition-all duration-200 cursor-pointer animate-fade-in-up`}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      animationDelay: `${i * 100 + 400}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <h3
                      className="text-base font-semibold mb-2"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Open-source CTA */}
        {!scanResult && !isScanning && (
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <div
              className="rounded-2xl p-8 animate-fade-in-up"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                animationDelay: "800ms",
              }}
            >
              <h3
                className="text-xl font-bold mb-3"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                100% Open Source
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                AgentSpace AEO Scanner is MIT-licensed. Star us on GitHub, contribute, or self-host your own instance.
              </p>
              <a
                href="https://github.com/aeo-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200"
                style={{
                  background: "var(--color-surface-hover)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                <Github className="w-4 h-4" />
                View on GitHub
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ borderTop: "1px solid var(--color-border)" }}>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          AEO Scanner by AgentSpace — Agent Engine Optimization. MIT License.
        </p>
      </footer>
    </div>
  );
}
