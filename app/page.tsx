"use client";

import { useActionState, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createPollAction, CreatePollActionState } from "@/app/actions/create-poll";
import { CreatedPollLinksCard } from "@/components/polls/CreatedPollLinksCard";
import { MetricsCards } from "@/components/polls/MetricsCards";
import { PollBuilderForm } from "@/components/polls/PollBuilderForm";
import { ApiErrorResponse, AppMetrics, CopiedLinkKind } from "@/components/polls/types";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { PageShell } from "@/components/ui/PageShell";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;
const METRICS_QUERY_KEY = ["app-metrics"] as const;
const INITIAL_CREATE_POLL_STATE: CreatePollActionState = {
  createdPoll: null,
  errorMessage: null,
};

async function fetchAppMetrics(): Promise<AppMetrics> {
  const response = await fetch("/api/metrics", { cache: "no-store" });
  const payload = ((await response.json()) as AppMetrics | ApiErrorResponse) ?? null;

  if (!response.ok) {
    throw new Error((payload as ApiErrorResponse).error?.message ?? "Could not load metrics.");
  }

  return payload as AppMetrics;
}

export default function Home() {
  const [copiedLink, setCopiedLink] = useState<{
    kind: CopiedLinkKind;
    pollId: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const [createPollState, submitCreatePollAction, isCreating] = useActionState(
    createPollAction,
    INITIAL_CREATE_POLL_STATE,
  );
  const metricsQuery = useQuery({
    queryKey: METRICS_QUERY_KEY,
    queryFn: fetchAppMetrics,
  });
  const createdPoll = isCreating ? null : createPollState.createdPoll;

  useEffect(() => {
    if (!createPollState.createdPoll?.id) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: METRICS_QUERY_KEY });
  }, [createPollState.createdPoll?.id, queryClient]);

  async function copyLink(type: CopiedLinkKind) {
    if (!createdPoll) {
      return;
    }

    const relative = type === "vote" ? createdPoll.voteUrl : createdPoll.resultsUrl;
    const absolute = `${window.location.origin}${relative}`;

    try {
      await navigator.clipboard.writeText(absolute);
      setCopiedLink({ kind: type, pollId: createdPoll.id });
      setTimeout(
        () =>
          setCopiedLink((current) =>
            current?.kind === type && current.pollId === createdPoll.id ? null : current,
          ),
        1200,
      );
    } catch {}
  }

  const metricsError = metricsQuery.error instanceof Error ? metricsQuery.error.message : null;
  const visibleCopiedLink =
    createdPoll && copiedLink?.pollId === createdPoll.id ? copiedLink.kind : null;

  return (
    <PageShell>
      <MetricsCards metrics={metricsQuery.data ?? null} />

      {metricsError ? (
        <InlineAlert className="mb-4" tone="warning">
          {metricsError}
        </InlineAlert>
      ) : null}

      <PollBuilderForm
        key={createdPoll?.id ?? "new-poll-form"}
        action={submitCreatePollAction}
        errorMessage={createPollState.errorMessage}
        maxOptions={MAX_OPTIONS}
        minOptions={MIN_OPTIONS}
        pending={isCreating}
      />

      {createdPoll ? (
        <CreatedPollLinksCard copiedLink={visibleCopiedLink} onCopy={copyLink} poll={createdPoll} />
      ) : null}
    </PageShell>
  );
}
