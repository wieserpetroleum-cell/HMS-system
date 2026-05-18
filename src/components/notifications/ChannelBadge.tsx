import { MessageCircle, Smartphone, Mail } from "lucide-react";
import type { NotificationChannel } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<NotificationChannel, { label: string; Icon: typeof MessageCircle; tone: string }> = {
  whatsapp: { label: "WhatsApp", Icon: MessageCircle, tone: "bg-status-ok/10 text-status-ok border-status-ok/30" },
  sms: { label: "SMS", Icon: Smartphone, tone: "bg-primary/10 text-primary border-primary/30" },
  email: { label: "Email", Icon: Mail, tone: "bg-status-info/10 text-status-info border-status-info/30" },
};

export function ChannelBadge({ channel, className }: { channel: NotificationChannel; className?: string }) {
  const { label, Icon, tone } = map[channel];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", tone, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}