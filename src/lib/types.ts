export type Role = "admin" | "doctor" | "receptionist" | "nurse" | "billing" | "tpa" | "radiologist" | "radtech";

export const ROLE_DASHBOARD: Record<Role, string> = {
  admin: "/dashboard",
  doctor: "/dashboard/doctor",
  receptionist: "/dashboard/reception",
  nurse: "/dashboard/nurse",
  billing: "/dashboard/billing",
  tpa: "/dashboard/tpa",
  radiologist: "/dashboard/radiologist",
  radtech: "/dashboard/radtech",
};

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

// ---- IPD / Ward Management ----

export type AdmissionStatus = "active" | "discharged";
export type DietType = "Regular" | "Diabetic" | "Soft" | "Liquid" | "NPO";
export type DischargeCondition = "Stable" | "Improved" | "Critical" | "LAMA" | "Expired";

export interface DischargeSummary {
  finalDiagnosis: DiagnosisEntry[];
  procedures?: string;
  hospitalCourse: string;
  condition: DischargeCondition;
  dischargeMeds: RxItem[];
  followUpInstructions?: string;
  followUpDate?: string;
  signedBy: string;
}

export interface Admission {
  id: string;
  admissionNo: string; // IPD-YYYY-NNNN
  patientUid: string;
  patientName: string;
  bedId: string;
  ward: string;
  bedNumber: string;
  primaryDoctor: string;
  department: string;
  admittedAt: string; // ISO
  reason: string;
  provisionalDiagnosis?: DiagnosisEntry;
  diet: DietType;
  isolation?: boolean;
  status: AdmissionStatus;
  dischargedAt?: string;
  dischargeSummary?: DischargeSummary;
}

export interface VitalReading {
  id: string;
  admissionId: string;
  recordedAt: string;
  recordedBy: string;
  bp?: string;
  pulse?: number;
  temp?: number;
  spo2?: number;
  respRate?: number;
  painScore?: number;
}

export type NursingNoteCategory = "observation" | "medication" | "procedure" | "handover";

export interface NursingNote {
  id: string;
  admissionId: string;
  at: string;
  by: string;
  category: NursingNoteCategory;
  text: string;
}

export interface RoundNote {
  id: string;
  admissionId: string;
  at: string;
  doctor: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export type MarStatus = "given" | "missed" | "refused";

export interface MarAdministration {
  scheduledFor: string; // ISO
  administeredAt?: string;
  by?: string;
  status: MarStatus | "due";
  note?: string;
}

export interface MarEntry {
  id: string;
  admissionId: string;
  drug: string;
  strength?: string;
  dose?: string;
  route?: string;
  frequencyLabel: string; // e.g. "Every 8 hours"
  schedule: MarAdministration[];
  startedAt: string;
}

export type IoType = "intake" | "output";
export type IoSource = "Oral" | "IV" | "Tube feed" | "Urine" | "Drain" | "Vomit" | "Stool";

export interface IntakeOutput {
  id: string;
  admissionId: string;
  at: string;
  type: IoType;
  source: IoSource;
  volumeMl: number;
  by: string;
}

// ---- Billing & TPA ----

export type InvoiceStatus =
  | "draft"
  | "pending"
  | "partial"
  | "paid"
  | "tpa-pending"
  | "overdue"
  | "cancelled";

export type InvoiceItemCategory =
  | "consultation"
  | "procedure"
  | "room"
  | "pharmacy"
  | "lab"
  | "radiology"
  | "misc";

export interface InvoiceItem {
  id: string;
  category: InvoiceItemCategory;
  code?: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  taxable?: boolean;
}

export type PaymentMode = "cash" | "card" | "upi" | "bank" | "tpa";

export interface Payment {
  id: string;
  at: string;
  mode: PaymentMode;
  amount: number;
  reference?: string;
  collectedBy: string;
}

export type TpaClaimStatus =
  | "draft"
  | "pre-auth"
  | "submitted"
  | "query"
  | "approved"
  | "settled"
  | "rejected";

export interface TpaClaim {
  provider: string;
  policyNumber: string;
  tpaName: string;
  preAuthNo?: string;
  claimNo?: string;
  claimedAmount: number;
  approvedAmount?: number;
  status: TpaClaimStatus;
  submittedAt?: string;
  lastUpdateAt: string;
  notes?: string;
}

export interface AuditEvent {
  at: string;
  by: string;
  action: string;
  detail?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  patientUid: string;
  patientName: string;
  sourceType: "opd" | "ipd" | "walkin";
  sourceId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountReason?: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  paid: number;
  balance: number;
  status: InvoiceStatus;
  createdAt: string;
  dueAt?: string;
  payments: Payment[];
  tpaClaim?: TpaClaim;
  auditLog: AuditEvent[];
}

// ---- Radiology ----

export type Modality = "xray" | "ct" | "mri" | "usg" | "mammo" | "dexa";

export type RadiologyPriority = "routine" | "urgent" | "stat";

export type RadiologyOrderStatus =
  | "ordered"
  | "scheduled"
  | "in-acquisition"
  | "acquired"
  | "reporting"
  | "verified"
  | "delivered"
  | "cancelled";

export interface RadiologyOrder {
  id: string;
  orderNo: string; // RAD-YYYY-NNNNN
  patientUid: string;
  patientName: string;
  sourceType: "opd" | "ipd" | "walkin";
  sourceId?: string;
  modality: Modality;
  studyCode: string;
  studyName: string;
  bodyPart: string;
  clinicalIndication: string;
  priority: RadiologyPriority;
  contrast: boolean;
  pregnancy?: boolean;
  orderedBy: string;
  orderedAt: string;
  scheduledAt?: string;
  assignedRadiologist?: string;
  status: RadiologyOrderStatus;
}

export interface RadiologySeries {
  id: string;
  description: string;
  imageCount: number;
  thumbnailHint: string;
}

export interface RadiologyStudy {
  id: string;
  orderId: string;
  accessionNo: string;
  series: RadiologySeries[];
  acquiredAt?: string;
  acquiredBy?: string;
  technologist?: string;
  notes?: string;
}

export interface ReportSection {
  heading: string;
  text: string;
}

export interface RadiologyReport {
  id: string;
  studyId: string;
  templateId?: string;
  sections: ReportSection[];
  criticalFinding: boolean;
  draftedBy?: string;
  draftedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  amendedFrom?: string;
  amendmentReason?: string;
  version: number;
}

export interface ReportTemplate {
  id: string;
  modality: Modality;
  name: string;
  sections: { heading: string; defaultText: string }[];
}

export interface RadiologyEvent {
  at: string;
  by: string;
  action: string;
  detail?: string;
}

// ---- Notifications ----

export type NotificationChannel = "whatsapp" | "sms" | "email";
export type NotificationType =
  | "appointment"
  | "report"
  | "payment"
  | "discharge"
  | "preauth"
  | "other";
export type NotificationStatus = "delivered" | "failed" | "pending";

export type TemplateTrigger =
  | "appointment_booked"
  | "appointment_reminder"
  | "consult_complete"
  | "report_ready"
  | "ipd_admission"
  | "ipd_bill_alert"
  | "discharge"
  | "payment_due"
  | "payment_received"
  | "preauth_update";

export type TemplateStatus = "active" | "inactive" | "pending-meta" | "rejected";

export interface NotificationEntry {
  id: string;
  at: string;
  patientUid: string;
  patientName: string;
  type: NotificationType;
  channel: NotificationChannel;
  templateId?: string;
  preview: string;
  body: string;
  status: NotificationStatus;
  deliveredAt?: string;
  failureReason?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  trigger: TemplateTrigger;
  channels: NotificationChannel[];
  language: string; // ISO-ish code or label
  body: string;
  variables: string[];
  status: TemplateStatus;
  metaApprovalAt?: string;
  updatedAt: string;
}

// ---- Admin & Configuration ----

export interface HospitalProfile {
  name: string;
  tagline?: string;
  type: "single" | "multi" | "super";
  logoUrl?: string;
  // Contact
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  phones: string[];
  emails: string[];
  website?: string;
  // Statutory
  cerNumber?: string;
  gstin?: string;
  pndtNumber?: string;
  aerbNumber?: string;
  nabhNumber?: string;
  nabhExpiry?: string;
  nablNumber?: string;
  nablExpiry?: string;
  // Billing
  invoicePrefix: string;
  invoiceStartingNumber: number;
  fyStartMonth: number; // 1-12
  invoiceFooter?: string;
  gstType: "regular" | "composition";
  // Branding
  primaryColor: string; // hex
  reportHeader?: string;
  reportFooter?: string;
  // Modules
  modules: {
    opd: true;
    ipd: boolean;
    radiology: boolean;
    tpa: boolean;
    whatsapp: boolean;
    sms: boolean;
    paymentLinks: boolean;
  };
}

export interface Department {
  id: string;
  name: string;
  headDoctorId?: string;
  opdActive: boolean;
  ipdActive: boolean;
  status: "active" | "inactive";
}

export type DoctorType = "full-time" | "visiting" | "consultant";
export type RevenueShareModel = "pct-opd" | "pct-ipd" | "fixed-per-consult";

export interface DoctorLeave {
  id: string;
  startDate: string;
  endDate: string;
  type: "personal" | "conference" | "holiday" | "training";
}

export interface DoctorSchedule {
  daysActive: number[]; // 0=Sun..6=Sat
  startTime: string;
  endTime: string;
  slotMinutes: 10 | 15 | 20 | 30;
  opdLocation: string;
  maxPatients: number;
  bufferMinutes: number;
  lunchStart?: string;
  lunchEnd?: string;
}

export interface DoctorProfile {
  id: string;
  firstName: string;
  lastName: string;
  speciality: string;
  departmentId: string;
  type: DoctorType;
  mciNumber: string;
  mciExpiry?: string;
  qualification: string;
  mobile?: string;
  email?: string;
  revenueShareModel: RevenueShareModel;
  revenueSharePct: number;
  isRadiologist: boolean;
  isPathologist: boolean;
  signatureUrl?: string;
  status: "active" | "inactive";
  schedule: DoctorSchedule;
  leaves: DoctorLeave[];
}

export interface Ward {
  id: string;
  name: string;
  floor: number;
  gender: "mixed" | "male" | "female";
  status: "active" | "inactive";
}

export interface BedCategory {
  id: string;
  name: string;
  defaultDailyRate: number;
}

export interface ConfiguredBed {
  id: string;
  wardId: string;
  bedNumber: string;
  categoryId: string;
  dailyRate: number;
  equipment: string[];
  active: boolean;
}

export type ServiceCategory =
  | "consultation"
  | "procedure"
  | "radiology"
  | "nursing"
  | "bed"
  | "misc";

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: ServiceCategory;
  departmentId?: string;
  hsnSac?: string;
  gstRate: 0 | 5 | 12 | 18;
  defaultRate: number;
  isRadiology: boolean;
  modality?: Modality;
  tatHours?: number;
  status: "active" | "inactive";
}

export type PayerType = "self" | "corporate" | "insurance" | "govt" | "camp";

export interface RatePlan {
  id: string;
  name: string;
  payerType: PayerType;
  active: boolean;
  description?: string;
  rates: Record<string, number>; // serviceId -> rate
}

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string; // role id
  departmentId?: string;
  employeeId?: string;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt: string;
}

export type PermissionModule =
  | "patient"
  | "appointments"
  | "opd"
  | "ipd"
  | "radiology"
  | "billing"
  | "tpa"
  | "notifications"
  | "reports"
  | "admin"
  | "audit";

export interface RoleDef {
  id: string;
  name: string;
  systemRole: boolean;
  permissions: Record<PermissionModule, Record<string, boolean>>;
}

export type AuditAction =
  | "login"
  | "logout"
  | "created"
  | "edited"
  | "deleted"
  | "viewed"
  | "approved"
  | "rejected"
  | "exported"
  | "other";

export interface AuditRecord {
  id: string;
  at: string;
  userId: string;
  userName: string;
  role: string;
  action: AuditAction;
  module: PermissionModule;
  recordType: string;
  recordId: string;
  patientName?: string;
  ip: string;
  userAgent: string;
  beforeJson?: unknown;
  afterJson?: unknown;
  endpoint?: string;
  method?: string;
}