// components/dashboard/SensorChart.tsx
// Muestra la gráfica de línea de UN sensor con sus últimas N lecturas
// Por qué Recharts: está construido sobre React, funciona bien con
// Next.js, y es el estándar para dashboards en el ecosistema React

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function SensorChart({
  sensorId,
  type,
  unit,
  normalMin,
  normalMax,
  readings,
}: SensorChartProps) {
  // Transformamos los datos para Recharts
  // Por qué formateamos la hora: el timestamp completo no cabe en el eje X
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

  // Color del punto según si es anomalía o no
  // Por qué función: Recharts permite personalizar el dot con una función
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isAnomaly) {
      return (
        <circle
          key={`dot-${payload.index}`}
          cx={cx}
          cy={cy}
          r={5}
          fill="#ef4444"
          stroke="white"
          strokeWidth={2}
        />
      );
    }
    return <circle key={`dot-${payload.index}`} cx={cx} cy={cy} r={0} />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize text-sm">
          {type} ({sensorId}) — {unit}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              // Por qué interval calculado: con 50 puntos mostrar
              // todos los labels se superpone, esto muestra ~5
              interval={Math.floor(chartData.length / 5)}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              // Damos margen para que los picos de anomalía sean visibles
              domain={[Math.min(normalMin * 0.8), Math.max(normalMax * 1.4)]}
            />
            <Tooltip
              formatter={(value) => {
                if (value === undefined || value === null) return "";
                return [`${value} ${unit}`, type];
              }}
              labelFormatter={(label) => `Time: ${label}`}
            />
            {/* Líneas de referencia para el rango normal */}
            {/* Por qué ReferenceLine: muestra visualmente cuándo */}
            {/* un valor sale del rango sin necesitar lógica extra */}
            <ReferenceLine
              y={normalMax}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: "Max", fontSize: 10 }}
            />
            <ReferenceLine
              y={normalMin}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: "Min", fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={renderDot}
              activeDot={{ r: 6 }}
              // Por qué isAnimationActive false:
              // con polling cada 5s la animación constante
              // se ve entrecortada y marea al usuario
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
