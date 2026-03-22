// app/api/sensors/latest/route.ts
// El dashboard llama este endpoint cada 5 segundos
// Devuelve las últimas N lecturas por sensor para las gráficas
// Por qué separado del simulate: separación de responsabilidades.
// Simular datos y leerlos son dos operaciones distintas

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SENSORS } from "@/lib/sensors";

export async function GET(request: NextRequest) {
  // Por qué searchParams: el dashboard puede pedir
  // más o menos puntos según el tamaño de la gráfica
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    // Consultamos cada sensor en paralelo
    // Por qué paralelo: 3 queries independientes no necesitan
    // esperar una a la otra
    const sensorData = await Promise.all(
      SENSORS.map(async (sensor) => {
        const readings = await prisma.sensorReading.findMany({
          where: { sensorId: sensor.id },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            value: true,
            isAnomaly: true,
            createdAt: true,
          },
        });

        const sortedReadings = readings.reverse();

        return {
          sensorId: sensor.id,
          type: sensor.type,
          unit: sensor.unit,
          normalMin: sensor.normalMin,
          normalMax: sensor.normalMax,
          readings,
          currentValue:
            sortedReadings[sortedReadings.length - 1]?.value ?? null,
          currentIsAnomaly:
            sortedReadings[sortedReadings.length - 1]?.isAnomaly ?? false,
        };
      }),
    );

    return NextResponse.json({ success: true, sensors: sensorData });
  } catch (error) {
    console.error("Latest readings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch readings" },
      { status: 500 },
    );
  }
}
