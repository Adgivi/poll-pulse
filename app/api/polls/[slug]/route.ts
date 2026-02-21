import { NextResponse } from "next/server";
import { getPollForVoting } from "@/lib/vote-service";
import { getVoterIdFromRequest } from "@/lib/voter";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const voterId = getVoterIdFromRequest(request);

  const poll = await getPollForVoting(slug, voterId);

  if (!poll) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Poll not found." } },
      { status: 404 },
    );
  }

  return NextResponse.json(poll);
}
