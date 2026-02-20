import { NextResponse } from "next/server";
import { getAppMetrics } from "@/lib/metrics";

export const runtime = "nodejs";

export async function GET() {
  try {
    const metrics = await getAppMetrics();
    return NextResponse.json(metrics);
  } catch {
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not load metrics." } },
      { status: 500 },
    );
  }
}
