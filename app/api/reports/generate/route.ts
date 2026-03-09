import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWeeklyReport } from "@/lib/stepfun-ai";

export async function POST() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [totalReadings, anomalies] = await Promise.all([
    prisma.sensorReading.count({
      where: { createdAt: { gte: oneWeekAgo } },
    }),
    prisma.anomalyEvent.findMany({
      where: { createdAt: { gte: oneWeekAgo } },
      select: { sensorType: true, severity: true, value: true, sensorId: true },
    }),
  ]);

  const anomalyBreakdown = anomalies.reduce(
    (acc, a) => {
      acc[a.sensorType] = (acc[a.sensorType] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const criticalEvents = anomalies
    .filter((a) => a.severity === "high")
    .map((a) => `${a.sensorType} (${a.sensorId}): ${a.value}`);

  const report = await generateWeeklyReport(
    totalReadings,
    anomalies.length,
    anomalyBreakdown,
    criticalEvents,
  );

  const saved = await prisma.aIReport.create({
    data: {
      period: `Week of ${oneWeekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      summary: report.summary,
      content: report.content,
    },
  });

  return NextResponse.json({ success: true, report: saved });
}
