import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PollVoteClient } from "@/app/polls/[slug]/PollVoteClient";
import { PageShell } from "@/components/ui/PageShell";
import { StateCard } from "@/components/ui/StateCard";
import { getPollForVoting } from "@/lib/vote-service";
import { VOTER_COOKIE_NAME } from "@/lib/voter";

type PollVotePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PollVotePage({ params }: PollVotePageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const voterId = cookieStore.get(VOTER_COOKIE_NAME)?.value ?? null;
  const poll = await getPollForVoting(slug, voterId);

  if (!poll) {
    return (
      <PageShell>
        <StateCard
          actionHref="/polls"
          actionLabel="Back to polls"
          message="The poll does not exist."
          title="Poll not found"
          tone="error"
        />
      </PageShell>
    );
  }

  if (poll.hasVoted) {
    redirect(`/polls/${slug}/result`);
  }

  return (
    <PageShell>
      <PollVoteClient poll={poll} slug={slug} />
    </PageShell>
  );
}
