"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ApiErrorResponse, PollDetail, PollResults } from "@/components/polls/types";

type UsePollVoteResult = {
  poll: PollDetail | null;
  selectedOptionId: string;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  canSubmit: boolean;
  resultsAfterVote: PollResults | null;
  setSelectedOptionId: (optionId: string) => void;
  onVote: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function usePollVote(slug: string): UsePollVoteResult {
  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultsAfterVote, setResultsAfterVote] = useState<PollResults | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPoll() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/polls/${slug}`, { cache: "no-store" });
        const payload = ((await response.json()) as PollDetail | ApiErrorResponse) ?? null;

        if (!response.ok) {
          throw new Error((payload as ApiErrorResponse).error?.message ?? "Could not load poll.");
        }

        if (!mounted) {
          return;
        }

        setPoll(payload as PollDetail);
        setSelectedOptionId("");
        setResultsAfterVote(null);
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unexpected error.");
        setPoll(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    if (slug) {
      void loadPoll();
    } else {
      setPoll(null);
      setIsLoading(false);
      setError("Poll not found.");
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  const canSubmit = useMemo(
    () => Boolean(selectedOptionId) && !isSubmitting && Boolean(poll) && !poll?.hasVoted,
    [isSubmitting, poll, selectedOptionId],
  );

  const onVote = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit || !poll) {
        return;
      }

      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/polls/${slug}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId: selectedOptionId }),
        });

        const payload =
          ((await response.json()) as { results?: PollResults } | ApiErrorResponse) ?? null;

        if (!response.ok) {
          throw new Error((payload as ApiErrorResponse).error?.message ?? "Could not submit vote.");
        }

        setResultsAfterVote((payload as { results?: PollResults }).results ?? null);
        setPoll((current) => (current ? { ...current, hasVoted: true } : current));
      } catch (voteError) {
        setError(voteError instanceof Error ? voteError.message : "Unexpected error.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [canSubmit, poll, selectedOptionId, slug],
  );

  return {
    poll,
    selectedOptionId,
    isLoading,
    isSubmitting,
    error,
    canSubmit,
    resultsAfterVote,
    setSelectedOptionId,
    onVote,
  };
}
