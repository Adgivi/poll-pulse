import { NextResponse } from "next/server";
import { getPollResultsBySlug } from "@/lib/results";
import { castVote, VoteServiceError } from "@/lib/vote-service";
import { getVoterIdFromRequest, VOTER_COOKIE_NAME } from "@/lib/voter";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { slug } = await params;

  let body: { optionId?: string };
  try {
    body = (await request.json()) as { optionId?: string };
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  let voterId = getVoterIdFromRequest(request);
  const shouldSetCookie = !voterId;
  if (!voterId) {
    voterId = crypto.randomUUID();
  }

  try {
    await castVote({
      slug,
      optionId: body.optionId ?? "",
      voterId,
    });
  } catch (error) {
    if (error instanceof VoteServiceError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not register vote." } },
      { status: 500 },
    );
  }

  const results = await getPollResultsBySlug(slug, voterId);
  const response = NextResponse.json({
    ok: true,
    results,
  });

  if (shouldSetCookie) {
    response.cookies.set({
      name: VOTER_COOKIE_NAME,
      value: voterId,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
