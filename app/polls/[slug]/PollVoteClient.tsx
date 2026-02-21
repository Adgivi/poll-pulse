"use client";

import { useActionState, useMemo, useState } from "react";
import { PollVotePanel } from "@/components/polls/PollVotePanel";
import { PollDetail } from "@/components/polls/types";
import { submitVoteAction, VoteActionState } from "@/app/polls/[slug]/actions";

type PollVoteClientProps = {
  slug: string;
  poll: PollDetail;
};

export function PollVoteClient({ slug, poll }: PollVoteClientProps) {
  const initialState: VoteActionState = { errorMessage: null };
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const voteActionWithSlug = submitVoteAction.bind(null, slug);
  const [state, action, pending] = useActionState(voteActionWithSlug, initialState);

  const canSubmit = useMemo(() => Boolean(selectedOptionId) && !pending, [pending, selectedOptionId]);

  return (
    <PollVotePanel
      action={action}
      canSubmit={canSubmit}
      errorMessage={state.errorMessage}
      onSelectOption={setSelectedOptionId}
      pending={pending}
      poll={poll}
      selectedOptionId={selectedOptionId}
    />
  );
}
