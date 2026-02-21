import { PollsList } from "@/components/polls/PollsList";
import { PollsListHeader } from "@/components/polls/PollsListHeader";
import { PollListItem } from "@/components/polls/types";
import { PageShell } from "@/components/ui/PageShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PollsPage() {
  const polls: PollListItem[] = await prisma.poll.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      question: true,
      createdAt: true,
      _count: {
        select: {
          votes: true,
          options: true,
        },
      },
    },
  });

  return (
    <PageShell>
      <PollsListHeader />
      <PollsList polls={polls} />
    </PageShell>
  );
}
