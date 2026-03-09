// lib/sensors.ts
// Este archivo define los sensores, sus rangos normales,
// y la lógica para generar lecturas realistas con anomalías

export type SensorType = "temperature" | "pressure" | "vibration";

export interface SensorConfig {
  id: string;
  type: SensorType;
  unit: string;
  normalMin: number;
  normalMax: number;
  anomalyMin: number;
  anomalyMax: number;
  anomalyProbability: number; // 0-1
}

// Los 3 sensores industriales que simulamos
// Los rangos están basados en valores reales de sistemas industriales
export const SENSORS: SensorConfig[] = [
  {
    id: "temp-01",
    type: "temperature",
    unit: "°C",
    normalMin: 60,
    normalMax: 80,
    anomalyMin: 95,
    anomalyMax: 110,
    anomalyProbability: 0.1,
  },
  {
    id: "pressure-01",
    type: "pressure",
    unit: "bar",
    normalMin: 2.0,
    normalMax: 4.0,
    anomalyMin: 5.5,
    anomalyMax: 7.0,
    anomalyProbability: 0.1,
  },
  {
    id: "vibration-01",
    type: "vibration",
    unit: "mm/s",
    normalMin: 0.5,
    normalMax: 2.0,
    anomalyMin: 3.5,
    anomalyMax: 5.0,
    anomalyProbability: 0.1,
  },
];

// Genera un número aleatorio entre min y max con 2 decimales
// Por qué 2 decimales: los sensores industriales reales tienen esa precisión
function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export interface SensorReading {
  sensorId: string;
  type: SensorType;
  value: number;
  unit: string;
  isAnomaly: boolean;
}

// Genera UNA lectura para UN sensor
// Por qué separado: cada sensor se procesa independientemente
export function generateReading(sensor: SensorConfig): SensorReading {
  const isAnomaly = Math.random() < sensor.anomalyProbability;

  const value = isAnomaly
    ? randomBetween(sensor.anomalyMin, sensor.anomalyMax)
    : randomBetween(sensor.normalMin, sensor.normalMax);

  return {
    sensorId: sensor.id,
    type: sensor.type,
    value,
    unit: sensor.unit,
    isAnomaly,
  };
}

// Genera lecturas para TODOS los sensores de una vez
// Esto es lo que llama el endpoint de simulación cada 5 segundos
export function generateAllReadings(): SensorReading[] {
  return SENSORS.map((sensor) => generateReading(sensor));
}

// Devuelve el threshold relevante para determinar severidad
// Lo usa Gemini para contextualizar el análisis
export function getThreshold(sensor: SensorConfig): number {
  return sensor.anomalyMin;
}
