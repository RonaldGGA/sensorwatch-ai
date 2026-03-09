import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const severity = searchParams.get("severity");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const where = severity && severity !== "all" ? { severity } : {};

  const anomalies = await prisma.anomalyEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ success: true, anomalies });
}
