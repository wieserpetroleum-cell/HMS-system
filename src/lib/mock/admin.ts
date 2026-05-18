import type {
  AppUser,
  AuditRecord,
  BedCategory,
  ConfiguredBed,
  Department,
  DoctorProfile,
  HospitalProfile,
  PermissionModule,
  RatePlan,
  RoleDef,
  ServiceItem,
  Ward,
} from "@/lib/types";

export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete", "approve", "export"] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_MODULES: PermissionModule[] = [
  "patient", "appointments", "opd", "ipd", "radiology", "billing",
  "tpa", "notifications", "reports", "admin", "audit",
];

function fullPerms(allow: boolean): Record<PermissionModule, Record<string, boolean>> {
  const out = {} as Record<PermissionModule, Record<string, boolean>>;
  for (const m of PERMISSION_MODULES) {
    out[m] = {};
    for (const a of PERMISSION_ACTIONS) out[m][a] = allow;
  }
  return out;
}

export const mockHospital: HospitalProfile = {
  name: "MediCore General Hospital",
  tagline: "Compassionate care, evidence-led medicine.",
  type: "multi",
  address1: "Plot 12, Health City Road",
  address2: "Sector 22",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560100",
  phones: ["+91 80 4000 1200", "+91 80 4000 1201"],
  emails: ["contact@medicore.os", "billing@medicore.os"],
  website: "https://medicore.os",
  cerNumber: "CER-KA-2018-00214",
  gstin: "29ABCDE1234F1Z5",
  pndtNumber: "PNDT/KA/2019/0341",
  aerbNumber: "AERB/RAD/4221",
  nabhNumber: "NABH-H-2023-1102",
  nabhExpiry: "2027-04-30",
  nablNumber: "NABL-M-7711",
  nablExpiry: "2026-12-31",
  invoicePrefix: "INV",
  invoiceStartingNumber: 1001,
  fyStartMonth: 4,
  invoiceFooter: "Subject to Bengaluru jurisdiction. E. & O.E.",
  gstType: "regular",
  primaryColor: "#0ea5e9",
  reportHeader: "MediCore General Hospital · Diagnostics",
  reportFooter: "This is a computer generated report.",
  modules: { opd: true, ipd: true, radiology: true, tpa: true, whatsapp: true, sms: true, paymentLinks: false },
};

export const mockDepartments: Department[] = [
  { id: "d_cardio", name: "Cardiology", headDoctorId: "doc_1", opdActive: true, ipdActive: true, status: "active" },
  { id: "d_gen", name: "General Medicine", headDoctorId: "doc_2", opdActive: true, ipdActive: true, status: "active" },
  { id: "d_ortho", name: "Orthopedics", headDoctorId: "doc_3", opdActive: true, ipdActive: true, status: "active" },
  { id: "d_paed", name: "Pediatrics", opdActive: true, ipdActive: true, status: "active" },
  { id: "d_rad", name: "Radiology", opdActive: false, ipdActive: false, status: "active" },
  { id: "d_obg", name: "Obstetrics & Gynaecology", opdActive: true, ipdActive: true, status: "active" },
  { id: "d_derm", name: "Dermatology", opdActive: true, ipdActive: false, status: "inactive" },
];

function emptySchedule() {
  return {
    daysActive: [1, 2, 3, 4, 5, 6],
    startTime: "09:00",
    endTime: "17:00",
    slotMinutes: 15 as const,
    opdLocation: "OPD Block A",
    maxPatients: 30,
    bufferMinutes: 5,
    lunchStart: "13:00",
    lunchEnd: "13:45",
  };
}

export const mockDoctors: DoctorProfile[] = [
  {
    id: "doc_1", firstName: "Aarav", lastName: "Mehta", speciality: "Interventional Cardiology",
    departmentId: "d_cardio", type: "full-time", mciNumber: "KMC-44218", mciExpiry: "2028-06-30",
    qualification: "MD, DM (Cardio)", mobile: "+91 98800 11111", email: "aarav@medicore.os",
    revenueShareModel: "pct-opd", revenueSharePct: 40, isRadiologist: false, isPathologist: false,
    status: "active", schedule: { ...emptySchedule(), slotMinutes: 20 }, leaves: [],
  },
  {
    id: "doc_2", firstName: "Suresh", lastName: "Iyer", speciality: "Internal Medicine",
    departmentId: "d_gen", type: "full-time", mciNumber: "KMC-39811", mciExpiry: "2027-03-31",
    qualification: "MD (Gen Med)", mobile: "+91 98800 22222", email: "suresh@medicore.os",
    revenueShareModel: "pct-opd", revenueSharePct: 35, isRadiologist: false, isPathologist: false,
    status: "active", schedule: emptySchedule(), leaves: [],
  },
  {
    id: "doc_3", firstName: "Naseem", lastName: "Khan", speciality: "Joint Replacement",
    departmentId: "d_ortho", type: "visiting", mciNumber: "KMC-51210", mciExpiry: "2029-01-15",
    qualification: "MS (Ortho)", mobile: "+91 98800 33333", email: "naseem@medicore.os",
    revenueShareModel: "fixed-per-consult", revenueSharePct: 0, isRadiologist: false, isPathologist: false,
    status: "active", schedule: { ...emptySchedule(), startTime: "10:00", endTime: "18:00" }, leaves: [],
  },
  {
    id: "doc_4", firstName: "Anjali", lastName: "Rao", speciality: "Radiology",
    departmentId: "d_rad", type: "consultant", mciNumber: "KMC-60121", mciExpiry: "2026-11-30",
    qualification: "MD (Radiology)", mobile: "+91 98800 44444", email: "anjali@medicore.os",
    revenueShareModel: "pct-ipd", revenueSharePct: 25, isRadiologist: true, isPathologist: false,
    status: "active", schedule: emptySchedule(), leaves: [],
  },
];

export const mockWardsAdmin: Ward[] = [
  { id: "w_icu", name: "ICU", floor: 3, gender: "mixed", status: "active" },
  { id: "w_ga", name: "General A", floor: 2, gender: "male", status: "active" },
  { id: "w_gb", name: "General B", floor: 2, gender: "female", status: "active" },
  { id: "w_pd", name: "Pediatric", floor: 4, gender: "mixed", status: "active" },
  { id: "w_pvt", name: "Private", floor: 5, gender: "mixed", status: "active" },
];

export const mockBedCategories: BedCategory[] = [
  { id: "bc_gen", name: "General", defaultDailyRate: 2500 },
  { id: "bc_semi", name: "Semi-Private", defaultDailyRate: 4500 },
  { id: "bc_pvt", name: "Private", defaultDailyRate: 6500 },
  { id: "bc_dlx", name: "Deluxe", defaultDailyRate: 9500 },
  { id: "bc_icu", name: "ICU", defaultDailyRate: 12000 },
  { id: "bc_iso", name: "Isolation", defaultDailyRate: 8500 },
  { id: "bc_hdu", name: "HDU", defaultDailyRate: 9000 },
];

export const mockConfiguredBeds: ConfiguredBed[] = [
  { id: "cb1", wardId: "w_icu", bedNumber: "ICU-01", categoryId: "bc_icu", dailyRate: 12000, equipment: ["Ventilator", "Monitor"], active: true },
  { id: "cb2", wardId: "w_icu", bedNumber: "ICU-02", categoryId: "bc_icu", dailyRate: 12000, equipment: ["Monitor"], active: true },
  { id: "cb3", wardId: "w_icu", bedNumber: "ICU-03", categoryId: "bc_icu", dailyRate: 12000, equipment: [], active: true },
  { id: "cb4", wardId: "w_ga", bedNumber: "GA-01", categoryId: "bc_gen", dailyRate: 2500, equipment: [], active: true },
  { id: "cb5", wardId: "w_ga", bedNumber: "GA-02", categoryId: "bc_gen", dailyRate: 2500, equipment: [], active: true },
  { id: "cb6", wardId: "w_ga", bedNumber: "GA-03", categoryId: "bc_gen", dailyRate: 2500, equipment: [], active: true },
  { id: "cb7", wardId: "w_pvt", bedNumber: "PR-01", categoryId: "bc_pvt", dailyRate: 6500, equipment: ["TV"], active: true },
  { id: "cb8", wardId: "w_pvt", bedNumber: "PR-02", categoryId: "bc_dlx", dailyRate: 9500, equipment: ["TV", "Sofa"], active: true },
  { id: "cb9", wardId: "w_pd", bedNumber: "PD-01", categoryId: "bc_gen", dailyRate: 2200, equipment: [], active: true },
];

export const mockServices: ServiceItem[] = [
  { id: "sv_con_gen", code: "CON-GEN", name: "General OPD consultation", category: "consultation", departmentId: "d_gen", hsnSac: "999319", gstRate: 0, defaultRate: 600, isRadiology: false, status: "active" },
  { id: "sv_con_car", code: "CON-CAR", name: "Cardiology consultation", category: "consultation", departmentId: "d_cardio", hsnSac: "999319", gstRate: 0, defaultRate: 1200, isRadiology: false, status: "active" },
  { id: "sv_proc_ecg", code: "PROC-ECG", name: "ECG — 12 lead", category: "procedure", departmentId: "d_cardio", hsnSac: "999316", gstRate: 5, defaultRate: 450, isRadiology: false, status: "active" },
  { id: "sv_proc_echo", code: "PROC-ECHO", name: "2D Echo with Doppler", category: "procedure", departmentId: "d_cardio", hsnSac: "999316", gstRate: 5, defaultRate: 2800, isRadiology: false, status: "active" },
  { id: "sv_rad_xray", code: "RAD-XR", name: "X-Ray single view", category: "radiology", departmentId: "d_rad", hsnSac: "999316", gstRate: 5, defaultRate: 600, isRadiology: true, modality: "xray", tatHours: 2, status: "active" },
  { id: "sv_rad_ct", code: "RAD-CT", name: "CT scan — plain head", category: "radiology", departmentId: "d_rad", hsnSac: "999316", gstRate: 5, defaultRate: 3800, isRadiology: true, modality: "ct", tatHours: 4, status: "active" },
  { id: "sv_rad_mri", code: "RAD-MRI", name: "MRI lumbar spine", category: "radiology", departmentId: "d_rad", hsnSac: "999316", gstRate: 5, defaultRate: 7500, isRadiology: true, modality: "mri", tatHours: 6, status: "active" },
  { id: "sv_rad_usg", code: "RAD-USG", name: "USG Abdomen", category: "radiology", departmentId: "d_rad", hsnSac: "999316", gstRate: 5, defaultRate: 1500, isRadiology: true, modality: "usg", tatHours: 3, status: "active" },
  { id: "sv_bed_gen", code: "BED-GEN", name: "General ward — per day", category: "bed", hsnSac: "999322", gstRate: 0, defaultRate: 2500, isRadiology: false, status: "active" },
  { id: "sv_bed_icu", code: "BED-ICU", name: "ICU bed — per day", category: "bed", hsnSac: "999322", gstRate: 0, defaultRate: 12000, isRadiology: false, status: "active" },
  { id: "sv_nur_inj", code: "NUR-INJ", name: "Injection administration", category: "nursing", hsnSac: "999319", gstRate: 0, defaultRate: 100, isRadiology: false, status: "active" },
  { id: "sv_misc_reg", code: "MISC-REG", name: "Registration fee", category: "misc", hsnSac: "999319", gstRate: 0, defaultRate: 150, isRadiology: false, status: "active" },
];

function makePlan(id: string, name: string, payerType: RatePlan["payerType"], pct: number): RatePlan {
  const rates: Record<string, number> = {};
  for (const s of mockServices) rates[s.id] = Math.round(s.defaultRate * pct);
  return { id, name, payerType, active: true, description: `${name} negotiated rates`, rates };
}

export const mockRatePlans: RatePlan[] = [
  makePlan("rp_self", "Self-Pay (Default)", "self", 1),
  makePlan("rp_corpA", "Corporate-A (TCS / Infosys)", "corporate", 0.9),
  makePlan("rp_corpB", "Corporate-B (Wipro)", "corporate", 0.85),
  makePlan("rp_cghs", "CGHS", "govt", 0.7),
  makePlan("rp_echs", "ECHS", "govt", 0.72),
  makePlan("rp_pmjay", "PMJAY", "govt", 0.6),
  makePlan("rp_star", "Star Health Insurance", "insurance", 0.92),
  makePlan("rp_camp", "Health Camp — Outreach", "camp", 0.5),
];

export const mockRoles: RoleDef[] = [
  { id: "r_super", name: "Super Admin", systemRole: true, permissions: fullPerms(true) },
  { id: "r_admin", name: "Administrator", systemRole: true, permissions: fullPerms(true) },
  {
    id: "r_doctor", name: "Doctor", systemRole: true,
    permissions: (() => {
      const p = fullPerms(false);
      for (const m of ["patient", "appointments", "opd", "ipd", "radiology", "reports"] as PermissionModule[]) {
        p[m] = { view: true, create: true, edit: true, delete: false, approve: true, export: true };
      }
      p.notifications = { view: true, create: false, edit: false, delete: false, approve: false, export: false };
      return p;
    })(),
  },
  {
    id: "r_nurse", name: "Nurse", systemRole: true,
    permissions: (() => {
      const p = fullPerms(false);
      for (const m of ["patient", "ipd"] as PermissionModule[]) {
        p[m] = { view: true, create: true, edit: true, delete: false, approve: false, export: false };
      }
      p.appointments = { view: true, create: false, edit: false, delete: false, approve: false, export: false };
      return p;
    })(),
  },
  {
    id: "r_receptionist", name: "Receptionist", systemRole: true,
    permissions: (() => {
      const p = fullPerms(false);
      p.patient = { view: true, create: true, edit: true, delete: false, approve: false, export: false };
      p.appointments = { view: true, create: true, edit: true, delete: true, approve: false, export: true };
      p.billing = { view: true, create: true, edit: false, delete: false, approve: false, export: true };
      return p;
    })(),
  },
  {
    id: "r_billing", name: "Billing Executive", systemRole: true,
    permissions: (() => {
      const p = fullPerms(false);
      p.billing = { view: true, create: true, edit: true, delete: false, approve: true, export: true };
      p.tpa = { view: true, create: true, edit: true, delete: false, approve: false, export: true };
      p.patient = { view: true, create: false, edit: false, delete: false, approve: false, export: false };
      return p;
    })(),
  },
];

export const mockAppUsers: AppUser[] = [
  { id: "u1", firstName: "Elena", lastName: "Rossi", email: "admin@medicore.os", phone: "+91 98800 90001", role: "r_admin", employeeId: "EMP-001", status: "active", lastLogin: new Date().toISOString(), createdAt: "2024-01-15T09:00:00.000Z" },
  { id: "u2", firstName: "Aarav", lastName: "Mehta", email: "aarav@medicore.os", phone: "+91 98800 11111", role: "r_doctor", departmentId: "d_cardio", employeeId: "EMP-014", status: "active", lastLogin: "2026-05-17T08:12:00.000Z", createdAt: "2024-02-02T09:00:00.000Z" },
  { id: "u3", firstName: "Suresh", lastName: "Iyer", email: "suresh@medicore.os", phone: "+91 98800 22222", role: "r_doctor", departmentId: "d_gen", employeeId: "EMP-015", status: "active", lastLogin: "2026-05-17T07:30:00.000Z", createdAt: "2024-02-02T09:00:00.000Z" },
  { id: "u4", firstName: "Kavya", lastName: "Pillai", email: "kavya.n@medicore.os", phone: "+91 98800 55501", role: "r_nurse", departmentId: "d_gen", employeeId: "EMP-101", status: "active", lastLogin: "2026-05-17T06:55:00.000Z", createdAt: "2024-04-12T09:00:00.000Z" },
  { id: "u5", firstName: "Riya", lastName: "Kapoor", email: "riya@medicore.os", phone: "+91 98800 77701", role: "r_receptionist", employeeId: "EMP-211", status: "active", lastLogin: "2026-05-17T09:01:00.000Z", createdAt: "2024-06-01T09:00:00.000Z" },
  { id: "u6", firstName: "Manish", lastName: "Gupta", email: "manish.b@medicore.os", phone: "+91 98800 88801", role: "r_billing", employeeId: "EMP-309", status: "active", lastLogin: "2026-05-16T18:22:00.000Z", createdAt: "2024-08-19T09:00:00.000Z" },
  { id: "u7", firstName: "Vikram", lastName: "Shah", email: "vikram@medicore.os", role: "r_doctor", departmentId: "d_ortho", employeeId: "EMP-022", status: "inactive", lastLogin: "2026-02-09T11:42:00.000Z", createdAt: "2024-03-15T09:00:00.000Z" },
];

function pastIso(daysAgo: number, hour = 10, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

export const mockAuditRecords: AuditRecord[] = [
  { id: "a1", at: pastIso(0, 9, 5), userId: "u1", userName: "Dr. Elena Rossi", role: "Administrator", action: "login", module: "admin", recordType: "Session", recordId: "sess_a1", ip: "10.0.4.21", userAgent: "Chrome 124 / macOS" },
  { id: "a2", at: pastIso(0, 9, 12), userId: "u5", userName: "Riya Kapoor", role: "Receptionist", action: "created", module: "patient", recordType: "Patient", recordId: "P-2026-00891", patientName: "M. Banerjee", ip: "10.0.4.55", userAgent: "Chrome 124 / Windows", afterJson: { uid: "P-2026-00891", name: "M. Banerjee", age: 41 } },
  { id: "a3", at: pastIso(0, 9, 30), userId: "u5", userName: "Riya Kapoor", role: "Receptionist", action: "created", module: "appointments", recordType: "Appointment", recordId: "APT-2026-04412", patientName: "M. Banerjee", ip: "10.0.4.55", userAgent: "Chrome 124 / Windows" },
  { id: "a4", at: pastIso(0, 10, 15), userId: "u2", userName: "Dr. Aarav Mehta", role: "Doctor", action: "edited", module: "opd", recordType: "Consultation", recordId: "CONS-9912", patientName: "R. Verma", ip: "10.0.4.71", userAgent: "Safari 17 / iPad", beforeJson: { diagnoses: ["HTN"] }, afterJson: { diagnoses: ["HTN", "Type-2 DM"] }, endpoint: "/consultations/CONS-9912", method: "PATCH" },
  { id: "a5", at: pastIso(0, 11, 0), userId: "u6", userName: "Manish Gupta", role: "Billing", action: "approved", module: "billing", recordType: "Discount", recordId: "INV-2026-1421", patientName: "S. Khan", ip: "10.0.4.88", userAgent: "Chrome 124 / Windows", beforeJson: { discount: 0 }, afterJson: { discount: 1200, reason: "Senior citizen" } },
  { id: "a6", at: pastIso(0, 12, 41), userId: "u4", userName: "Nurse Kavya Pillai", role: "Nurse", action: "created", module: "ipd", recordType: "Vitals", recordId: "VIT-77231", patientName: "A. Singh", ip: "10.0.4.40", userAgent: "Edge 124 / Windows" },
  { id: "a7", at: pastIso(1, 14, 22), userId: "u1", userName: "Dr. Elena Rossi", role: "Administrator", action: "edited", module: "admin", recordType: "RatePlan", recordId: "rp_corpA", ip: "10.0.4.21", userAgent: "Chrome 124 / macOS", beforeJson: { active: false }, afterJson: { active: true } },
  { id: "a8", at: pastIso(1, 17, 8), userId: "u6", userName: "Manish Gupta", role: "Billing", action: "exported", module: "billing", recordType: "Report", recordId: "RPT-DAILY-2026-05-17", ip: "10.0.4.88", userAgent: "Chrome 124 / Windows" },
  { id: "a9", at: pastIso(2, 9, 0), userId: "u2", userName: "Dr. Aarav Mehta", role: "Doctor", action: "approved", module: "radiology", recordType: "RadiologyReport", recordId: "RAD-RPT-441", patientName: "L. Rao", ip: "10.0.4.71", userAgent: "Chrome 124 / Windows" },
  { id: "a10", at: pastIso(2, 19, 14), userId: "u1", userName: "Dr. Elena Rossi", role: "Administrator", action: "deleted", module: "admin", recordType: "ServiceItem", recordId: "sv_legacy_x", ip: "10.0.4.21", userAgent: "Chrome 124 / macOS", beforeJson: { name: "Legacy fee", defaultRate: 250 } },
  { id: "a11", at: pastIso(3, 8, 32), userId: "u5", userName: "Riya Kapoor", role: "Receptionist", action: "login", module: "admin", recordType: "Session", recordId: "sess_a11", ip: "10.0.4.55", userAgent: "Chrome 124 / Windows" },
  { id: "a12", at: pastIso(4, 11, 20), userId: "u3", userName: "Dr. Suresh Iyer", role: "Doctor", action: "edited", module: "opd", recordType: "Prescription", recordId: "RX-3320", patientName: "P. Sharma", ip: "10.0.4.72", userAgent: "Chrome 124 / Windows" },
  { id: "a13", at: pastIso(5, 10, 5), userId: "u7", userName: "Dr. Vikram Shah", role: "Doctor", action: "logout", module: "admin", recordType: "Session", recordId: "sess_a13", ip: "10.0.4.99", userAgent: "Firefox 125 / Windows" },
  { id: "a14", at: pastIso(6, 15, 45), userId: "u1", userName: "Dr. Elena Rossi", role: "Administrator", action: "created", module: "admin", recordType: "AppUser", recordId: "u_new_001", ip: "10.0.4.21", userAgent: "Chrome 124 / macOS", afterJson: { name: "New User", role: "r_nurse" } },
];