import { prisma } from "@/lib/prisma";
import { CreatePollData, createPollSlug, parseCreatePollInput } from "@/lib/polls";

export type CreatePollResult = {
  id: string;
  slug: string;
  voteUrl: string;
  resultsUrl: string;
};

export async function createPoll(data: CreatePollData): Promise<CreatePollResult> {
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

  return {
    id: poll.id,
    slug: poll.slug,
    voteUrl: `/polls/${poll.slug}`,
    resultsUrl: `/polls/${poll.slug}/result`,
  };
}

export async function createPollFromInput(input: unknown): Promise<CreatePollResult> {
  const data = parseCreatePollInput((input ?? {}) as Record<string, unknown>);
  return createPoll(data);
}
