import Link from "next/link";
import { FormEventHandler } from "react";
import { Card } from "@/components/ui/Card";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { PollDetail, PollResults } from "@/components/polls/types";

type PollVotePanelProps = {
  poll: PollDetail;
  slug: string;
  selectedOptionId: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  error: string | null;
  resultsAfterVote: PollResults | null;
  onSelectOption: (optionId: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export function PollVotePanel({
  poll,
  slug,
  selectedOptionId,
  canSubmit,
  isSubmitting,
  error,
  resultsAfterVote,
  onSelectOption,
  onSubmit,
}: PollVotePanelProps) {
  return (
    <Card className="w-full max-w-2xl p-8">
      <h1 className="display-font text-2xl font-semibold text-slate-900">{poll.question}</h1>
      <p className="mt-2 text-sm text-slate-600">Pick one option and submit your vote.</p>

      {poll.hasVoted ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-amber-900">You already voted in this poll.</p>
          <Link className="mt-2 inline-block text-indigo-700 underline" href={`/polls/${slug}/result`}>
            See result
          </Link>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {poll.options.map((option) => (
            <label
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 hover:border-indigo-300"
              key={option.id}
            >
              <input
                checked={selectedOptionId === option.id}
                className="h-4 w-4"
                name="option"
                onChange={() => onSelectOption(option.id)}
                type="radio"
                value={option.id}
              />
              <span className="text-slate-800">{option.text}</span>
            </label>
          ))}

          {error ? <InlineAlert tone="error">{error}</InlineAlert> : null}

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
          <Link className="mt-2 inline-block text-indigo-700 underline" href={`/polls/${slug}/result`}>
            See live result
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
