// app/api/anomalies/recent/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "5");

  try {
    const anomalies = await prisma.anomalyEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, anomalies });
  } catch (error) {
    console.error("Recent anomalies error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch anomalies" },
      { status: 500 },
    );
  }
}
