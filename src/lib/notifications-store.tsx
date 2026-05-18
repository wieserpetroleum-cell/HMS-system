import * as React from "react";
import type { MessageTemplate, NotificationEntry } from "@/lib/types";
import { mockNotifications, mockTemplates } from "@/lib/mock/notifications";

interface Ctx {
  entries: NotificationEntry[];
  templates: MessageTemplate[];
  retry: (id: string) => void;
  bulkRetryFailed: () => void;
  saveTemplate: (t: MessageTemplate) => void;
  submitForMetaApproval: (id: string) => void;
  toggleActive: (id: string) => void;
  duplicateTemplate: (id: string) => string;
  logFrom: (input: Omit<NotificationEntry, "id" | "at" | "status"> & { status?: NotificationEntry["status"] }) => void;
}

const NotificationsContext = React.createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = React.useState<NotificationEntry[]>(mockNotifications);
  const [templates, setTemplates] = React.useState<MessageTemplate[]>(mockTemplates);

  const retry = React.useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "delivered", deliveredAt: new Date().toISOString(), failureReason: undefined }
          : e,
      ),
    );
  }, []);

  const bulkRetryFailed = React.useCallback(() => {
    setEntries((prev) =>
      prev.map((e) =>
        e.status === "failed"
          ? { ...e, status: "delivered", deliveredAt: new Date().toISOString(), failureReason: undefined }
          : e,
      ),
    );
  }, []);

  const saveTemplate = React.useCallback((t: MessageTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((p) => p.id === t.id);
      const next = { ...t, updatedAt: new Date().toISOString() };
      if (idx === -1) return [next, ...prev];
      const copy = prev.slice();
      copy[idx] = next;
      return copy;
    });
  }, []);

  const submitForMetaApproval = React.useCallback((id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "pending-meta", updatedAt: new Date().toISOString() } : t)),
    );
  }, []);

  const toggleActive = React.useCallback((id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "active" ? "inactive" : "active", updatedAt: new Date().toISOString() }
          : t,
      ),
    );
  }, []);

  const duplicateTemplate = React.useCallback((id: string) => {
    const src = templates.find((t) => t.id === id);
    if (!src) return id;
    const newId = `t${Date.now()}`;
    const dup: MessageTemplate = {
      ...src,
      id: newId,
      name: `${src.name} (copy)`,
      status: "inactive",
      metaApprovalAt: undefined,
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [dup, ...prev]);
    return newId;
  }, [templates]);

  const logFrom = React.useCallback<Ctx["logFrom"]>((input) => {
    const entry: NotificationEntry = {
      id: `n${Date.now()}`,
      at: new Date().toISOString(),
      status: input.status ?? "delivered",
      deliveredAt: (input.status ?? "delivered") === "delivered" ? new Date().toISOString() : undefined,
      ...input,
    };
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({ entries, templates, retry, bulkRetryFailed, saveTemplate, submitForMetaApproval, toggleActive, duplicateTemplate, logFrom }),
    [entries, templates, retry, bulkRetryFailed, saveTemplate, submitForMetaApproval, toggleActive, duplicateTemplate, logFrom],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = React.useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}