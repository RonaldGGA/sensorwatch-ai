import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAllReadings, SENSORS } from "@/lib/sensors";
import { analyzeAnomaly } from "@/lib/stepfun-ai";

export async function POST() {
  try {
    const readings = generateAllReadings();

    await prisma.sensorReading.createMany({
      data: readings.map((r) => ({
        sensorId: r.sensorId,
        type: r.type,
        value: r.value,
        unit: r.unit,
        isAnomaly: r.isAnomaly,
      })),
    });

    // Responde INMEDIATAMENTE — no espera al LLM
    const anomalousReadings = readings.filter((r) => r.isAnomaly);

    // Fire and forget — se ejecuta en background sin await
    if (anomalousReadings.length > 0) {
      processAnomaliesInBackground(anomalousReadings).catch((err) =>
        console.error("Background analysis failed:", err),
      );
    }

    return NextResponse.json({
      success: true,
      readings: readings.length,
      anomaliesDetected: anomalousReadings.length,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { success: false, error: "Simulation failed" },
      { status: 500 },
    );
  }
}

// Esta función corre sola, en background, sin bloquear nada
async function processAnomaliesInBackground(anomalousReadings: any[]) {
  for (const reading of anomalousReadings) {
    try {
      const sensorConfig = SENSORS.find((s) => s.id === reading.sensorId)!;

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

      const severity = (analysis.severity ?? "medium").trim() as
        | "low"
        | "medium"
        | "high";
      const validSeverities = ["low", "medium", "high"];
      const safeSeverity = validSeverities.includes(severity)
        ? severity
        : "medium";

      await prisma.anomalyEvent.create({
        data: {
          sensorId: reading.sensorId,
          sensorType: reading.type,
          value: reading.value,
          threshold: sensorConfig.anomalyMin,
          aiAnalysis: JSON.stringify(analysis),
          severity: safeSeverity,
        },
      });
    } catch (err) {
      console.error(`Failed to analyze anomaly for ${reading.sensorId}:`, err);
    }
  }
}
