import { Card } from "@/components/ui/Card";
import { PollListItem } from "@/components/polls/types";
import { PollListCard } from "@/components/polls/PollListCard";

type PollsListProps = {
  polls: PollListItem[];
};

export function PollsList({ polls }: PollsListProps) {
  if (polls.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-slate-700">No polls yet. Create your first one.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <PollListCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}
