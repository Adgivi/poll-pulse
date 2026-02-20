import Link from "next/link";
import { Card } from "@/components/ui/Card";

type Tone = "neutral" | "error";

type StateCardProps = {
  title?: string;
  message: string;
  tone?: Tone;
  actionHref?: string;
  actionLabel?: string;
};

export function StateCard({
  title,
  message,
  tone = "neutral",
  actionHref,
  actionLabel,
}: StateCardProps) {
  const toneClass =
    tone === "error" ? "border-red-200 bg-red-50" : "border-slate-200 bg-white";
  const titleClass = tone === "error" ? "text-red-900" : "text-slate-900";
  const messageClass = tone === "error" ? "text-red-700" : "text-slate-600";

  return (
    <Card className={`w-full max-w-2xl p-8 ${toneClass}`}>
      {title ? <h1 className={`text-xl font-semibold ${titleClass}`}>{title}</h1> : null}
      <p className={title ? `mt-2 ${messageClass}` : `text-slate-600`}>{message}</p>
      {actionHref && actionLabel ? (
        <Link className="mt-4 inline-block text-indigo-700 underline" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </Card>
  );
}
