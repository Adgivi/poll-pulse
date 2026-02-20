import { prisma } from "@/lib/prisma";

export type AppMetrics = {
  totalPolls: number;
  totalVotes: number;
  pollsLast24h: number;
  votesLast24h: number;
};

export async function getAppMetrics(): Promise<AppMetrics> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalPolls, totalVotes, pollsLast24h, votesLast24h] = await Promise.all([
    prisma.poll.count(),
    prisma.vote.count(),
    prisma.poll.count({ where: { createdAt: { gte: since } } }),
    prisma.vote.count({ where: { createdAt: { gte: since } } }),
  ]);

  return {
    totalPolls,
    totalVotes,
    pollsLast24h,
    votesLast24h,
  };
}
