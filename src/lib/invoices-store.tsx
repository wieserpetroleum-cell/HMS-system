import * as React from "react";
import type { AuditEvent, Invoice, InvoiceItem, Payment, TpaClaim } from "@/lib/types";
import { mockInvoices } from "@/lib/mock/invoices";

interface Ctx {
  invoices: Invoice[];
  addInvoice: (
    input: Omit<Invoice, "id" | "invoiceNo" | "subtotal" | "taxAmount" | "total" | "paid" | "balance" | "auditLog" | "payments"> & {
      payments?: Payment[];
      auditLog?: AuditEvent[];
    },
  ) => Invoice;
  updateInvoice: (id: string, patch: Partial<Invoice>, audit?: Omit<AuditEvent, "at">) => void;
  replaceItems: (id: string, items: InvoiceItem[], audit?: Omit<AuditEvent, "at">) => void;
  addPayment: (id: string, payment: Omit<Payment, "id">) => void;
  updateTpaClaim: (id: string, claim: TpaClaim) => void;
  cancelInvoice: (id: string, reason: string, by: string) => void;
  getById: (id: string) => Invoice | undefined;
  getByPatientUid: (uid: string) => Invoice[];
}

const InvoicesContext = React.createContext<Ctx | null>(null);

function recompute(items: InvoiceItem[], discount: number, taxRate: number, payments: Payment[]) {
  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const taxable = items.filter((i) => i.taxable).reduce((s, it) => s + it.amount, 0);
  const adjTaxable = subtotal > 0 ? taxable - (discount * taxable) / subtotal : 0;
  const taxAmount = Math.max(0, Math.round(adjTaxable * taxRate));
  const total = Math.max(0, subtotal - discount + taxAmount);
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, total - paid);
  return { subtotal, taxAmount, total, paid, balance };
}

function nextInvoiceNo(seq: number) {
  return `INV-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`;
}

export function InvoicesProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = React.useState<Invoice[]>(mockInvoices);

  const addInvoice = React.useCallback<Ctx["addInvoice"]>((input) => {
    const payments = input.payments ?? [];
    const { subtotal, taxAmount, total, paid, balance } = recompute(
      input.items,
      input.discount,
      input.taxRate,
      payments,
    );
    const inv: Invoice = {
      ...input,
      id: `iv${Date.now()}`,
      invoiceNo: nextInvoiceNo(invoices.length + 1),
      subtotal,
      taxAmount,
      total,
      paid,
      balance,
      payments,
      auditLog: input.auditLog ?? [
        { at: new Date().toISOString(), by: "Reception", action: "Invoice created" },
      ],
    };
    setInvoices((prev) => [inv, ...prev]);
    return inv;
  }, [invoices.length]);

  const updateInvoice = React.useCallback<Ctx["updateInvoice"]>((id, patch, audit) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const next: Invoice = { ...i, ...patch };
        const { subtotal, taxAmount, total, paid, balance } = recompute(
          next.items, next.discount, next.taxRate, next.payments,
        );
        next.subtotal = subtotal; next.taxAmount = taxAmount; next.total = total; next.paid = paid; next.balance = balance;
        if (audit) next.auditLog = [{ at: new Date().toISOString(), ...audit }, ...i.auditLog];
        return next;
      }),
    );
  }, []);

  const replaceItems = React.useCallback<Ctx["replaceItems"]>((id, items, audit) => {
    updateInvoice(id, { items }, audit ?? { by: "Reception", action: "Charges updated" });
  }, [updateInvoice]);

  const addPayment = React.useCallback<Ctx["addPayment"]>((id, payment) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const pay: Payment = { ...payment, id: `pay${Date.now()}` };
        const payments = [...i.payments, pay];
        const { subtotal, taxAmount, total, paid, balance } = recompute(i.items, i.discount, i.taxRate, payments);
        const status: Invoice["status"] = balance <= 0 ? "paid" : paid > 0 ? "partial" : i.status;
        return {
          ...i,
          payments,
          subtotal, taxAmount, total, paid, balance,
          status,
          auditLog: [
            { at: pay.at, by: pay.collectedBy, action: "Payment received", detail: `${pay.mode.toUpperCase()} · ₹${pay.amount}` },
            ...i.auditLog,
          ],
        };
      }),
    );
  }, []);

  const updateTpaClaim = React.useCallback<Ctx["updateTpaClaim"]>((id, claim) => {
    setInvoices((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const wasStatus = i.tpaClaim?.status;
        const status: Invoice["status"] =
          claim.status === "settled" ? i.status :
          claim.status === "rejected" ? i.status :
          ["pre-auth", "submitted", "query", "approved"].includes(claim.status) ? "tpa-pending" :
          i.status;
        return {
          ...i,
          tpaClaim: { ...claim, lastUpdateAt: new Date().toISOString() },
          status,
          auditLog: [
            { at: new Date().toISOString(), by: "Billing", action: "TPA updated", detail: `${wasStatus ?? "—"} → ${claim.status}` },
            ...i.auditLog,
          ],
        };
      }),
    );
  }, []);

  const cancelInvoice = React.useCallback<Ctx["cancelInvoice"]>((id, reason, by) => {
    setInvoices((prev) =>
      prev.map((i) => i.id === id ? {
        ...i,
        status: "cancelled",
        auditLog: [{ at: new Date().toISOString(), by, action: "Invoice cancelled", detail: reason }, ...i.auditLog],
      } : i),
    );
  }, []);

  const getById = React.useCallback((id: string) => invoices.find((i) => i.id === id), [invoices]);
  const getByPatientUid = React.useCallback((uid: string) => invoices.filter((i) => i.patientUid === uid), [invoices]);

  const value = React.useMemo<Ctx>(
    () => ({ invoices, addInvoice, updateInvoice, replaceItems, addPayment, updateTpaClaim, cancelInvoice, getById, getByPatientUid }),
    [invoices, addInvoice, updateInvoice, replaceItems, addPayment, updateTpaClaim, cancelInvoice, getById, getByPatientUid],
  );

  return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
}

export function useInvoices() {
  const ctx = React.useContext(InvoicesContext);
  if (!ctx) throw new Error("useInvoices must be used within InvoicesProvider");
  return ctx;
}
