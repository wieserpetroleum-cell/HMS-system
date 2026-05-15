// ─── Roles ────────────────────────────────────────────────────────────────────
export type Role =
  | "admin"
  | "doctor"
  | "receptionist"
  | "nurse"
  | "billing"
  | "tpa"
  | "radiologist"
  | "radtech"
  | "lab"
  | "pharmacy";

// ─── Route map ────────────────────────────────────────────────────────────────
export const ROLE_DASHBOARD: Record<Role, string> = {
  admin:        "/dashboard",
  doctor:       "/dashboard/doctor",
  receptionist: "/dashboard/reception",
  nurse:        "/dashboard/nurse",
  billing:      "/dashboard/billing",
  tpa:          "/dashboard/tpa",
  radiologist:  "/dashboard/radiologist",
  radtech:      "/dashboard/radtech",
  lab:          "/dashboard",
  pharmacy:     "/dashboard",
};

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  department?: string;
}

// ─── Patient ──────────────────────────────────────────────────────────────────
export interface Patient {
  id: string;
  uid: string;
  name: string;
  sex: "M" | "F" | "O";
  age: string;
  allergies: string[];
  conditions: string[];
  payerType?: "self" | "insurance" | "corporate" | "cghs" | "pmjay";
  mobile?: string;
  bloodGroup?: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | "scheduled"
  | "checked-in"
  | "in-consultation"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctor: string;
  department: string;
  room: string;
  time: string;
  status: AppointmentStatus;
  type: "OPD" | "Follow-up" | "Walk-in";
}

// ─── Ward / Bed ───────────────────────────────────────────────────────────────
export type BedStatus = "available" | "occupied" | "reserved" | "cleaning";

export interface WardBed {
  id: string;
  ward: string;
  bedNumber: string;
  status: BedStatus;
  patientName?: string;
  patientId?: string;
  vitalsDue?: boolean;
  alert?: "stable" | "watch" | "critical";
}

// ─── Bill ─────────────────────────────────────────────────────────────────────
export type BillStatus = "paid" | "pending" | "overdue" | "tpa-pending";

export interface Bill {
  id: string;
  invoiceNo: string;
  patientName: string;
  amount: number;
  status: BillStatus;
  ageDays: number;
  tpa?: string;
  createdAt: string;
}

// ─── Staff ────────────────────────────────────────────────────────────────────
export interface StaffMember {
  id: string;
  name: string;
  role: Role;
  department: string;
  onShift: boolean;
  shift?: string;
}

// ─── TPA / Claim ──────────────────────────────────────────────────────────────
export type ClaimStatus =
  | "pre-auth-pending"
  | "pre-auth-approved"
  | "queried"
  | "claim-submitted"
  | "settled"
  | "denied";

export interface TpaClaim {
  id: string;
  patient: string;
  ipNo: string;
  tpa: string;
  policy: string;
  admissionDate: string;
  preAuth: string;
  status: ClaimStatus;
  days: number;
  amount: number;
}

// ─── Radiology ────────────────────────────────────────────────────────────────
export type RadPriority = "stat" | "urgent" | "routine";

export interface RadOrder {
  id: string;
  patient: string;
  uid: string;
  test: string;
  modality: string;
  orderedBy: string;
  completedAt: string;
  priority: RadPriority;
}
