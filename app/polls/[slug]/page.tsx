"use client";

import { useParams } from "next/navigation";
import { PollVotePanel } from "@/components/polls/PollVotePanel";
import { PageShell } from "@/components/ui/PageShell";
import { StateCard } from "@/components/ui/StateCard";
import { usePollVote } from "@/hooks/usePollVote";

export default function PollVotePage() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");
  const {
    poll,
    selectedOptionId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    resultsAfterVote,
    setSelectedOptionId,
    onVote,
  } = usePollVote(slug);

  if (isLoading) {
    return (
      <PageShell>
        <StateCard message="Loading poll..." />
      </PageShell>
    );
  }

  if (error && !poll) {
    return (
      <PageShell>
        <StateCard
          actionHref="/"
          actionLabel="Create a new poll"
          message={error}
          title="Could not load poll"
          tone="error"
        />
      </PageShell>
    );
  }

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

  return (
    <PageShell>
      <PollVotePanel
        canSubmit={canSubmit}
        error={error}
        isSubmitting={isSubmitting}
        onSelectOption={setSelectedOptionId}
        onSubmit={onVote}
        poll={poll}
        resultsAfterVote={resultsAfterVote}
        selectedOptionId={selectedOptionId}
        slug={slug}
      />
    </PageShell>
  );
}
