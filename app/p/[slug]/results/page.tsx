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

export default function PollResultsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [results, setResults] = useState<PollResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadResults() {
      try {
        const response = await fetch(`/api/polls/${slug}/results`, { cache: "no-store" });
        const payload = ((await response.json()) as PollResults | ApiError) ?? null;

        if (!response.ok) {
          throw new Error((payload as ApiError).error?.message ?? "Could not load results.");
        }

        if (!mounted) {
          return;
        }
        setResults(payload as PollResults);
        setError(null);
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
      void loadResults();
      const intervalId = setInterval(() => {
        void loadResults();
      }, 2000);

      return () => {
        mounted = false;
        clearInterval(intervalId);
      };
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-600">Loading results...</p>
        </div>
      </main>
    );
  }

  if (error || !results) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm">
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
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{results.question}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Live results. Refreshes every 2 seconds. Total votes:{" "}
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
