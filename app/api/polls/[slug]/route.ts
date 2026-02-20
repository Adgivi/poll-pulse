import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVoterIdFromRequest } from "@/lib/voter";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: RouteProps) {
  const { slug } = await params;
  const voterId = getVoterIdFromRequest(request);

  const poll = await prisma.poll.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      question: true,
      options: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          text: true,
        },
      },
    },
  });

  if (!poll) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Poll not found." } },
      { status: 404 },
    );
  }

  const hasVoted = voterId
    ? Boolean(
        await prisma.vote.findUnique({
          where: { pollId_voterId: { pollId: poll.id, voterId } },
          select: { id: true },
        }),
      )
    : false;

  return NextResponse.json({
    id: poll.id,
    slug: poll.slug,
    question: poll.question,
    options: poll.options,
    hasVoted,
  });
}
