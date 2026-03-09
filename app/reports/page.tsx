"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AIReport {
  id: string;
  period: string;
  summary: string;
  content: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    const res = await fetch("/api/reports/all");
    const data = await res.json();
    if (data.success) setReports(data.reports);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/reports/generate", { method: "POST" });
      const data = await res.json();
      if (data.success) await fetchReports();
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className="border-b px-6 py-3"
        style={{
          borderColor: "#1a2332",
          background: "linear-gradient(180deg, #0a0e14 0%, #080c12 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-bold tracking-widest uppercase"
              style={{
                color: "#00d4ff",
                fontFamily: "JetBrains Mono",
                letterSpacing: "0.15em",
              }}
            >
              SensorWatch<span style={{ color: "#e2e8f0" }}> AI</span>
            </h1>
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: "#364152" }}
            >
              Industrial Monitoring System
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="px-4 py-2 text-xs tracking-widest rounded transition-all disabled:opacity-40"
            style={{
              fontFamily: "JetBrains Mono",
              color: isGenerating ? "#364152" : "#00d4ff",
              background: isGenerating
                ? "transparent"
                : "rgba(0, 212, 255, 0.08)",
              border: "1px solid rgba(0, 212, 255, 0.25)",
            }}
          >
            {isGenerating ? "GENERATING..." : "+ GENERATE REPORT"}
          </button>
          <nav className="flex items-center gap-1">
            {[
              { href: "/", label: "DASHBOARD" },
              { href: "/anomalies", label: "ANOMALIES" },
              { href: "/reports", label: "REPORTS" },
            ].map(({ href, label }) => {
              const isActive = href === "/reports";
              return (
                <a
                  key={href}
                  href={href}
                  className="px-3 py-1.5 text-xs tracking-widest rounded transition-all"
                  style={{
                    fontFamily: "JetBrains Mono",
                    color: isActive ? "#00d4ff" : "#52627a",
                    background: isActive
                      ? "rgba(0, 212, 255, 0.08)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(0, 212, 255, 0.2)"
                      : "1px solid transparent",
                  }}
                >
                  {label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              No reports generated yet.
            </p>
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="px-4 py-2 bg-black text-white rounded text-sm"
            >
              {isGenerating ? "Generating..." : "Generate First Report"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === report.id ? null : report.id)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between gap-4 hover:bg-muted/50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {report.period}
                    </Badge>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {report.summary}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {expanded === report.id ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {expanded === report.id && (
                  <div className="px-4 pb-4 pt-2 border-t bg-muted/30">
                    <p className="text-sm whitespace-pre-wrap">
                      {report.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
