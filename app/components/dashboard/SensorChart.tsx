"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface Reading {
  value: number;
  isAnomaly: boolean;
  createdAt: string;
}

interface SensorChartProps {
  sensorId: string;
  type: string;
  unit: string;
  normalMin: number;
  normalMax: number;
  readings: Reading[];
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  const isAnomaly = payload[0]?.payload?.isAnomaly;
  return (
    <div
      style={{
        background: "#0d1219",
        border: `1px solid ${isAnomaly ? "#ff4444" : "#00d4ff"}`,
        borderRadius: 4,
        padding: "6px 10px",
        fontFamily: "JetBrains Mono",
        fontSize: 11,
      }}
    >
      <p style={{ color: "#52627a", marginBottom: 2 }}>{label}</p>
      <p style={{ color: isAnomaly ? "#ff4444" : "#00d4ff" }}>
        {payload[0]?.value?.toFixed(2)} {unit}
      </p>
      {isAnomaly && <p style={{ color: "#ff4444", fontSize: 10 }}>⚠ ANOMALY</p>}
    </div>
  );
};

const renderDot = (unit: string) => (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.isAnomaly) {
    return (
      <circle
        key={`dot-${payload.index}`}
        cx={cx}
        cy={cy}
        r={4}
        fill="#ff4444"
        stroke="#ff4444"
        strokeWidth={1}
        style={{ filter: "drop-shadow(0 0 4px #ff4444)" }}
      />
    );
  }
  return <circle key={`dot-${payload.index}`} cx={cx} cy={cy} r={0} />;
};

export function SensorChart({
  sensorId,
  type,
  unit,
  normalMin,
  normalMax,
  readings,
}: SensorChartProps) {
  const chartData = readings.map((r, index) => ({
    index,
    value: r.value,
    isAnomaly: r.isAnomaly,
    time: new Date(r.createdAt).toLocaleTimeString("en", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }));

  return (
    <div
      className="rounded border p-4"
      style={{ background: "#0d1219", borderColor: "#1a2332" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: "#00d4ff", fontFamily: "JetBrains Mono" }}
        >
          {type} / {sensorId}
        </p>
        <p
          className="text-xs"
          style={{ color: "#52627a", fontFamily: "JetBrains Mono" }}
        >
          {readings.length} pts
        </p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
        >
          <CartesianGrid
            strokeDasharray="1 4"
            stroke="#1a2332"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{
              fontSize: 9,
              fill: "#364152",
              fontFamily: "JetBrains Mono",
            }}
            interval={Math.floor(chartData.length / 4)}
            axisLine={{ stroke: "#1a2332" }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fontSize: 9,
              fill: "#364152",
              fontFamily: "JetBrains Mono",
            }}
            domain={[normalMin * 0.8, normalMax * 1.4]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <ReferenceLine
            y={normalMax}
            stroke="#ffb800"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={normalMin}
            stroke="#ffb800"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00d4ff"
            strokeWidth={1.5}
            dot={renderDot(unit)}
            activeDot={{ r: 4, fill: "#00d4ff", stroke: "#00d4ff" }}
            isAnimationActive={false}
            style={{ filter: "drop-shadow(0 0 3px rgba(0, 212, 255, 0.4))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
