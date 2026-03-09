// app/api/sensors/simulate/route.ts
// Este endpoint hace dos cosas:
// 1. Genera lecturas para los 3 sensores
// 2. Si detecta anomalía, llama a Gemini y guarda el evento
// Por qué un solo endpoint hace ambas cosas:
// La detección de anomalía debe ocurrir inmediatamente
// cuando llega la lectura, no en un proceso separado

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAllReadings, SENSORS } from "@/lib/sensors";
import { analyzeAnomaly } from "@/lib/gemini";

export async function POST() {
  try {
    const readings = generateAllReadings();

    // Por qué createMany: insertar las 3 lecturas en una
    // sola query es más eficiente que 3 queries separadas
    await prisma.sensorReading.createMany({
      data: readings.map((r) => ({
        sensorId: r.sensorId,
        type: r.type,
        value: r.value,
        unit: r.unit,
        isAnomaly: r.isAnomaly,
      })),
    });

    // Procesamos anomalías en paralelo con Promise.all
    // Por qué paralelo: si hay 2 anomalías simultáneas,
    // no tiene sentido esperar que Gemini analice la primera
    // antes de analizar la segunda
    const anomalyPromises = readings
      .filter((r) => r.isAnomaly)
      .map(async (reading) => {
        const sensorConfig = SENSORS.find((s) => s.id === reading.sensorId)!;

        // Obtenemos las últimas 20 lecturas de este sensor
        // para darle contexto a Gemini
        const recentReadings = await prisma.sensorReading.findMany({
          where: { sensorId: reading.sensorId },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { value: true },
        });

        const analysis = await analyzeAnomaly(
          reading.type,
          reading.sensorId,
          reading.value,
          reading.unit,
          sensorConfig.normalMin,
          sensorConfig.normalMax,
          recentReadings.map((r: { value: any }) => r.value),
        );

        // Guardamos el evento con el análisis de Gemini
        await prisma.anomalyEvent.create({
          data: {
            sensorId: reading.sensorId,
            sensorType: reading.type,
            value: reading.value,
            threshold: sensorConfig.anomalyMin,
            aiAnalysis: JSON.stringify(analysis),
            severity: analysis.severity,
          },
        });

        return { reading, analysis };
      });

    const anomalies = await Promise.all(anomalyPromises);

    return NextResponse.json({
      success: true,
      readings: readings.length,
      anomaliesDetected: anomalies.length,
      anomalies: anomalies.map((a) => ({
        sensorId: a.reading.sensorId,
        value: a.reading.value,
        severity: a.analysis.severity,
      })),
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { success: false, error: "Simulation failed" },
      { status: 500 },
    );
  }
}
