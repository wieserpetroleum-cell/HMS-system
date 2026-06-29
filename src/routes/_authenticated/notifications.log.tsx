import * as React from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Search, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useNotifications } from "@/lib/notifications-store";
import { ChannelBadge } from "@/components/notifications/ChannelBadge";
import { NotificationStatusPill } from "@/components/notifications/StatusPill";
import type { NotificationChannel, NotificationEntry, NotificationStatus, NotificationType } from "@/lib/types";
const CHANNELS: NotificationChannel[] = ["whatsapp", "sms", "email"];
const TYPES: NotificationType[] = ["appointment", "report", "payment", "discharge", "preauth", "other"];
const STATUSES: NotificationStatus[] = ["delivered", "failed", "pending"];

function isSameDay(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function NotificationLogPage() {
  const { entries, retry, bulkRetryFailed } = useNotifications();
  const [q, setQ] = React.useState("");
  const [channels, setChannels] = React.useState<NotificationChannel[]>([]);
  const [types, setTypes] = React.useState<NotificationType[]>([]);
  const [status, setStatus] = React.useState<NotificationStatus | "all">("all");
  const [active, setActive] = React.useState<NotificationEntry | null>(null);
  const [showFailed, setShowFailed] = React.useState(false);

  const toggle = <T,>(arr: T[], v: T, setter: (a: T[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (channels.length && !channels.includes(e.channel)) return false;
      if (types.length && !types.includes(e.type)) return false;
      if (status !== "all" && e.status !== status) return false;
      if (term && !`${e.patientName} ${e.patientUid} ${e.preview}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [entries, channels, types, status, q]);

  const sentToday = entries.filter((e) => isSameDay(e.at)).length;
  const delivered = entries.filter((e) => e.status === "delivered").length;
  const failed = entries.filter((e) => e.status === "failed").length;
  const pending = entries.filter((e) => e.status === "pending").length;
  const deliveredPct = entries.length ? Math.round((delivered / entries.length) * 100) : 0;

  const failedEntries = entries.filter((e) => e.status === "failed");

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Notifications"
        title="Notification log"
        description="Every outbound WhatsApp, SMS and email message — delivered, failed, or pending."
        right={
          <div className="flex gap-2">
            <Link to="/notifications/templates">
              <Button variant="outline" size="sm">Templates</Button>
            </Link>
            <Button size="sm" variant="outline" onClick={bulkRetryFailed} disabled={!failed}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry all failed
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Sent today" value={sentToday} />
        <KpiCard label="Delivered" value={`${delivered} · ${deliveredPct}%`} tone="ok" />
        <KpiCard label="Failed" value={failed} tone={failed ? "danger" : "default"} />
        <KpiCard label="Pending" value={pending} tone="warn" />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, UID, message…" className="pl-8" />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {CHANNELS.map((c) => (
              <Button key={c} size="sm" variant={channels.includes(c) ? "default" : "outline"} className="h-7 text-xs" onClick={() => toggle(channels, c, setChannels)}>
                {c}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {TYPES.map((t) => (
              <Button key={t} size="sm" variant={types.includes(t) ? "default" : "outline"} className="h-7 text-xs" onClick={() => toggle(types, t, setTypes)}>
                {t}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(["all", ...STATUSES] as const).map((s) => (
              <Button key={s} size="sm" variant={status === s ? "default" : "outline"} className="h-7 text-xs" onClick={() => setStatus(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">When</th>
              <th className="px-3 py-2 text-left font-semibold">Patient</th>
              <th className="px-3 py-2 text-left font-semibold">Type</th>
              <th className="px-3 py-2 text-left font-semibold">Channel</th>
              <th className="px-3 py-2 text-left font-semibold">Message</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setActive(e)}>
                <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{e.patientName}</div>
                  <div className="text-[11px] text-muted-foreground">{e.patientUid}</div>
                </td>
                <td className="px-3 py-2 text-xs capitalize">{e.type}</td>
                <td className="px-3 py-2"><ChannelBadge channel={e.channel} /></td>
                <td className="px-3 py-2 max-w-md truncate text-xs text-muted-foreground">{e.preview}</td>
                <td className="px-3 py-2"><NotificationStatusPill status={e.status} /></td>
                <td className="px-3 py-2 text-right" onClick={(ev) => ev.stopPropagation()}>
                  {e.status === "failed" && (
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => retry(e.id)}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">No notifications match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {failedEntries.length > 0 && (
        <div className="rounded-lg border bg-card">
          <button className="flex w-full items-center justify-between p-4 text-left" onClick={() => setShowFailed((v) => !v)}>
            <div>
              <div className="text-sm font-semibold">Failed notifications</div>
              <div className="text-xs text-muted-foreground">{failedEntries.length} need attention</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={(ev) => { ev.stopPropagation(); bulkRetryFailed(); }}>
                Retry all
              </Button>
              <span className="text-xs text-muted-foreground">{showFailed ? "Hide" : "Show"}</span>
            </div>
          </button>
          {showFailed && (
            <ul className="divide-y border-t">
              {failedEntries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2 text-xs">
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{e.patientName}</span>{" "}
                    <span className="text-muted-foreground">— {e.failureReason ?? "Delivery failed"}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7" onClick={() => retry(e.id)}>Retry</Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Notification detail</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ChannelBadge channel={active.channel} />
                <NotificationStatusPill status={active.status} />
                <span className="text-xs capitalize text-muted-foreground">{active.type}</span>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Patient</div>
                <div className="text-sm font-medium">{active.patientName}</div>
                <div className="text-xs text-muted-foreground">{active.patientUid}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Sent at</div>
                <div className="text-sm">{new Date(active.at).toLocaleString()}</div>
                {active.deliveredAt && (
                  <div className="text-xs text-muted-foreground">Delivered: {new Date(active.deliveredAt).toLocaleString()}</div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase text-muted-foreground">Message body</div>
                <div className="rounded border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap">{active.body}</div>
              </div>
              {active.failureReason && (
                <div className="rounded border border-allergy/30 bg-allergy/10 p-3 text-xs text-allergy">
                  {active.failureReason}
                </div>
              )}
              <div className="flex gap-2">
                {active.status === "failed" && (
                  <Button size="sm" onClick={() => { retry(active.id); setActive(null); }}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
                  </Button>
                )}
                <Link to="/patients">
                  <Button size="sm" variant="outline">View patient</Button>
                </Link>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setActive(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}export default NotificationLogPage;
