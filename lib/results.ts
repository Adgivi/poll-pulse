import { prisma } from "@/lib/prisma";

type PollResultOption = {
  id: string;
  text: string;
  votes: number;
  percentage: number;
};

export type PollResults = {
  pollId: string;
  slug: string;
  question: string;
  totalVotes: number;
  selectedOptionId: string | null;
  options: PollResultOption[];
};

export async function getPollResultsBySlug(
  slug: string,
  voterId?: string | null,
): Promise<PollResults | null> {
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
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  if (!poll) {
    return null;
  }

  const totalVotes = poll.options.reduce(
    (acc, option) => acc + option._count.votes,
    0,
  );

  let selectedOptionId: string | null = null;
  if (voterId) {
    const vote = await prisma.vote.findUnique({
      where: {
        pollId_voterId: {
          pollId: poll.id,
          voterId,
        },
      },
      select: {
        optionId: true,
      },
    });

    if (vote && poll.options.some((option) => option.id === vote.optionId)) {
      selectedOptionId = vote.optionId;
    }
  }

  return {
    pollId: poll.id,
    slug: poll.slug,
    question: poll.question,
    totalVotes,
    selectedOptionId,
    options: poll.options.map((option) => {
      const votes = option._count.votes;
      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      return {
        id: option.id,
        text: option.text,
        votes,
        percentage,
      };
    }),
  };
}
