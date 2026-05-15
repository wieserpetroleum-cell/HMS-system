import type { LucideIcon } from "lucide-react";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Quick Actions
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.onClick}
              className="group flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-primary hover:bg-accent"
            >
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span>{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}