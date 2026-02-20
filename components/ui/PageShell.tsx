import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Width = "sm" | "md" | "lg";

const widthClass: Record<Width, string> = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-3xl",
};

type PageShellProps = {
  children: ReactNode;
  width?: Width;
  className?: string;
};

export function PageShell({ children, width = "md", className }: PageShellProps) {
  return (
    <main className={cn("app-page", className)}>
      <div className={cn("w-full", widthClass[width])}>{children}</div>
    </main>
  );
}
