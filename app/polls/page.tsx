import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function PollsPage() {
  const polls = await prisma.poll.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      question: true,
      createdAt: true,
      _count: {
        select: {
          votes: true,
          options: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">All polls</h1>
            <p className="mt-1 text-slate-600">
              Browse existing polls and open vote/results pages.
            </p>
          </div>
          <Link className="text-sm font-medium text-indigo-700 underline" href="/">
            Back to create
          </Link>
        </div>

        {polls.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-700">No polls yet. Create your first one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <article
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                key={poll.id}
              >
                <h2 className="text-lg font-semibold text-slate-900">{poll.question}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Created: {formatDate(poll.createdAt)}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {poll._count.options} options · {poll._count.votes} votes
                </p>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <Link className="font-medium text-indigo-700 underline" href={`/p/${poll.slug}`}>
                    Open voting
                  </Link>
                  <Link
                    className="font-medium text-indigo-700 underline"
                    href={`/p/${poll.slug}/results`}
                  >
                    Open results
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
