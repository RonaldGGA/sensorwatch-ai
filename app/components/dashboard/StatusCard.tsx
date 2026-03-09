// components/dashboard/StatusCard.tsx
// Este componente muestra el estado actual de UN sensor
// Por qué componente separado: se reutiliza 3 veces en el dashboard
// y tiene su propia lógica de color según el estado

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatusCardProps {
  sensorId: string;
  type: string;
  currentValue: number | null;
  unit: string;
  normalMin: number;
  normalMax: number;
  isAnomaly: boolean;
}

// Determina el color y label del badge según el estado del sensor
// Por qué función separada: la lógica de estado es reutilizable
// y hace el JSX más legible
function getSensorStatus(
  value: number | null,
  isAnomaly: boolean,
): { label: string; variant: "default" | "secondary" | "destructive" } {
  if (value === null) return { label: "No data", variant: "secondary" };
  if (isAnomaly) return { label: "ANOMALY", variant: "destructive" };
  return { label: "Normal", variant: "default" };
}

// Íconos simples por tipo de sensor
// Por qué no importar lucide aquí: mantiene el componente liviano
const SENSOR_ICONS: Record<string, string> = {
  temperature: "🌡️",
  pressure: "⚡",
  vibration: "📳",
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
  const status = getSensorStatus(currentValue, isAnomaly);

  return (
    <Card className={isAnomaly ? "border-destructive" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium capitalize">
          {SENSOR_ICONS[type]} {type} — {sensorId}
        </CardTitle>
        <Badge variant={status.variant}>{status.label}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {currentValue !== null ? `${currentValue} ${unit}` : "—"}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Normal range: {normalMin}–{normalMax} {unit}
        </p>
      </CardContent>
    </Card>
  );
}
