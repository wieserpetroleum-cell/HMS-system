export type Role = "admin" | "doctor" | "receptionist" | "nurse" | "lab" | "pharmacy";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
}

export interface Patient {
  id: string;
  uid: string;
  name: string;
  sex: "M" | "F" | "O";
  age: string;
  allergies: string[];
  conditions: string[];
  // Extended demographics (optional for backward compatibility)
  title?: "Mr" | "Mrs" | "Ms" | "Dr" | "Master" | "Miss";
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dob?: string; // ISO date
  bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Unknown";
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | "other";
  // Contact
  mobile?: string;
  altMobile?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  // Identification
  idType?: "Aadhaar" | "Passport" | "PAN" | "Other";
  idNumber?: string;
  nationality?: string;
  // Emergency contact
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
  notes?: string;
  // Insurance
  hasInsurance?: boolean;
  insuranceProvider?: string;
  policyNumber?: string;
  tpaName?: string;
  policyValidity?: string;
  // Registration meta
  registrationType?: "OPD" | "IPD" | "Emergency";
  referredBy?: string;
  registeredAt?: string; // ISO datetime
  lastVisit?: string;
}

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
  time: string; // "09:30"
  status: AppointmentStatus;
  type: "OPD" | "Follow-up" | "Walk-in";
  date?: string; // ISO date "YYYY-MM-DD"
  complaint?: string;
  notes?: string;
  patientUid?: string;
}

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

export interface StaffMember {
  id: string;
  name: string;
  role: Role;
  department: string;
  onShift: boolean;
  shift?: string;
}

export interface Vitals {
  bp?: string; // "120/80"
  pulse?: number;
  temp?: number; // celsius
  spo2?: number; // %
  respRate?: number;
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
}

export interface RxItem {
  id: string;
  drug: string;
  strength?: string;
  form?: "Tablet" | "Capsule" | "Syrup" | "Injection" | "Drops" | "Ointment" | "Inhaler";
  dose?: string;
  frequency?: string; // "1-0-1", "BD", "TDS"
  duration?: string; // "5 days"
  route?: "PO" | "IV" | "IM" | "SC" | "Topical" | "Inhaled";
  instructions?: string;
}

export interface DiagnosisEntry {
  code: string;
  text: string;
  primary?: boolean;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  patientUid: string;
  patientName: string;
  doctor: string;
  date: string; // ISO datetime
  vitals: Vitals;
  chiefComplaints: string[];
  hpi?: string;
  duration?: string;
  examGeneral?: string;
  examCvs?: string;
  examRs?: string;
  examAbdomen?: string;
  examCns?: string;
  diagnoses: DiagnosisEntry[];
  rx: RxItem[];
  advice?: string;
  followUpDays?: number;
  labOrders?: string;
  status: "completed";
}
