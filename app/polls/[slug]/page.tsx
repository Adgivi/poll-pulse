"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type PollDetail = {
  id: string;
  slug: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  hasVoted: boolean;
};

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

export default function PollVotePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

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
        const payload = ((await response.json()) as PollDetail | ApiError) ?? null;

        if (!response.ok) {
          throw new Error((payload as ApiError).error?.message ?? "Could not load poll.");
        }

        if (!mounted) {
          return;
        }
        setPoll(payload as PollDetail);
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unexpected error.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    if (slug) {
      void loadPoll();
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  const canSubmit = useMemo(
    () => Boolean(selectedOptionId) && !isSubmitting && Boolean(poll) && !poll?.hasVoted,
    [isSubmitting, poll, selectedOptionId],
  );

  async function onVote(event: FormEvent<HTMLFormElement>) {
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

      const payload = ((await response.json()) as { results?: PollResults } | ApiError) ?? null;

      if (!response.ok) {
        throw new Error((payload as ApiError).error?.message ?? "Could not submit vote.");
      }

      setResultsAfterVote((payload as { results?: PollResults }).results ?? null);
      setPoll((current) => (current ? { ...current, hasVoted: true } : current));
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="app-page">
        <div className="app-card w-full max-w-2xl p-8">
          <p className="text-slate-600">Loading poll...</p>
        </div>
      </main>
    );
  }

  if (error && !poll) {
    return (
      <main className="app-page">
        <div className="app-card w-full max-w-2xl border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-900">Could not load poll</h1>
          <p className="mt-2 text-red-700">{error}</p>
          <Link className="mt-4 inline-block text-indigo-700 underline" href="/">
            Create a new poll
          </Link>
        </div>
      </main>
    );
  }

  if (!poll) {
    return null;
  }

  return (
    <main className="app-page">
      <div className="app-card w-full max-w-2xl p-8">
        <h1 className="display-font text-2xl font-semibold text-slate-900">
          {poll.question}
        </h1>
        <p className="mt-2 text-sm text-slate-600">Pick one option and submit your vote.</p>

        {poll.hasVoted ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-amber-900">You already voted in this poll.</p>
            <Link
              className="mt-2 inline-block text-indigo-700 underline"
              href={`/polls/${slug}/result`}
            >
              See result
            </Link>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onVote}>
            {poll.options.map((option) => (
              <label
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:border-indigo-300"
                key={option.id}
              >
                <input
                  checked={selectedOptionId === option.id}
                  className="h-4 w-4"
                  name="option"
                  onChange={() => setSelectedOptionId(option.id)}
                  type="radio"
                  value={option.id}
                />
                <span className="text-slate-800">{option.text}</span>
              </label>
            ))}

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              className="cursor-pointer w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={!canSubmit}
              type="submit"
            >
              {isSubmitting ? "Submitting vote..." : "Submit vote"}
            </button>
          </form>
        )}

        {resultsAfterVote ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-medium text-emerald-900">Vote registered.</p>
            <p className="mt-1 text-sm text-emerald-800">
              Total votes: <span className="font-semibold">{resultsAfterVote.totalVotes}</span>
            </p>
            <Link
              className="mt-2 inline-block text-indigo-700 underline"
              href={`/polls/${slug}/result`}
            >
              See live result
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
