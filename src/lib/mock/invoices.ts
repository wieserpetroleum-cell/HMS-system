import type { Invoice, InvoiceItem } from "@/lib/types";

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

function compute(items: InvoiceItem[], discount = 0, taxRate = 0.05) {
  const subtotal = items.reduce((s, it) => s + it.amount, 0);
  const taxable = items.filter((i) => i.taxable).reduce((s, it) => s + it.amount, 0);
  const taxAmount = Math.round((taxable - (discount * taxable) / Math.max(subtotal, 1)) * taxRate);
  const total = subtotal - discount + taxAmount;
  return { subtotal, taxAmount, total };
}

function mk(
  id: string,
  patientUid: string,
  patientName: string,
  sourceType: Invoice["sourceType"],
  itemsRaw: Omit<InvoiceItem, "id" | "amount">[],
  opts: Partial<Pick<Invoice, "status" | "createdAt" | "discount" | "tpaClaim" | "payments" | "sourceId">> = {},
): Invoice {
  const items: InvoiceItem[] = itemsRaw.map((it, i) => ({
    ...it,
    id: `${id}-it${i + 1}`,
    amount: it.qty * it.unitPrice,
  }));
  const discount = opts.discount ?? 0;
  const { subtotal, taxAmount, total } = compute(items, discount);
  const payments = opts.payments ?? [];
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = total - paid;
  const createdAt = opts.createdAt ?? daysAgo(0);
  const status =
    opts.status ??
    (balance <= 0
      ? "paid"
      : opts.tpaClaim
        ? "tpa-pending"
        : paid > 0
          ? "partial"
          : Math.floor((now - new Date(createdAt).getTime()) / 86400000) > 30
            ? "overdue"
            : "pending");
  return {
    id,
    invoiceNo: `INV-2026-${id.slice(2).padStart(5, "0")}`,
    patientUid,
    patientName,
    sourceType,
    sourceId: opts.sourceId,
    items,
    subtotal,
    discount,
    taxRate: 0.05,
    taxAmount,
    total,
    paid,
    balance,
    status,
    createdAt,
    dueAt: new Date(new Date(createdAt).getTime() + 30 * 86400000).toISOString(),
    payments,
    tpaClaim: opts.tpaClaim,
    auditLog: [
      { at: createdAt, by: "Reception", action: "Invoice created", detail: `${items.length} line items` },
      ...payments.map((p) => ({ at: p.at, by: p.collectedBy, action: "Payment received", detail: `${p.mode.toUpperCase()} ${p.amount}` })),
    ],
  };
}

export const mockInvoices: Invoice[] = [
  mk("iv01", "MR-2025-00001", "Arjun Singh", "opd", [
    { category: "consultation", code: "CON-CAR", description: "Cardiology consultation", qty: 1, unitPrice: 1200 },
    { category: "procedure", code: "PROC-ECG", description: "ECG — 12 lead", qty: 1, unitPrice: 450, taxable: true },
    { category: "lab", code: "LAB-CBC", description: "Complete Blood Count", qty: 1, unitPrice: 350 },
  ], {
    createdAt: daysAgo(0),
    payments: [{ id: "pay01", at: daysAgo(0), mode: "card", amount: 2023, reference: "AUTH-9921", collectedBy: "Reception" }],
  }),
  mk("iv02", "MR-2025-00002", "Meera Iyer", "opd", [
    { category: "consultation", code: "CON-GEN", description: "General OPD consultation", qty: 1, unitPrice: 600 },
    { category: "lab", code: "LAB-HBA1C", description: "HbA1c", qty: 1, unitPrice: 480 },
  ], { createdAt: daysAgo(4) }),
  mk("iv03", "MR-2025-00003", "Rahul Verma", "ipd", [
    { category: "room", code: "RM-PVT", description: "Private room — 3 days", qty: 3, unitPrice: 6500 },
    { category: "pharmacy", code: "PH-AUG", description: "Augmentin 1.2g IV", qty: 9, unitPrice: 320, taxable: true },
    { category: "procedure", code: "PROC-ECHO", description: "2D Echo", qty: 1, unitPrice: 2800, taxable: true },
    { category: "lab", code: "LAB-TROP", description: "Troponin-I", qty: 2, unitPrice: 1100 },
  ], {
    createdAt: daysAgo(18),
    tpaClaim: {
      provider: "Star Health", tpaName: "MediAssist", policyNumber: "SH-882211",
      preAuthNo: "PA-44128", claimNo: "CL-9942",
      claimedAmount: 27520, approvedAmount: 24000,
      status: "approved", submittedAt: daysAgo(15), lastUpdateAt: daysAgo(3),
      notes: "Approved less ₹3,520 — room rent capping.",
    },
  }),
  mk("iv04", "MR-2025-00005", "Suresh Kumar", "ipd", [
    { category: "room", code: "RM-ICU", description: "ICU bed — 4 days", qty: 4, unitPrice: 12000 },
    { category: "pharmacy", code: "PH-PAN40", description: "Pantoprazole 40 mg", qty: 8, unitPrice: 65, taxable: true },
    { category: "lab", code: "LAB-KFT", description: "KFT panel", qty: 3, unitPrice: 550 },
  ], {
    createdAt: daysAgo(45),
    tpaClaim: {
      provider: "HDFC Ergo", tpaName: "Paramount", policyNumber: "HE-994455",
      preAuthNo: "PA-44021",
      claimedAmount: 51210,
      status: "submitted", submittedAt: daysAgo(30), lastUpdateAt: daysAgo(30),
    },
  }),
  mk("iv05", "MR-2025-00006", "Pooja Desai", "opd", [
    { category: "consultation", code: "CON-FU", description: "Follow-up consultation", qty: 1, unitPrice: 300 },
  ], { createdAt: daysAgo(0), payments: [{ id: "pay05", at: daysAgo(0), mode: "upi", amount: 315, reference: "UPI/9211", collectedBy: "Reception" }] }),
  mk("iv06", "MR-2025-00007", "Vikram Rao", "opd", [
    { category: "consultation", code: "CON-ORTHO", description: "Orthopedic consultation", qty: 1, unitPrice: 1000 },
    { category: "radiology", code: "RAD-MRI", description: "MRI lumbar spine", qty: 1, unitPrice: 7500, taxable: true },
  ], { createdAt: daysAgo(62) }),
  mk("iv07", "MR-2025-00008", "Fatima Sheikh", "opd", [
    { category: "consultation", code: "CON-GEN", description: "General OPD consultation", qty: 1, unitPrice: 600 },
    { category: "procedure", code: "PROC-NEB", description: "Nebulization", qty: 2, unitPrice: 200 },
  ], { createdAt: daysAgo(2) }),
  mk("iv08", "MR-2025-00010", "Lakshmi Nair", "ipd", [
    { category: "room", code: "RM-GEN", description: "General ward — 5 days", qty: 5, unitPrice: 2500 },
    { category: "pharmacy", code: "PH-IVF", description: "RL 500ml", qty: 10, unitPrice: 110, taxable: true },
    { category: "lab", code: "LAB-CBC", description: "CBC", qty: 2, unitPrice: 350 },
  ], {
    createdAt: daysAgo(12),
    tpaClaim: {
      provider: "ICICI Lombard", tpaName: "Health India", policyNumber: "IL-22113",
      claimedAmount: 14250, status: "query", submittedAt: daysAgo(10), lastUpdateAt: daysAgo(2),
      notes: "Insurer requested discharge summary and lab reports.",
    },
  }),
  mk("iv09", "MR-2025-00004", "Anaya Khan", "opd", [
    { category: "consultation", code: "CON-EM", description: "Emergency consultation", qty: 1, unitPrice: 1500 },
    { category: "procedure", code: "PROC-SUT", description: "Suturing", qty: 1, unitPrice: 1200 },
  ], { createdAt: daysAgo(1), payments: [{ id: "pay09", at: daysAgo(1), mode: "cash", amount: 2835, collectedBy: "Reception" }] }),
  mk("iv10", "MR-2025-00009", "Karan Malhotra", "opd", [
    { category: "consultation", code: "CON-GEN", description: "General OPD consultation", qty: 1, unitPrice: 600 },
  ], { createdAt: daysAgo(0), status: "draft" }),
  mk("iv11", "MR-2025-00012", "Ritu Banerjee", "opd", [
    { category: "consultation", code: "CON-CAR", description: "Cardiology consultation", qty: 1, unitPrice: 1200 },
    { category: "procedure", code: "PROC-ECG", description: "ECG — 12 lead", qty: 1, unitPrice: 450, taxable: true },
  ], {
    createdAt: daysAgo(8),
    tpaClaim: {
      provider: "Bajaj Allianz", tpaName: "FHPL", policyNumber: "BA-77541",
      claimedAmount: 1673, status: "pre-auth", lastUpdateAt: daysAgo(7),
    },
  }),
  mk("iv12", "MR-2025-00003", "Rahul Verma", "opd", [
    { category: "consultation", code: "CON-FU", description: "Follow-up consultation", qty: 1, unitPrice: 300 },
    { category: "lab", code: "LAB-LFT", description: "LFT panel", qty: 1, unitPrice: 550 },
  ], { createdAt: daysAgo(20),
    tpaClaim: {
      provider: "Star Health", tpaName: "MediAssist", policyNumber: "SH-882211",
      claimedAmount: 893, status: "rejected", lastUpdateAt: daysAgo(5),
      notes: "Outpatient lab not covered under policy.",
    },
  }),
  // IPD pending invoices for admitted patients (matches admission patientUid)
  mk("iv-ipd-01", "MR-2024-00010", "Rajesh Verma", "ipd", [
    { category: "room", code: "RM-ICU", description: "ICU Room — 3 days", qty: 3, unitPrice: 15000 },
    { category: "procedure", code: "PROC-ECHO", description: "2D Echo", qty: 1, unitPrice: 2800, taxable: true },
    { category: "pharmacy", code: "PH-AUG", description: "Augmentin 1.2g IV", qty: 6, unitPrice: 320, taxable: true },
  ], { createdAt: daysAgo(3), status: "pending" }),
  mk("iv-ipd-02", "MR-2024-00001", "Arjun Singh", "ipd", [
    { category: "room", code: "RM-GEN", description: "General Ward — 3 days", qty: 3, unitPrice: 3500 },
    { category: "lab", code: "LAB-CBC", description: "Complete Blood Count", qty: 2, unitPrice: 350 },
  ], { createdAt: daysAgo(3), status: "draft" }),
];

export function invoicesSummary(list = mockInvoices) {
  const today = list.filter((i) => Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000) === 0);
  const collectionsToday = today.reduce((s, i) => s + i.paid, 0);
  const pendingAmount = list.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.balance, 0);
  const tpaCount = list.filter((i) => i.tpaClaim && !["settled", "rejected"].includes(i.tpaClaim.status)).length;
  const overdueAmount = list
    .filter((i) => Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000) > 60 && i.balance > 0)
    .reduce((s, i) => s + i.balance, 0);
  return {
    invoicesToday: today.length,
    collectionsToday,
    pendingAmount,
    tpaCount,
    overdueAmount,
  };
}

export function ageingBucketsFromInvoices(list = mockInvoices) {
  const buckets = { "0-30": 0, "31-60": 0, "60+": 0 };
  for (const i of list) {
    if (i.balance <= 0) continue;
    const d = Math.floor((Date.now() - new Date(i.createdAt).getTime()) / 86400000);
    if (d <= 30) buckets["0-30"] += i.balance;
    else if (d <= 60) buckets["31-60"] += i.balance;
    else buckets["60+"] += i.balance;
  }
  return buckets;
}
