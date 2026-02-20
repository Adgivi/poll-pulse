"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

type CreatePollResponse = {
  id: string;
  slug: string;
  voteUrl: string;
  resultsUrl: string;
};

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

type AppMetrics = {
  totalPolls: number;
  totalVotes: number;
  pollsLast24h: number;
  votesLast24h: number;
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPoll, setCreatedPoll] = useState<CreatePollResponse | null>(null);
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<"vote" | "results" | null>(null);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function loadMetrics() {
    try {
      const response = await fetch("/api/metrics", { cache: "no-store" });
      const payload = ((await response.json()) as AppMetrics | ApiErrorResponse) ?? null;

      if (!response.ok) {
        throw new Error((payload as ApiErrorResponse).error?.message ?? "Could not load metrics.");
      }

      setMetrics(payload as AppMetrics);
      setMetricsError(null);
    } catch (loadError) {
      setMetricsError(
        loadError instanceof Error ? loadError.message : "Could not load metrics.",
      );
    }
  }

  useEffect(() => {
    void loadMetrics();
  }, []);

  const isFormValid = useMemo(() => {
    const trimmedQuestion = question.trim();
    const cleanedOptions = options.map((option) => option.trim()).filter(Boolean);
    const uniqueOptions = new Set(cleanedOptions.map((option) => option.toLowerCase()));

    return (
      trimmedQuestion.length > 0 &&
      cleanedOptions.length >= MIN_OPTIONS &&
      cleanedOptions.length <= MAX_OPTIONS &&
      uniqueOptions.size === cleanedOptions.length
    );
  }, [options, question]);

  function updateOption(index: number, value: string) {
    setOptions((current) => current.map((item, idx) => (idx === index ? value : item)));
  }

  function addOption() {
    setOptions((current) =>
      current.length >= MAX_OPTIONS ? current : [...current, ""],
    );
  }

  function removeOption(index: number) {
    setOptions((current) => {
      if (current.length <= MIN_OPTIONS) {
        return current;
      }
      return current.filter((_, idx) => idx !== index);
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreatedPoll(null);

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          options,
        }),
      });

      const payload =
        ((await response.json()) as CreatePollResponse | ApiErrorResponse) ?? null;

      if (!response.ok) {
        const errorPayload = payload as ApiErrorResponse;
        throw new Error(errorPayload.error?.message ?? "Could not create poll.");
      }

      setCreatedPoll(payload as CreatePollResponse);
      setQuestion("");
      setOptions(["", ""]);
      setCopiedLink(null);
      void loadMetrics();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while creating the poll.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyLink(type: "vote" | "results") {
    if (!createdPoll) {
      return;
    }

    const relative = type === "vote" ? createdPoll.voteUrl : createdPoll.resultsUrl;
    const absolute = `${origin}${relative}`;

    try {
      await navigator.clipboard.writeText(absolute);
      setCopiedLink(type);
      setTimeout(() => setCopiedLink((current) => (current === type ? null : current)), 1200);
    } catch {
      setError("Could not copy link to clipboard.");
    }
  }

  return (
    <main className="app-page">
      <div className="w-full max-w-2xl">
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="app-card p-4">
            <p className="text-sm text-slate-600">Total polls</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {metrics ? metrics.totalPolls : "—"}
            </p>
          </div>
          <div className="app-card p-4">
            <p className="text-sm text-slate-600">Total votes</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {metrics ? metrics.totalVotes : "—"}
            </p>
          </div>
          <div className="app-card p-4">
            <p className="text-sm text-slate-600">Polls (24h)</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {metrics ? metrics.pollsLast24h : "—"}
            </p>
          </div>
          <div className="app-card p-4">
            <p className="text-sm text-slate-600">Votes (24h)</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {metrics ? metrics.votesLast24h : "—"}
            </p>
          </div>
        </section>

        {metricsError ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {metricsError}
          </p>
        ) : null}

        <section className="app-card p-8">
          <h1 className="display-font text-3xl font-semibold text-slate-900">
            Create a poll
          </h1>
          <p className="mt-2 text-slate-700">
            Create a poll with 2 to 5 options and share the voting link.
          </p>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="question"
              >
                Question
              </label>
              <input
                id="question"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
                maxLength={180}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="What should we build next?"
                required
                value={question}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Answer options</p>
                <button
                  className="cursor-pointer text-sm font-medium text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
                  disabled={options.length >= MAX_OPTIONS}
                  onClick={addOption}
                  type="button"
                >
                  + Add option
                </button>
              </div>

              {options.map((option, index) => (
                <div className="flex gap-2" key={`option-${index}`}>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-indigo-200 transition focus:ring-2"
                    maxLength={80}
                    onChange={(event) => updateOption(index, event.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    value={option}
                  />
                  <button
                    aria-label={`Remove option ${index + 1}`}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={options.length <= MIN_OPTIONS}
                    onClick={() => removeOption(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              className="cursor-pointer w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={!isFormValid || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create poll"}
            </button>
          </form>
        </section>

        {createdPoll ? (
          <section className="app-card mt-6 border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-semibold text-emerald-900">Poll created</h2>
            <p className="mt-1 text-sm text-emerald-800">
              Share these links with participants.
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-white px-3 py-2">
                <p className="text-slate-800">
                  Vote:{" "}
                  <Link className="font-medium text-indigo-700 underline" href={createdPoll.voteUrl}>
                    {createdPoll.voteUrl}
                  </Link>
                </p>
                <button
                  className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
                  onClick={() => copyLink("vote")}
                  type="button"
                >
                  {copiedLink === "vote" ? "Copied" : "Copy link"}
                </button>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-white px-3 py-2">
                <p className="text-slate-800">
                  Results:{" "}
                  <Link
                    className="font-medium text-indigo-700 underline"
                    href={createdPoll.resultsUrl}
                  >
                    {createdPoll.resultsUrl}
                  </Link>
                </p>
                <button
                  className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
                  onClick={() => copyLink("results")}
                  type="button"
                >
                  {copiedLink === "results" ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
