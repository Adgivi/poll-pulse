"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

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

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPoll, setCreatedPoll] = useState<CreatePollResponse | null>(null);

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

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-2xl px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Poll Pulse</h1>
          <p className="mt-2 text-slate-600">
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
                  className="text-sm font-medium text-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400"
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
                    className="rounded-lg border border-slate-300 px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
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
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              disabled={!isFormValid || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create poll"}
            </button>
          </form>
        </section>

        {createdPoll ? (
          <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-semibold text-emerald-900">Poll created</h2>
            <p className="mt-1 text-sm text-emerald-800">
              Share these links with participants.
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p className="text-slate-800">
                Vote:{" "}
                <Link className="font-medium text-indigo-700 underline" href={createdPoll.voteUrl}>
                  {createdPoll.voteUrl}
                </Link>
              </p>
              <p className="text-slate-800">
                Results:{" "}
                <Link
                  className="font-medium text-indigo-700 underline"
                  href={createdPoll.resultsUrl}
                >
                  {createdPoll.resultsUrl}
                </Link>
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
