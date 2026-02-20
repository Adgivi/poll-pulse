import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getPollResultsBySlug } from "@/lib/results";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

function createEtag(payload: unknown): string {
  const hash = createHash("sha1").update(JSON.stringify(payload)).digest("hex");
  return `"${hash}"`;
}

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const results = await getPollResultsBySlug(slug);

  if (!results) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Poll not found." } },
      { status: 404 },
    );
  }

  const etag = createEtag(results);
  const ifNoneMatch = request.headers.get("if-none-match");
  const baseHeaders = {
    ETag: etag,
    "Cache-Control": "private, no-cache, must-revalidate",
  };

  if (ifNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: baseHeaders,
    });
  }

  return NextResponse.json(results, {
    headers: baseHeaders,
  });
}
