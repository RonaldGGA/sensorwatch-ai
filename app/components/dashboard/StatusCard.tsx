"use client";

interface StatusCardProps {
  sensorId: string;
  type: string;
  currentValue: number | null;
  unit: string;
  normalMin: number;
  normalMax: number;
  isAnomaly: boolean;
}

const SENSOR_ICONS: Record<string, string> = {
  temperature: "TEMP",
  pressure: "PRES",
  vibration: "VIB",
};

const SENSOR_SYMBOLS: Record<string, string> = {
  temperature: "△",
  pressure: "◈",
  vibration: "≋",
};

export function StatusCard({
  sensorId,
  type,
  currentValue,
  unit,
  normalMin,
  normalMax,
  isAnomaly,
}: StatusCardProps) {
  const pct =
    currentValue !== null
      ? Math.min(
          100,
          Math.max(
            0,
            ((currentValue - normalMin) / (normalMax - normalMin)) * 100,
          ),
        )
      : 0;

  const isHigh = currentValue !== null && currentValue > normalMax;
  const isLow = currentValue !== null && currentValue < normalMin;

  return (
    <div
      className={`relative rounded border p-4 transition-all duration-300 ${
        isAnomaly
          ? "border-red-500/60 bg-red-950/20 glow-red"
          : "border-border bg-card glow-cyan"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-lg"
            style={{ color: isAnomaly ? "#ff4444" : "#00d4ff" }}
          >
            {SENSOR_SYMBOLS[type] ?? "○"}
          </span>
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#00d4ff", fontFamily: "JetBrains Mono" }}
            >
              {SENSOR_ICONS[type] ?? type}
            </p>
            <p className="text-xs" style={{ color: "#52627a" }}>
              {sensorId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${isAnomaly ? "bg-red-500 status-blink" : "bg-emerald-400"}`}
          />
          <span
            className="text-xs font-mono tracking-wider"
            style={{
              color: isAnomaly ? "#ff4444" : "#00e5a0",
              fontFamily: "JetBrains Mono",
            }}
          >
            {isAnomaly ? "ALERT" : "NOMINAL"}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{
            fontFamily: "JetBrains Mono",
            color: isAnomaly ? "#ff4444" : "#e2e8f0",
            letterSpacing: "-0.02em",
          }}
        >
          {currentValue !== null ? currentValue.toFixed(2) : "—"}
        </span>
        <span
          className="text-sm ml-1.5"
          style={{ color: "#52627a", fontFamily: "JetBrains Mono" }}
        >
          {unit}
        </span>
      </div>

      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: isAnomaly
                ? "linear-gradient(90deg, #ff4444, #ff6666)"
                : "linear-gradient(90deg, #00b4d8, #00d4ff)",
            }}
          />
        </div>
        <div className="flex justify-between">
          <span
            className="text-xs"
            style={{ color: "#52627a", fontFamily: "JetBrains Mono" }}
          >
            {normalMin} {unit}
          </span>
          <span
            className="text-xs"
            style={{
              color: isHigh || isLow ? "#ffb800" : "#52627a",
              fontFamily: "JetBrains Mono",
            }}
          >
            {isHigh ? "▲ HIGH" : isLow ? "▼ LOW" : "IN RANGE"}
          </span>
          <span
            className="text-xs"
            style={{ color: "#52627a", fontFamily: "JetBrains Mono" }}
          >
            {normalMax} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
