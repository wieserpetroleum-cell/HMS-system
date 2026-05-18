import { z } from "zod";

export const admissionSchema = z.object({
  patientUid: z.string().min(1, "Select a patient"),
  bedId: z.string().min(1, "Pick an available bed"),
  primaryDoctor: z.string().min(1, "Assign primary doctor"),
  department: z.string().min(1),
  reason: z.string().min(3, "Reason for admission required"),
  diet: z.enum(["Regular", "Diabetic", "Soft", "Liquid", "NPO"]),
  isolation: z.boolean().optional(),
});

export const vitalReadingSchema = z.object({
  bp: z
    .string()
    .regex(/^\d{2,3}\/\d{2,3}$/u, "BP format e.g. 120/80")
    .optional()
    .or(z.literal("")),
  pulse: z.number().min(30).max(220).optional(),
  temp: z.number().min(30).max(45).optional(),
  spo2: z.number().min(0).max(100).optional(),
  respRate: z.number().min(5).max(60).optional(),
  painScore: z.number().min(0).max(10).optional(),
});

export const dischargeSchema = z.object({
  hospitalCourse: z.string().min(10, "Describe the hospital course"),
  condition: z.enum(["Stable", "Improved", "Critical", "LAMA", "Expired"]),
  finalDiagnosis: z
    .array(z.object({ code: z.string(), text: z.string(), primary: z.boolean().optional() }))
    .min(1, "Final diagnosis required"),
});