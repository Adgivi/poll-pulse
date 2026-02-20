type PollVotePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PollVotePage({ params }: PollVotePageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Voting page</h1>
        <p className="mt-2 text-slate-600">
          Poll slug: <span className="font-mono text-slate-900">{slug}</span>
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Voting UI will be implemented in the next iteration.
        </p>
      </div>
    </main>
  );
}
