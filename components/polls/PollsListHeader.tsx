import Link from "next/link";

type PollsListHeaderProps = {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export function PollsListHeader({
  title = "All polls",
  description = "Browse existing polls and open vote/result pages.",
  backHref = "/",
  backLabel = "Back to create",
}: PollsListHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-slate-600">{description}</p>
      </div>
      <Link className="text-sm font-medium text-indigo-700 underline" href={backHref}>
        {backLabel}
      </Link>
    </div>
  );
}
