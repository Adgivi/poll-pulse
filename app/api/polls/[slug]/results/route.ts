import { NextResponse } from "next/server";
import { getPollResultsBySlug } from "@/lib/results";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { slug } = await params;
  const results = await getPollResultsBySlug(slug);

  if (!results) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Poll not found." } },
      { status: 404 },
    );
  }

  return NextResponse.json(results);
}
