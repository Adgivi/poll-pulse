import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPollResultsBySlug } from "@/lib/results";
import { getVoterIdFromRequest, VOTER_COOKIE_NAME } from "@/lib/voter";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const poll = await prisma.poll.findUnique({
    where: { slug },
    select: {
      id: true,
      options: {
        select: { id: true },
      },
    },
  });

  if (!poll) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Poll not found." } },
      { status: 404 },
    );
  }

  let body: { optionId?: string };
  try {
    body = (await request.json()) as { optionId?: string };
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  if (!body.optionId || typeof body.optionId !== "string") {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "optionId is required." } },
      { status: 400 },
    );
  }

  const optionExists = poll.options.some((option) => option.id === body.optionId);
  if (!optionExists) {
    return NextResponse.json(
      { error: { code: "INVALID_OPTION", message: "Option does not belong to this poll." } },
      { status: 400 },
    );
  }

  let voterId = getVoterIdFromRequest(request);
  const shouldSetCookie = !voterId;
  if (!voterId) {
    voterId = crypto.randomUUID();
  }

  try {
    await prisma.vote.create({
      data: {
        pollId: poll.id,
        optionId: body.optionId,
        voterId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: { code: "ALREADY_VOTED", message: "You already voted in this poll." } },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not register vote." } },
      { status: 500 },
    );
  }

  const results = await getPollResultsBySlug(slug);
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
