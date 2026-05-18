import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Plus, Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { TemplateStatusPill } from "@/components/notifications/StatusPill";
import { ChannelBadge } from "@/components/notifications/ChannelBadge";
import { VariablePicker } from "@/components/notifications/VariablePicker";
import { useNotifications } from "@/lib/notifications-store";
import type { MessageTemplate, NotificationChannel, TemplateTrigger } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/notifications/templates")({
  component: TemplateManagerPage,
});

const TRIGGER_LABELS: Record<TemplateTrigger, string> = {
  appointment_booked: "Appointment booked",
  appointment_reminder: "Appointment reminder",
  consult_complete: "Consultation complete",
  report_ready: "Radiology report ready",
  ipd_admission: "IPD admission",
  ipd_bill_alert: "IPD running bill alert",
  discharge: "Discharge",
  payment_due: "Payment due",
  payment_received: "Payment received",
  preauth_update: "Pre-auth status update",
};

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Bengali"];

const SAMPLES: Record<string, string> = {
  patient_name: "Arjun Singh",
  appointment_date: "20 May 2026",
  appointment_time: "10:30 AM",
  doctor_name: "Dr. Aarav Mehta",
  token_number: "A-14",
  amount: "4,200",
  payment_link: "https://pay.example/abc",
  hospital_name: "Medicore Hospital",
};

function render(body: string) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, k) => SAMPLES[k] ?? `{{${k}}}`);
}

function emptyTemplate(): MessageTemplate {
  return {
    id: `t${Date.now()}`,
    name: "",
    trigger: "appointment_booked",
    channels: ["whatsapp"],
    language: "English",
    body: "",
    variables: [],
    status: "inactive",
    updatedAt: new Date().toISOString(),
  };
}

function TemplateManagerPage() {
  const { templates, saveTemplate, submitForMetaApproval, toggleActive, duplicateTemplate } = useNotifications();
  const [editing, setEditing] = React.useState<MessageTemplate | null>(null);

  const insertVar = (token: string) => {
    if (!editing) return;
    setEditing({ ...editing, body: editing.body + token });
  };

  const onSave = () => {
    if (!editing) return;
    saveTemplate(editing);
    setEditing(null);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Module 9 · Notifications"
        title="Template manager"
        description="Govern WhatsApp, SMS and email templates triggered by clinical events."
        right={
          <div className="flex gap-2">
            <Link to="/notifications/log"><Button size="sm" variant="outline">Log</Button></Link>
            <Button size="sm" onClick={() => setEditing(emptyTemplate())}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New template
            </Button>
          </div>
        }
      />

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Name</th>
              <th className="px-3 py-2 text-left font-semibold">Trigger</th>
              <th className="px-3 py-2 text-left font-semibold">Channels</th>
              <th className="px-3 py-2 text-left font-semibold">Language</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-left font-semibold">Updated</th>
              <th className="px-3 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{t.name}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{TRIGGER_LABELS[t.trigger]}</td>
                <td className="px-3 py-2"><div className="flex gap-1">{t.channels.map((c) => <ChannelBadge key={c} channel={c} />)}</div></td>
                <td className="px-3 py-2 text-xs">{t.language}</td>
                <td className="px-3 py-2"><TemplateStatusPill status={t.status} /></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditing(t)}>Edit</Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => toggleActive(t.id)}>
                      {t.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => duplicateTemplate(t.id)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{editing?.name ? "Edit template" : "New template"}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="mt-4 space-y-4">
              <div>
                <Label className="text-xs">Template name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Trigger event</Label>
                  <select
                    value={editing.trigger}
                    onChange={(e) => setEditing({ ...editing, trigger: e.target.value as TemplateTrigger })}
                    className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
                  >
                    {Object.entries(TRIGGER_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Language</Label>
                  <select
                    value={editing.language}
                    onChange={(e) => setEditing({ ...editing, language: e.target.value })}
                    className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm"
                  >
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Channels</Label>
                <div className="mt-1 flex gap-3">
                  {(["whatsapp", "sms", "email"] as NotificationChannel[]).map((c) => (
                    <label key={c} className="flex items-center gap-2 text-xs">
                      <Switch
                        checked={editing.channels.includes(c)}
                        onCheckedChange={(v) =>
                          setEditing({
                            ...editing,
                            channels: v
                              ? [...editing.channels, c]
                              : editing.channels.filter((x) => x !== c),
                          })
                        }
                      />
                      <span className="capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Message body</Label>
                <Textarea rows={5} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
              </div>
              <VariablePicker
                body={editing.body}
                channel={editing.channels[0] ?? "whatsapp"}
                onInsert={insertVar}
              />
              <div>
                <Label className="text-xs">Preview (sample data)</Label>
                <div className="mt-1 rounded border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {render(editing.body) || <span className="text-muted-foreground">Preview appears here…</span>}
                </div>
              </div>
              {editing.channels.includes("whatsapp") && (
                <div className="rounded border bg-card p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Meta approval status</span>
                    <TemplateStatusPill status={editing.status} />
                  </div>
                  {editing.metaApprovalAt && (
                    <div className="mt-1 text-muted-foreground">Approved {new Date(editing.metaApprovalAt).toLocaleDateString()}</div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={onSave}>Save template</Button>
                {editing.channels.includes("whatsapp") && editing.status !== "active" && (
                  <Button size="sm" variant="outline" onClick={() => { submitForMetaApproval(editing.id); setEditing(null); }}>
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Submit for Meta approval
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}