import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PollListItem } from "@/components/polls/types";
import { formatPollDate } from "@/components/polls/formatters";

type PollListCardProps = {
  poll: PollListItem;
};

export function PollListCard({ poll }: PollListCardProps) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-slate-900">{poll.question}</h2>
      <p className="mt-1 text-sm text-slate-600">Created: {formatPollDate(poll.createdAt)}</p>
      <p className="mt-1 text-sm text-slate-600">
        {poll._count.options} options · {poll._count.votes} votes
      </p>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <Link className="font-medium text-indigo-700 underline" href={`/polls/${poll.slug}`}>
          Open voting
        </Link>
        <Link
          className="font-medium text-indigo-700 underline"
          href={`/polls/${poll.slug}/result`}
        >
          Open result
        </Link>
      </div>
    </Card>
  );
}
