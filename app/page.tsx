"use client";

import { useActionState, useState } from "react";
import { createPollAction, CreatePollActionState } from "@/app/actions/create-poll";
import { CreatedPollLinksCard } from "@/components/polls/CreatedPollLinksCard";
import { PollBuilderForm } from "@/components/polls/PollBuilderForm";
import { CopiedLinkKind } from "@/components/polls/types";
import { PageShell } from "@/components/ui/PageShell";

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;
const INITIAL_CREATE_POLL_STATE: CreatePollActionState = {
  createdPoll: null,
  errorMessage: null,
};

export default function Home() {
  const [copiedLink, setCopiedLink] = useState<{
    kind: CopiedLinkKind;
    pollId: string;
  } | null>(null);
  const [createPollState, submitCreatePollAction, isCreating] = useActionState(
    createPollAction,
    INITIAL_CREATE_POLL_STATE,
  );
  const createdPoll = isCreating ? null : createPollState.createdPoll;

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

  const visibleCopiedLink =
    createdPoll && copiedLink?.pollId === createdPoll.id ? copiedLink.kind : null;

  return (
    <PageShell>
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
