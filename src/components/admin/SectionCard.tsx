import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  right,
  className,
  children,
}: {
  title?: string;
  description?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      {(title || right) && (
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div>
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}