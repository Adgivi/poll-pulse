import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AppMetrics } from "@/components/polls/types";

type MetricsCardsProps = {
  metrics: AppMetrics | null;
};

export function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Link
        className="app-card p-4 transition hover:border-indigo-300 hover:shadow md:focus-visible:outline md:focus-visible:outline-2 md:focus-visible:outline-indigo-500"
        href="/polls"
      >
        <p className="text-sm text-slate-600">Total polls</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{metrics?.totalPolls ?? "—"}</p>
        <p className="mt-2 text-xs font-medium text-indigo-700">View all polls</p>
      </Link>

      <Card className="p-4">
        <p className="text-sm text-slate-600">Total votes</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{metrics?.totalVotes ?? "—"}</p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-slate-600">Polls (24h)</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{metrics?.pollsLast24h ?? "—"}</p>
      </Card>

      <Card className="p-4">
        <p className="text-sm text-slate-600">Votes (24h)</p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{metrics?.votesLast24h ?? "—"}</p>
      </Card>
    </section>
  );
}
