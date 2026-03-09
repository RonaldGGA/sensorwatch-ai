// app/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { StatusCard } from "@/app/components/dashboard/StatusCard";
import { SensorChart } from "@/app/components/dashboard/SensorChart";
import { Badge } from "@/components/ui/badge";

interface SensorData {
  sensorId: string;
  type: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  currentValue: number | null;
  currentIsAnomaly: boolean;
  readings: {
    value: number;
    isAnomaly: boolean;
    createdAt: string;
  }[];
}

interface AnomalyEvent {
  id: string;
  sensorId: string;
  sensorType: string;
  value: number;
  severity: string;
  aiAnalysis: string;
  createdAt: string;
}

const POLL_INTERVAL = 5000;

export default function DashboardPage() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [recentAnomalies, setRecentAnomalies] = useState<AnomalyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isSimulatingRef = useRef(false);

  const simulate = useCallback(async () => {
    if (isSimulatingRef.current) return;
    isSimulatingRef.current = true;
    try {
      await fetch("/api/sensors/simulate", { method: "POST" });
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      isSimulatingRef.current = false;
    }
  }, []); // ← ahora sí puede ser []

  const fetchLatest = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // timeout 8s

    try {
      const [sensorsRes, anomaliesRes] = await Promise.all([
        fetch("/api/sensors/latest?limit=50", { signal: controller.signal }),
        fetch("/api/anomalies/recent?limit=5", { signal: controller.signal }),
      ]);

      const sensorsData = await sensorsRes.json();
      const anomaliesData = await anomaliesRes.json();

      if (sensorsData.success) setSensors(sensorsData.sensors);
      if (anomaliesData.success) setRecentAnomalies(anomaliesData.anomalies);
      setLastUpdated(new Date());
    } catch (error) {
      if ((error as Error).name === "AbortError") return; // timeout silencioso
      console.error("Fetch error:", error);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();

    const simulateInterval = setInterval(() => {
      simulate();
    }, POLL_INTERVAL);

    const fetchInterval = setInterval(() => {
      fetchLatest();
    }, 3000);

    return () => {
      clearInterval(simulateInterval);
      clearInterval(fetchInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeAnomalies = sensors.filter((s) => s.currentIsAnomaly).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-2">⚙️</div>
          <p className="text-muted-foreground">Initializing sensors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">SensorWatch AI</h1>
            <p className="text-xs text-muted-foreground">
              Industrial Monitoring Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeAnomalies > 0 && (
              <Badge variant="destructive">
                {activeAnomalies} active anomal
                {activeAnomalies === 1 ? "y" : "ies"}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString()}`
                : "Loading..."}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <StatusCard
              key={sensor.sensorId}
              sensorId={sensor.sensorId}
              type={sensor.type}
              currentValue={sensor.currentValue}
              unit={sensor.unit}
              normalMin={sensor.normalMin}
              normalMax={sensor.normalMax}
              isAnomaly={sensor.currentIsAnomaly}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sensors.map((sensor) => (
            <SensorChart
              key={sensor.sensorId}
              sensorId={sensor.sensorId}
              type={sensor.type}
              unit={sensor.unit}
              normalMin={sensor.normalMin}
              normalMax={sensor.normalMax}
              readings={sensor.readings}
            />
          ))}
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3">Recent Anomalies</h2>
          {recentAnomalies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No anomalies detected yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentAnomalies.map((anomaly) => {
                let analysis = { cause: "", recommendation: "" };
                try {
                  analysis = JSON.parse(anomaly.aiAnalysis);
                } catch {}

                return (
                  <div
                    key={anomaly.id}
                    className="border rounded-lg p-3 flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            anomaly.severity === "high"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium capitalize">
                          {anomaly.sensorType} — {anomaly.sensorId}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {anomaly.value}
                        </span>
                      </div>
                      {analysis.cause && (
                        <p className="text-xs text-muted-foreground">
                          {analysis.cause}
                        </p>
                      )}
                      {analysis.recommendation && (
                        <p className="text-xs text-blue-600 mt-0.5">
                          → {analysis.recommendation}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(anomaly.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
