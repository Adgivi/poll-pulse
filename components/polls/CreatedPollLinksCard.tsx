import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CopiedLinkKind, CreatePollResponse } from "@/components/polls/types";

type CreatedPollLinksCardProps = {
  poll: CreatePollResponse;
  copiedLink: CopiedLinkKind | null;
  onCopy: (kind: CopiedLinkKind) => void;
};

export function CreatedPollLinksCard({
  poll,
  copiedLink,
  onCopy,
}: CreatedPollLinksCardProps) {
  return (
    <Card className="mt-6 border-emerald-200 bg-emerald-50 p-6">
      <h2 className="text-lg font-semibold text-emerald-900">Poll created</h2>
      <p className="mt-1 text-sm text-emerald-800">Share these links with participants.</p>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-white px-3 py-2">
          <p className="text-slate-800">
            Vote:{" "}
            <Link className="font-medium text-indigo-700 underline" href={poll.voteUrl}>
              {poll.voteUrl}
            </Link>
          </p>
          <button
            className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
            onClick={() => onCopy("vote")}
            type="button"
          >
            {copiedLink === "vote" ? "Copied" : "Copy link"}
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-white px-3 py-2">
          <p className="text-slate-800">
            Result:{" "}
            <Link className="font-medium text-indigo-700 underline" href={poll.resultsUrl}>
              {poll.resultsUrl}
            </Link>
          </p>
          <button
            className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700"
            onClick={() => onCopy("results")}
            type="button"
          >
            {copiedLink === "results" ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </Card>
  );
}
