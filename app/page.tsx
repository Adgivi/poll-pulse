"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CreatedPollLinksCard } from "@/components/polls/CreatedPollLinksCard";
import { MetricsCards } from "@/components/polls/MetricsCards";
import { PollBuilderForm } from "@/components/polls/PollBuilderForm";
import { ApiErrorResponse, AppMetrics, CopiedLinkKind, CreatePollResponse } from "@/components/polls/types";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { PageShell } from "@/components/ui/PageShell";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

export default function Home() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPoll, setCreatedPoll] = useState<CreatePollResponse | null>(null);
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<CopiedLinkKind | null>(null);
  const [origin, setOrigin] = useState<string>("");

  const loadMetrics = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
    void loadMetrics();
  }, [loadMetrics]);

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

  async function copyLink(type: CopiedLinkKind) {
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
    <PageShell>
      <MetricsCards metrics={metrics} />

      {metricsError ? (
        <InlineAlert className="mb-4" tone="warning">
          {metricsError}
        </InlineAlert>
      ) : null}

      <PollBuilderForm
        error={error}
        isFormValid={isFormValid}
        isSubmitting={isSubmitting}
        maxOptions={MAX_OPTIONS}
        minOptions={MIN_OPTIONS}
        onAddOption={addOption}
        onOptionChange={updateOption}
        onQuestionChange={setQuestion}
        onRemoveOption={removeOption}
        onSubmit={onSubmit}
        options={options}
        question={question}
      />

      {createdPoll ? (
        <CreatedPollLinksCard copiedLink={copiedLink} onCopy={copyLink} poll={createdPoll} />
      ) : null}
    </PageShell>
  );
}
