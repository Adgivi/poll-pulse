"use client";

import { useParams } from "next/navigation";
import { PollResultsPanel } from "@/components/polls/PollResultsPanel";
import { PageShell } from "@/components/ui/PageShell";
import { StateCard } from "@/components/ui/StateCard";
import { usePollResults } from "@/hooks/usePollResults";

export default function PollResultsPage() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");
  const { results, isLoading, error } = usePollResults(slug);

  if (isLoading) {
    return (
      <PageShell>
        <StateCard message="Loading results..." />
      </PageShell>
    );
  }

  if (error || !results) {
    return (
      <PageShell>
        <StateCard
          actionHref="/"
          actionLabel="Create a new poll"
          message={error ?? "Poll not found."}
          title="Could not load results"
          tone="error"
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PollResultsPanel results={results} />
    </PageShell>
  );
}
