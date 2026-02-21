"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiErrorResponse, PollResults } from "@/components/polls/types";

const BASE_INTERVAL_MS = 2000;
const HIDDEN_INTERVAL_MS = 10000;

type UsePollResultsQueryResult = {
  results: PollResults | null;
  isLoading: boolean;
  error: string | null;
};

async function fetchPollResults(slug: string): Promise<PollResults> {
  const response = await fetch(`/api/polls/${slug}/results`, { cache: "no-store" });
  const payload = ((await response.json()) as PollResults | ApiErrorResponse) ?? null;

  if (!response.ok) {
    throw new Error((payload as ApiErrorResponse).error?.message ?? "Could not load results.");
  }

  return payload as PollResults;
}

export function usePollResultsQuery(slug: string): UsePollResultsQueryResult {
  const query = useQuery({
    queryKey: ["poll-results", slug],
    queryFn: () => fetchPollResults(slug),
    enabled: Boolean(slug),
    refetchInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "hidden"
        ? HIDDEN_INTERVAL_MS
        : BASE_INTERVAL_MS,
  });

  if (!slug) {
    return {
      results: null,
      isLoading: false,
      error: "Poll not found.",
    };
  }

  return {
    results: query.data ?? null,
    isLoading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
