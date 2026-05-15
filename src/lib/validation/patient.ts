import { z } from "zod";

const phoneRegex = /^[+0-9 ()-]{7,20}$/;

export const patientFormSchema = z.object({
  title: z.enum(["Mr", "Mrs", "Ms", "Dr", "Master", "Miss"]),
  firstName: z.string().trim().min(1, "Required").max(60),
  middleName: z.string().trim().max(60).optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Required").max(60),
  sex: z.enum(["M", "F", "O"]),
  dob: z.string().min(1, "Required"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed", "other"]),

  mobile: z.string().regex(phoneRegex, "Invalid phone"),
  altMobile: z.string().regex(phoneRegex, "Invalid phone").optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address1: z.string().trim().min(1, "Required").max(200),
  address2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Required").max(60),
  state: z.string().trim().min(1, "Required").max(60),
  pincode: z.string().trim().min(3).max(10),
  country: z.string().trim().min(1).max(60),

  idType: z.enum(["Aadhaar", "Passport", "PAN", "Other"]),
  idNumber: z.string().trim().min(3, "Required").max(40),
  nationality: z.string().trim().min(1).max(60),

  emergencyName: z.string().trim().min(1, "Required").max(80),
  emergencyRelation: z.string().trim().min(1, "Required").max(40),
  emergencyPhone: z.string().regex(phoneRegex, "Invalid phone"),

  allergies: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional().or(z.literal("")),

  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().max(80).optional().or(z.literal("")),
  policyNumber: z.string().max(60).optional().or(z.literal("")),
  tpaName: z.string().max(80).optional().or(z.literal("")),
  policyValidity: z.string().optional().or(z.literal("")),

  registrationType: z.enum(["OPD", "IPD", "Emergency"]),
  referredBy: z.string().max(80).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent required" }) }),
}).refine(
  (d) => !d.hasInsurance || (d.insuranceProvider && d.policyNumber),
  { message: "Provider and policy number required", path: ["insuranceProvider"] },
);

export type PatientFormValues = z.infer<typeof patientFormSchema>;
