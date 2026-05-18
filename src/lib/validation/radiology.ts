import { z } from "zod";

export const newOrderSchema = z.object({
  patientUid: z.string().min(1, "Select a patient"),
  patientName: z.string().min(1),
  modality: z.enum(["xray", "ct", "mri", "usg", "mammo", "dexa"]),
  studyCode: z.string().min(1, "Select a study"),
  studyName: z.string().min(1),
  bodyPart: z.string().min(1),
  clinicalIndication: z.string().min(8, "At least 8 characters"),
  priority: z.enum(["routine", "urgent", "stat"]),
  contrast: z.boolean(),
  pregnancy: z.boolean().optional(),
  orderedBy: z.string().min(1),
  scheduledAt: z.string().optional(),
  sourceType: z.enum(["opd", "ipd", "walkin"]),
  sourceId: z.string().optional(),
});

export type NewOrderInput = z.infer<typeof newOrderSchema>;

export const reportSectionSchema = z.object({
  heading: z.string().min(1),
  text: z.string(),
});

export const verifySchema = z.object({
  sections: z.array(reportSectionSchema).superRefine((sections, ctx) => {
    const findings = sections.find((s) => s.heading.toLowerCase() === "findings");
    const impression = sections.find((s) => s.heading.toLowerCase() === "impression");
    if (!findings || findings.text.trim().length < 4) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["findings"], message: "Findings required" });
    }
    if (!impression || impression.text.trim().length < 4) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["impression"], message: "Impression required" });
    }
  }),
});

export function pregnancyRule({ sex, ageYears, contrast }: { sex?: string; ageYears?: number; contrast: boolean }) {
  return Boolean(contrast && sex === "F" && ageYears !== undefined && ageYears >= 12 && ageYears <= 55);
}