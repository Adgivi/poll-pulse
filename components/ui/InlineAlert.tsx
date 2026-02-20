import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "error" | "warning" | "success" | "info";

type InlineAlertProps = {
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

const toneClass: Record<Tone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

export function InlineAlert({ tone = "info", children, className }: InlineAlertProps) {
  return (
    <p
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
