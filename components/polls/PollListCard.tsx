import Link from "next/link";
import { PollListItem } from "@/components/polls/types";
import { formatPollDate } from "@/components/polls/formatters";

type PollListCardProps = {
  poll: PollListItem;
};

export function PollListCard({ poll }: PollListCardProps) {
  return (
    <Link
      className="app-card block p-5 transition hover:border-indigo-300 hover:shadow md:focus-visible:outline md:focus-visible:outline-2 md:focus-visible:outline-indigo-500"
      href={`/polls/${poll.slug}`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{poll.question}</h2>
          <p className="mt-1 text-sm text-slate-600">Created: {formatPollDate(poll.createdAt)}</p>
          <p className="mt-1 text-sm text-slate-600">
            {poll._count.options} options · {poll._count.votes} votes
          </p>
        </div>

        <span className="shrink-0 text-sm font-medium text-indigo-700 underline">
          Open poll
        </span>
      </div>
    </Link>
  );
}
