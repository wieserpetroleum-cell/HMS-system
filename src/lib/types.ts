export type Role =
  | "admin"
  | "doctor"
  | "receptionist"
  | "nurse"
  | "billing"
  | "tpa"
  | "radiologist"
  | "radtech";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  department?: string;
}

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

export interface Appointment {
  id: string;
  token: string;
  time: string;
  patient: string;
  uid: string;
  doctor: string;
  dept: string;
  type: "new" | "follow-up";
  status: "scheduled" | "arrived" | "vitals-done" | "in-consultation" | "done" | "absent";
}

export interface IpdPatient {
  id: string;
  name: string;
  uid: string;
  bed: string;
  ward: string;
  doctor: string;
  day: number;
  diagnosis: string;
  payer: "self" | "insurance" | "corporate" | "cghs" | "pmjay";
  tasks: number;
  preAuthStatus?: "approved" | "pending" | "queried";
}

export interface BedStatus {
  ward: string;
  total: number;
  occupied: number;
  available: number;
  cleaning: number;
  maintenance: number;
}

export interface BillTransaction {
  id: string;
  time: string;
  billNo: string;
  patient: string;
  type: "OPD" | "IPD";
  mode: "Cash" | "Card" | "UPI" | "Payment Link" | "Insurance";
  amount: number;
  collectedBy: string;
}

export interface PendingTask {
  patient: string;
  bed: string;
  task: string;
  due: string;
  overdue: boolean;
}
