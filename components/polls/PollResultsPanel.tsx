import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PollResults } from "@/components/polls/types";

type PollResultsPanelProps = {
  results: PollResults;
};

export function PollResultsPanel({ results }: PollResultsPanelProps) {
  const topVotes = results.options.reduce(
    (max, option) => (option.votes > max ? option.votes : max),
    0,
  );

  return (
    <Card className="w-full max-w-2xl p-8">
      <h1 className="display-font text-2xl font-semibold text-slate-900">{results.question}</h1>
      <p className="mt-2 text-sm text-slate-600">
        Live results with adaptive polling. Total votes:{" "}
        <span className="font-semibold">{results.totalVotes}</span>
      </p>

      {results.totalVotes === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          No votes yet. Share the voting link to collect responses.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {results.options.map((option) => {
            const isLeader = option.votes > 0 && option.votes === topVotes;
            return (
              <div key={option.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-slate-800">
                    {option.text}{" "}
                    {isLeader ? (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-800">
                        Leading
                      </span>
                    ) : null}
                  </span>
                  <span className="font-medium text-slate-700">
                    {option.votes} ({option.percentage}%)
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${option.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 text-sm">
        <Link className="text-indigo-700 underline" href="/">
          Back to create
        </Link>
      </div>
    </Card>
  );
}
