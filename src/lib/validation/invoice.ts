import { z } from "zod";

export const invoiceItemSchema = z.object({
  category: z.enum(["consultation", "procedure", "room", "pharmacy", "lab", "radiology", "misc"]),
  description: z.string().min(1, "Description required"),
  qty: z.number().min(1, "Qty ≥ 1").max(999),
  unitPrice: z.number().min(0, "Price ≥ 0").max(1000000),
  taxable: z.boolean().optional(),
});

export const paymentSchema = z.object({
  mode: z.enum(["cash", "card", "upi", "bank", "tpa"]),
  amount: z.number().positive("Amount > 0").max(10000000),
  reference: z.string().max(80).optional(),
});

export const tpaClaimSchema = z.object({
  provider: z.string().min(2).max(80),
  policyNumber: z.string().min(2).max(40),
  tpaName: z.string().min(2).max(60),
  preAuthNo: z.string().max(40).optional(),
  claimedAmount: z.number().min(0),
  approvedAmount: z.number().min(0).optional(),
  status: z.enum(["draft", "pre-auth", "submitted", "query", "approved", "settled", "rejected"]),
  notes: z.string().max(500).optional(),
}).refine((v) => v.status !== "submitted" || (v.preAuthNo && v.preAuthNo.length > 0), {
  message: "Pre-auth number required before submission",
  path: ["preAuthNo"],
});
