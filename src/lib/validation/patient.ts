import { z } from "zod";

const phoneRegex = /^[+0-9 ()-]{7,20}$/;
const optPhone = z.string().regex(phoneRegex, "Invalid phone").optional().or(z.literal(""));

// ── QUICK REGISTRATION (OPD Walk-in) ──────────────────
// Only essential fields. Rest filled later.
export const quickRegisterSchema = z.object({
  title:         z.enum(["Mr", "Mrs", "Ms", "Dr", "Master", "Miss"]),
  firstName:     z.string().trim().min(1, "Required").max(60),
  middleName:    z.string().trim().max(60).optional().or(z.literal("")),
  lastName:      z.string().trim().min(1, "Required").max(60),
  sex:           z.enum(["M", "F", "O"]),
  dob:           z.string().min(1, "Date of birth required"),
  bloodGroup:    z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed", "other"]),
  mobile:        z.string().regex(phoneRegex, "Valid mobile required"),

  // Optional at quick registration
  altMobile:     z.string().regex(phoneRegex, "Invalid phone").optional().or(z.literal("")),
  email:         z.string().email("Invalid email").optional().or(z.literal("")),
  address1:      z.string().trim().max(200).optional().or(z.literal("")),
  address2:      z.string().trim().max(200).optional().or(z.literal("")),
  city:          z.string().trim().max(60).optional().or(z.literal("")),
  state:         z.string().trim().max(60).optional().or(z.literal("")),
  pincode:       z.string().trim().max(10).optional().or(z.literal("")),
  country:       z.string().trim().max(60).optional().or(z.literal("")),
  idType:        z.enum(["Aadhaar", "Passport", "PAN", "Other"]).optional(),
  idNumber:      z.string().trim().max(40).optional().or(z.literal("")),
  nationality:   z.string().trim().max(60).optional().or(z.literal("")),
  emergencyName:     z.string().trim().max(80).optional().or(z.literal("")),
  emergencyRelation: z.string().trim().max(40).optional().or(z.literal("")),
  emergencyPhone:    optPhone,
  allergies:     z.array(z.string()).default([]),
  conditions:    z.array(z.string()).default([]),
  notes:         z.string().max(1000).optional().or(z.literal("")),
  hasInsurance:  z.boolean().default(false),
  insuranceProvider: z.string().max(80).optional().or(z.literal("")),
  policyNumber:  z.string().max(60).optional().or(z.literal("")),
  tpaName:       z.string().max(80).optional().or(z.literal("")),
  policyValidity: z.string().optional().or(z.literal("")),
  registrationType: z.enum(["OPD", "IPD", "Emergency"]),
  referredBy:    z.string().max(80).optional().or(z.literal("")),
  consent:       z.boolean().default(false),
});

// ── FULL REGISTRATION (IPD Admission) ─────────────────
// Additional mandatory fields for inpatient care
export const fullRegisterSchema = quickRegisterSchema.extend({
  address1:          z.string().trim().min(1, "Address required for IPD").max(200),
  city:              z.string().trim().min(1, "City required").max(60),
  state:             z.string().trim().min(1, "State required").max(60),
  pincode:           z.string().trim().min(3, "Pincode required").max(10),
  idType:            z.enum(["Aadhaar", "Passport", "PAN", "Other"]),
  idNumber:          z.string().trim().min(3, "ID number required for IPD").max(40),
  emergencyName:     z.string().trim().min(1, "Emergency contact required for IPD").max(80),
  emergencyRelation: z.string().trim().min(1, "Relation required").max(40),
  emergencyPhone:    z.string().regex(phoneRegex, "Emergency phone required"),
  consent:           z.literal(true, { errorMap: () => ({ message: "Consent required" }) }),
});

// Use quick schema as default (OPD registration)
export const patientFormSchema = quickRegisterSchema;
export type PatientFormValues = z.infer<typeof quickRegisterSchema>;
export type FullPatientFormValues = z.infer<typeof fullRegisterSchema>;

// Helper: check if patient profile is complete for IPD
export function isProfileCompleteForIPD(p: Partial<PatientFormValues>): { complete: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!p.address1) missing.push("Address");
  if (!p.city)     missing.push("City");
  if (!p.state)    missing.push("State");
  if (!p.idNumber) missing.push("ID Number");
  if (!p.emergencyName)  missing.push("Emergency Contact Name");
  if (!p.emergencyPhone) missing.push("Emergency Contact Phone");
  return { complete: missing.length === 0, missing };
}
