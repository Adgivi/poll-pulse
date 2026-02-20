import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPollSlug, parseCreatePollInput } from "@/lib/polls";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = parseCreatePollInput(payload);
    const slug = createPollSlug(data.question);

    const poll = await prisma.poll.create({
      data: {
        slug,
        question: data.question,
        options: {
          create: data.options.map((option, index) => ({
            text: option,
            sortOrder: index,
          })),
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    return NextResponse.json(
      {
        id: poll.id,
        slug: poll.slug,
        voteUrl: `/polls/${poll.slug}`,
        resultsUrl: `/polls/${poll.slug}/result`,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message,
        },
      },
      { status: 400 },
    );
  }
}
