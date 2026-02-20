"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type PollResults = {
  pollId: string;
  slug: string;
  question: string;
  totalVotes: number;
  options: Array<{ id: string; text: string; votes: number; percentage: number }>;
};

type ApiError = {
  error?: { message?: string };
};

const BASE_INTERVAL_MS = 2000;
const HIDDEN_INTERVAL_MS = 10000;
const MAX_BACKOFF_MS = 30000;
const JITTER_MS = 400;

export default function PollResultsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

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

        const payload = ((await response.json()) as PollResults | ApiError) ?? null;

        if (!response.ok) {
          throw new Error((payload as ApiError).error?.message ?? "Could not load results.");
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

    return () => {
      active = false;
      clearTimer();
      currentController?.abort();
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="app-page">
        <div className="app-card w-full max-w-2xl p-8">
          <p className="text-slate-600">Loading results...</p>
        </div>
      </main>
    );
  }

  if (error || !results) {
    return (
      <main className="app-page">
        <div className="app-card w-full max-w-2xl border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-900">Could not load results</h1>
          <p className="mt-2 text-red-700">{error ?? "Poll not found."}</p>
          <Link className="mt-4 inline-block text-indigo-700 underline" href="/">
            Create a new poll
          </Link>
        </div>
      </main>
    );
  }

  const topVotes = results.options.reduce(
    (max, option) => (option.votes > max ? option.votes : max),
    0,
  );

  return (
    <main className="app-page">
      <div className="app-card w-full max-w-2xl p-8">
        <h1 className="display-font text-2xl font-semibold text-slate-900">
          {results.question}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Live results with adaptive polling. Total votes:{" "}
          <span className="font-semibold">{results.totalVotes}</span>
        </p>

        {results.totalVotes === 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            No votes yet. Share the voting link to collect responses.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {results.options.map((option) => {
              const isLeader = option.votes > 0 && option.votes === topVotes;
              return (
                <div key={option.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-800">
                      {option.text}{" "}
                      {isLeader ? (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800">
                          Leading
                        </span>
                      ) : null}
                    </span>
                    <span className="font-medium text-slate-700">
                      {option.votes} ({option.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-200">
                    <div
                      className="h-3 rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-sm">
          <Link className="text-indigo-700 underline" href={`/p/${slug}`}>
            Back to voting
          </Link>
        </div>
      </div>
    </main>
  );
}
