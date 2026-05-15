import type { Appointment, IpdPatient, BedStatus, BillTransaction, PendingTask } from "@/lib/types";

// ─── Appointments (today's OPD) ──────────────────────────────────────────────
export const mockAppointments: Appointment[] = [
  { id:"a1", token:"T-01", time:"09:00", patient:"Arjun Singh",    uid:"MH-9942", doctor:"Dr. Rajesh Kumar",  dept:"Gen. Medicine", type:"new",       status:"done" },
  { id:"a2", token:"T-02", time:"09:15", patient:"Meena Pillai",   uid:"MH-8831", doctor:"Dr. Rajesh Kumar",  dept:"Gen. Medicine", type:"follow-up", status:"done" },
  { id:"a3", token:"T-03", time:"09:30", patient:"Suresh Rao",     uid:"MH-7723", doctor:"Dr. Rajesh Kumar",  dept:"Gen. Medicine", type:"new",       status:"in-consultation" },
  { id:"a4", token:"T-04", time:"09:45", patient:"Lakshmi Devi",   uid:"MH-6614", doctor:"Dr. Rajesh Kumar",  dept:"Gen. Medicine", type:"follow-up", status:"vitals-done" },
  { id:"a5", token:"T-05", time:"10:00", patient:"Vikram Nair",    uid:"MH-5505", doctor:"Dr. Rajesh Kumar",  dept:"Gen. Medicine", type:"new",       status:"arrived" },
  { id:"a6", token:"T-06", time:"10:15", patient:"Anita Desai",    uid:"MH-4496", doctor:"Dr. Rajesh Kumar",  dept:"Gen. Medicine", type:"new",       status:"scheduled" },
  { id:"a7", token:"T-07", time:"10:30", patient:"Mohan Gupta",    uid:"MH-3387", doctor:"Dr. Rajesh Kumar",  dept:"Gen. Medicine", type:"follow-up", status:"scheduled" },
  { id:"a8", token:"T-08", time:"10:45", patient:"Radha Krishnan", uid:"MH-2278", doctor:"Dr. Pooja Sharma",  dept:"Cardiology",    type:"new",       status:"done" },
  { id:"a9", token:"T-09", time:"11:00", patient:"Ravi Teja",      uid:"MH-1169", doctor:"Dr. Pooja Sharma",  dept:"Cardiology",    type:"new",       status:"in-consultation" },
  { id:"a10",token:"T-10", time:"11:15", patient:"Kavya Menon",    uid:"MH-0060", doctor:"Dr. Pooja Sharma",  dept:"Cardiology",    type:"follow-up", status:"arrived" },
];

// ─── IPD Patients ─────────────────────────────────────────────────────────────
export const mockIpdPatients: IpdPatient[] = [
  { id:"i1", name:"Rajendra Prasad", uid:"MH-1234", bed:"A-101", ward:"Ward A", doctor:"Dr. Rajesh Kumar", day:4,  diagnosis:"Hypertension + DM Type 2",      payer:"insurance", tasks:2, preAuthStatus:"approved" },
  { id:"i2", name:"Sunita Bose",     uid:"MH-2345", bed:"A-102", ward:"Ward A", doctor:"Dr. Rajesh Kumar", day:2,  diagnosis:"Community-acquired Pneumonia",   payer:"self",      tasks:1 },
  { id:"i3", name:"Harish Patel",    uid:"MH-3456", bed:"B-201", ward:"Ward B", doctor:"Dr. Pooja Sharma", day:7,  diagnosis:"Unstable Angina",               payer:"insurance", tasks:3, preAuthStatus:"queried" },
  { id:"i4", name:"Geeta Iyer",      uid:"MH-4567", bed:"B-202", ward:"Ward B", doctor:"Dr. Pooja Sharma", day:1,  diagnosis:"Acute Exacerbation of COPD",    payer:"cghs",      tasks:2 },
  { id:"i5", name:"Sanjay Malhotra", uid:"MH-5678", bed:"C-301", ward:"Ward C", doctor:"Dr. Kiran Rao",   day:3,  diagnosis:"Lower GI Bleeding",             payer:"self",      tasks:0 },
  { id:"i6", name:"Priya Agarwal",   uid:"MH-6789", bed:"C-302", ward:"Ward C", doctor:"Dr. Kiran Rao",   day:5,  diagnosis:"Acute Appendicitis (Post-op)",  payer:"insurance", tasks:1, preAuthStatus:"approved" },
];

// ─── Bed Status (per ward) ────────────────────────────────────────────────────
export const mockBedStatus: BedStatus[] = [
  { ward:"Ward A", total:20, occupied:14, available:4, cleaning:1, maintenance:1 },
  { ward:"Ward B", total:16, occupied:12, available:3, cleaning:1, maintenance:0 },
  { ward:"Ward C", total:12, occupied: 8, available:3, cleaning:1, maintenance:0 },
  { ward:"ICU",    total: 8, occupied: 6, available:1, cleaning:1, maintenance:0 },
];

// ─── Billing Transactions ─────────────────────────────────────────────────────
export const mockTransactions: BillTransaction[] = [
  { id:"b1",  time:"09:12", billNo:"OPD-2024-0891", patient:"Arjun Singh",     type:"OPD", mode:"UPI",          amount:800,   collectedBy:"Priya Nair" },
  { id:"b2",  time:"09:34", billNo:"OPD-2024-0892", patient:"Meena Pillai",    type:"OPD", mode:"Cash",         amount:500,   collectedBy:"Priya Nair" },
  { id:"b3",  time:"10:05", billNo:"IPD-2024-0143", patient:"Rajendra Prasad", type:"IPD", mode:"Insurance",    amount:12500, collectedBy:"Amit Verma" },
  { id:"b4",  time:"10:22", billNo:"OPD-2024-0893", patient:"Suresh Rao",      type:"OPD", mode:"Card",         amount:1200,  collectedBy:"Priya Nair" },
  { id:"b5",  time:"10:48", billNo:"OPD-2024-0894", patient:"Lakshmi Devi",    type:"OPD", mode:"UPI",          amount:350,   collectedBy:"Priya Nair" },
  { id:"b6",  time:"11:10", billNo:"IPD-2024-0144", patient:"Sunita Bose",     type:"IPD", mode:"Payment Link", amount:8200,  collectedBy:"Amit Verma" },
  { id:"b7",  time:"11:35", billNo:"OPD-2024-0895", patient:"Vikram Nair",     type:"OPD", mode:"Cash",         amount:800,   collectedBy:"Priya Nair" },
  { id:"b8",  time:"12:00", billNo:"OPD-2024-0896", patient:"Ravi Teja",       type:"OPD", mode:"UPI",          amount:1500,  collectedBy:"Priya Nair" },
];

// ─── Pending Ward Tasks ───────────────────────────────────────────────────────
export const mockPendingTasks: PendingTask[] = [
  { patient:"Rajendra Prasad", bed:"A-101", task:"Record vitals",         due:"08:00", overdue:true  },
  { patient:"Sunita Bose",     bed:"A-102", task:"Record vitals",         due:"08:00", overdue:true  },
  { patient:"Harish Patel",    bed:"B-201", task:"Administer IV Lasix",   due:"10:00", overdue:true  },
  { patient:"Geeta Iyer",      bed:"B-202", task:"Record vitals",         due:"10:00", overdue:false },
  { patient:"Sanjay Malhotra", bed:"C-301", task:"Dressing change",       due:"11:00", overdue:false },
];

// ─── Recent Registrations ─────────────────────────────────────────────────────
export const mockRecentRegs = [
  { name:"Kavya Menon",    uid:"MH-0060", time:"11:15 AM", payer:"insurance" },
  { name:"Ravi Teja",      uid:"MH-1169", time:"11:00 AM", payer:"self" },
  { name:"Radha Krishnan", uid:"MH-2278", time:"10:48 AM", payer:"cghs" },
  { name:"Vikram Nair",    uid:"MH-5505", time:"09:58 AM", payer:"self" },
  { name:"Suresh Rao",     uid:"MH-7723", time:"09:25 AM", payer:"insurance" },
];

// ─── Dept-wise OPD stats (Admin) ─────────────────────────────────────────────
export const mockDeptOpd = [
  { dept:"General Medicine", appts:12, walkIns:4, total:16 },
  { dept:"Cardiology",       appts:8,  walkIns:2, total:10 },
  { dept:"Orthopaedics",     appts:6,  walkIns:1, total:7  },
  { dept:"ENT",              appts:5,  walkIns:3, total:8  },
  { dept:"Dermatology",      appts:4,  walkIns:2, total:6  },
];

// ─── Pending Radiology (for radiologist) ─────────────────────────────────────
export const mockPendingReports = [
  { id:"r1", patient:"Arjun Singh",     uid:"MH-9942", test:"X-Ray Chest PA", modality:"X-ray", orderedBy:"Dr. Rajesh Kumar", completedAt:"09:45 AM", priority:"routine" },
  { id:"r2", patient:"Harish Patel",    uid:"MH-3456", test:"2D Echo",        modality:"USG",   orderedBy:"Dr. Pooja Sharma", completedAt:"10:20 AM", priority:"urgent" },
  { id:"r3", patient:"Geeta Iyer",      uid:"MH-4567", test:"CT Chest",       modality:"CT",    orderedBy:"Dr. Kiran Rao",   completedAt:"11:00 AM", priority:"stat" },
  { id:"r4", patient:"Priya Agarwal",   uid:"MH-6789", test:"USG Abdomen",    modality:"USG",   orderedBy:"Dr. Kiran Rao",   completedAt:"11:30 AM", priority:"routine" },
];

// ─── TPA Claims ───────────────────────────────────────────────────────────────
export const mockTpaClaims = [
  { id:"c1", patient:"Rajendra Prasad", ip:"IPD-0143", tpa:"MediAssist",   policy:"MA-001234", admission:"12 Nov", preAuth:"Approved ₹85,000", status:"pre-auth-approved", days:4  },
  { id:"c2", patient:"Harish Patel",    ip:"IPD-0141", tpa:"Star Health",  policy:"SH-556677", admission:"09 Nov", preAuth:"Queried",          status:"queried",           days:7  },
  { id:"c3", patient:"Priya Agarwal",   ip:"IPD-0139", tpa:"ICICI Lombard",policy:"IC-998812", admission:"11 Nov", preAuth:"Approved ₹45,000", status:"claim-submitted",  days:5  },
  { id:"c4", patient:"Ravi Teja",       ip:"IPD-0137", tpa:"Bajaj Allianz",policy:"BA-334455", admission:"08 Nov", preAuth:"Pending",          status:"pre-auth-pending",  days:8  },
];
