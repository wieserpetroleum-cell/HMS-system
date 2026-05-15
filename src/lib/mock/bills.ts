import type { Bill } from "@/lib/types";

export const mockBills: Bill[] = [
  { id: "bl1", invoiceNo: "INV-24001", patientName: "Arjun Singh", amount: 8400, status: "paid", ageDays: 0, createdAt: "Today" },
  { id: "bl2", invoiceNo: "INV-24002", patientName: "Priya Sharma", amount: 12500, status: "pending", ageDays: 4, createdAt: "4d ago" },
  { id: "bl3", invoiceNo: "INV-24003", patientName: "Ravi Kumar", amount: 3200, status: "paid", ageDays: 0, createdAt: "Today" },
  { id: "bl4", invoiceNo: "INV-23980", patientName: "Anita Desai", amount: 24800, status: "tpa-pending", ageDays: 18, tpa: "Star Health", createdAt: "18d ago" },
  { id: "bl5", invoiceNo: "INV-23944", patientName: "Sanjay Patel", amount: 56200, status: "tpa-pending", ageDays: 45, tpa: "HDFC Ergo", createdAt: "45d ago" },
  { id: "bl6", invoiceNo: "INV-23912", patientName: "Meera Nair", amount: 9800, status: "overdue", ageDays: 62, createdAt: "62d ago" },
  { id: "bl7", invoiceNo: "INV-24010", patientName: "Vikram Joshi", amount: 4500, status: "pending", ageDays: 2, createdAt: "2d ago" },
  { id: "bl8", invoiceNo: "INV-23990", patientName: "Lakshmi Rao", amount: 18200, status: "tpa-pending", ageDays: 12, tpa: "ICICI Lombard", createdAt: "12d ago" },
];

export function billsSummary() {
  const today = mockBills.filter((b) => b.ageDays === 0);
  const collectionsToday = today.filter((b) => b.status === "paid").reduce((s, b) => s + b.amount, 0);
  const pendingAmount = mockBills.filter((b) => b.status !== "paid").reduce((s, b) => s + b.amount, 0);
  const tpaCount = mockBills.filter((b) => b.status === "tpa-pending").length;
  return { invoicesToday: today.length, collectionsToday, pendingAmount, tpaCount };
}

export function ageingBuckets() {
  const buckets = { "0-30": 0, "31-60": 0, "60+": 0 };
  for (const b of mockBills) {
    if (b.status === "paid") continue;
    if (b.ageDays <= 30) buckets["0-30"] += b.amount;
    else if (b.ageDays <= 60) buckets["31-60"] += b.amount;
    else buckets["60+"] += b.amount;
  }
  return buckets;
}