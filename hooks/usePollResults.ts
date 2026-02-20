"use client";

import { useEffect, useState } from "react";
import { ApiErrorResponse, PollResults } from "@/components/polls/types";

const BASE_INTERVAL_MS = 2000;
const HIDDEN_INTERVAL_MS = 10000;
const MAX_BACKOFF_MS = 30000;
const JITTER_MS = 400;

type UsePollResultsReturn = {
  results: PollResults | null;
  isLoading: boolean;
  error: string | null;
};

export function usePollResults(slug: string): UsePollResultsReturn {
  const [results, setResults] = useState<PollResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let currentController: AbortController | null = null;
    let failureCount = 0;
    let etag: string | null = null;

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function scheduleNextPoll() {
      if (!active) {
        return;
      }

      const isHidden = document.visibilityState === "hidden";
      const visibilityInterval = isHidden ? HIDDEN_INTERVAL_MS : BASE_INTERVAL_MS;
      const backoffMultiplier = failureCount > 0 ? 2 ** failureCount : 1;
      const withBackoff = Math.min(
        visibilityInterval * backoffMultiplier,
        MAX_BACKOFF_MS,
      );
      const jitter = Math.floor(Math.random() * JITTER_MS);

      timer = setTimeout(() => {
        void loadResults();
      }, withBackoff + jitter);
    }

    async function loadResults() {
      try {
        currentController?.abort();
        currentController = new AbortController();

        const response = await fetch(`/api/polls/${slug}/results`, {
          cache: "no-store",
          signal: currentController.signal,
          headers: etag ? { "If-None-Match": etag } : undefined,
        });

        if (response.status === 304) {
          if (!active) {
            return;
          }
          failureCount = 0;
          setError(null);
          setIsLoading(false);
          scheduleNextPoll();
          return;
        }

        const payload = ((await response.json()) as PollResults | ApiErrorResponse) ?? null;

        if (!response.ok) {
          throw new Error((payload as ApiErrorResponse).error?.message ?? "Could not load results.");
        }

        if (!active) {
          return;
        }

        const receivedEtag = response.headers.get("etag");
        if (receivedEtag) {
          etag = receivedEtag;
        }

        failureCount = 0;
        setResults(payload as PollResults);
        setError(null);
        scheduleNextPoll();
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }

        failureCount += 1;
        setError(loadError instanceof Error ? loadError.message : "Unexpected error.");
        scheduleNextPoll();
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    if (slug) {
      const handleVisibilityChange = () => {
        if (!active) {
          return;
        }

        if (document.visibilityState === "visible") {
          clearTimer();
          void loadResults();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      void loadResults();
      return () => {
        active = false;
        clearTimer();
        currentController?.abort();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }

    setResults(null);
    setError("Poll not found.");
    setIsLoading(false);

    return () => {
      active = false;
      clearTimer();
      currentController?.abort();
    };
  }, [slug]);

  return { results, isLoading, error };
}
