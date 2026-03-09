"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface AnomalyEvent {
  id: string;
  sensorId: string;
  sensorType: string;
  value: number;
  threshold: number;
  severity: string;
  aiAnalysis: string;
  createdAt: string;
}

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnomalies = async () => {
      setIsLoading(true);
      const res = await fetch(
        `/api/anomalies/all?severity=${filter}&limit=100`,
      );
      const data = await res.json();
      if (data.success) setAnomalies(data.anomalies);
      setIsLoading(false);
    };
    fetchAnomalies();
  }, [filter]);

  const severityVariant = (s: string) =>
    s === "high" ? "destructive" : s === "medium" ? "secondary" : "outline";

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

          <nav className="flex items-center gap-1">
            {[
              { href: "/", label: "DASHBOARD" },
              { href: "/anomalies", label: "ANOMALIES" },
              { href: "/reports", label: "REPORTS" },
            ].map(({ href, label }) => {
              const isActive = href === "/anomalies";
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
        <div className="flex gap-2">
          {["all", "high", "medium", "low"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-sm border capitalize ${
                filter === s
                  ? "bg-black text-white border-black"
                  : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : anomalies.length === 0 ? (
          <p className="text-sm text-muted-foreground">No anomalies found.</p>
        ) : (
          <div className="space-y-2">
            {anomalies.map((anomaly) => {
              let analysis = {
                cause: "",
                recommendation: "",
                explanation: "",
              };
              try {
                analysis = JSON.parse(anomaly.aiAnalysis);
              } catch {}

              const isExpanded = expanded === anomaly.id;

              return (
                <div
                  key={anomaly.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : anomaly.id)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-4 hover:bg-muted/50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={severityVariant(anomaly.severity)}
                        className="text-xs"
                      >
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium capitalize">
                        {anomaly.sensorType}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {anomaly.sensorId}
                      </span>
                      <span className="text-sm">
                        {anomaly.value.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        threshold: {anomaly.threshold.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(anomaly.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t bg-muted/30 space-y-2">
                      {analysis.cause && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">
                            Cause
                          </p>
                          <p className="text-sm">{analysis.cause}</p>
                        </div>
                      )}
                      {analysis.explanation && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">
                            Explanation
                          </p>
                          <p className="text-sm">{analysis.explanation}</p>
                        </div>
                      )}
                      {analysis.recommendation && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground mb-0.5">
                            Recommendation
                          </p>
                          <p className="text-sm text-blue-600">
                            {analysis.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
