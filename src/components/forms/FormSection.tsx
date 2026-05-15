import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ number, title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      <header className="flex items-start gap-4 border-b border-border px-6 py-4">
        <div className="grid size-8 shrink-0 place-items-center rounded border border-border bg-secondary text-[11px] font-bold tabular-nums text-primary">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function FormGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
}) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  }[cols];
  return <div className={cn("grid gap-x-5 gap-y-4", colsClass)}>{children}</div>;
}
