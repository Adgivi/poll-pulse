import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type VoteServiceErrorCode =
  | "NOT_FOUND"
  | "INVALID_REQUEST"
  | "INVALID_OPTION"
  | "ALREADY_VOTED"
  | "SERVER_ERROR";

const errorStatusByCode: Record<VoteServiceErrorCode, number> = {
  NOT_FOUND: 404,
  INVALID_REQUEST: 400,
  INVALID_OPTION: 400,
  ALREADY_VOTED: 409,
  SERVER_ERROR: 500,
};

export class VoteServiceError extends Error {
  readonly code: VoteServiceErrorCode;
  readonly status: number;

  constructor(code: VoteServiceErrorCode, message: string) {
    super(message);
    this.code = code;
    this.status = errorStatusByCode[code];
  }
}

type PollForVoting = {
  id: string;
  slug: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  hasVoted: boolean;
};

export async function getPollForVoting(
  slug: string,
  voterId: string | null,
): Promise<PollForVoting | null> {
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
    return null;
  }

  const hasVoted = voterId
    ? Boolean(
        await prisma.vote.findUnique({
          where: { pollId_voterId: { pollId: poll.id, voterId } },
          select: { id: true },
        }),
      )
    : false;

  return {
    ...poll,
    hasVoted,
  };
}

type CastVoteInput = {
  slug: string;
  optionId: string;
  voterId: string;
};

type CastVoteResult = {
  pollId: string;
};

export async function castVote({
  slug,
  optionId,
  voterId,
}: CastVoteInput): Promise<CastVoteResult> {
  if (!optionId || typeof optionId !== "string") {
    throw new VoteServiceError("INVALID_REQUEST", "optionId is required.");
  }

  if (!voterId) {
    throw new VoteServiceError("INVALID_REQUEST", "voterId is required.");
  }

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
    throw new VoteServiceError("NOT_FOUND", "Poll not found.");
  }

  const optionExists = poll.options.some((option) => option.id === optionId);
  if (!optionExists) {
    throw new VoteServiceError("INVALID_OPTION", "Option does not belong to this poll.");
  }

  try {
    await prisma.vote.create({
      data: {
        pollId: poll.id,
        optionId,
        voterId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new VoteServiceError("ALREADY_VOTED", "You already voted in this poll.");
    }

    throw new VoteServiceError("SERVER_ERROR", "Could not register vote.");
  }

  return {
    pollId: poll.id,
  };
}
