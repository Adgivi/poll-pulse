"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PollVotePanel } from "@/components/polls/PollVotePanel";
import { PageShell } from "@/components/ui/PageShell";
import { StateCard } from "@/components/ui/StateCard";
import { usePollVote } from "@/hooks/usePollVote";

export default function PollVotePage() {
  const params = useParams<{ slug: string | string[] }>();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");
  const {
    poll,
    selectedOptionId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    setSelectedOptionId,
    onVote,
  } = usePollVote(slug);

  useEffect(() => {
    if (!poll?.hasVoted || !slug) {
      return;
    }

    router.replace(`/polls/${slug}/result`);
  }, [poll?.hasVoted, router, slug]);

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

  if (poll.hasVoted) {
    return (
      <PageShell>
        <StateCard message="Redirecting to results..." />
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
        selectedOptionId={selectedOptionId}
      />
    </PageShell>
  );
}
