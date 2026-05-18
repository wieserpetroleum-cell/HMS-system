import type { RadiologyOrder, RadiologyReport, RadiologyStudy } from "@/lib/types";
import { findStudy } from "./radiology-catalog";
import { reportTemplates } from "./radiology-templates";

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

function build(
  id: string,
  seq: number,
  patientUid: string,
  patientName: string,
  studyCode: string,
  status: RadiologyOrder["status"],
  opts: Partial<RadiologyOrder> = {},
): RadiologyOrder {
  const cat = findStudy(studyCode)!;
  const year = new Date().getFullYear();
  return {
    id,
    orderNo: `RAD-${year}-${String(seq).padStart(5, "0")}`,
    patientUid,
    patientName,
    sourceType: opts.sourceType ?? "opd",
    sourceId: opts.sourceId,
    modality: cat.modality,
    studyCode: cat.code,
    studyName: cat.name,
    bodyPart: cat.bodyPart,
    clinicalIndication: opts.clinicalIndication ?? "Clinical correlation required.",
    priority: opts.priority ?? "routine",
    contrast: opts.contrast ?? false,
    pregnancy: opts.pregnancy,
    orderedBy: opts.orderedBy ?? "Dr. Aarav Mehta",
    orderedAt: opts.orderedAt ?? hoursAgo(4),
    scheduledAt: opts.scheduledAt,
    assignedRadiologist: opts.assignedRadiologist,
    status,
  };
}

export const mockOrders: RadiologyOrder[] = [
  build("ro1", 1, "MR-2025-00001", "Arjun Singh", "XR-CHEST-PA", "ordered", {
    clinicalIndication: "Cough with low-grade fever for 5 days. R/o LRTI.",
    orderedAt: hoursAgo(0.5),
    priority: "urgent",
  }),
  build("ro2", 2, "MR-2025-00002", "Meera Iyer", "US-THYROID", "ordered", {
    clinicalIndication: "Anterior neck swelling, R/o thyroid nodule.",
    orderedAt: hoursAgo(1),
  }),
  build("ro3", 3, "MR-2025-00003", "Rahul Verma", "CT-CHEST-HRCT", "scheduled", {
    clinicalIndication: "Persistent dyspnoea, smoker. R/o ILD.",
    orderedAt: hoursAgo(6),
    scheduledAt: hoursAgo(-2),
    priority: "urgent",
    sourceType: "ipd",
  }),
  build("ro4", 4, "MR-2025-00004", "Anaya Khan", "US-OBS", "scheduled", {
    clinicalIndication: "G2P1, 28 weeks. Routine growth scan.",
    orderedAt: hoursAgo(3),
    scheduledAt: hoursAgo(-4),
  }),
  build("ro5", 5, "MR-2025-00005", "Suresh Kumar", "CT-HEAD-PLAIN", "in-acquisition", {
    clinicalIndication: "Sudden onset headache with vomiting. R/o ICH.",
    orderedAt: hoursAgo(2),
    scheduledAt: hoursAgo(1),
    priority: "stat",
    sourceType: "ipd",
  }),
  build("ro6", 6, "MR-2025-00001", "Arjun Singh", "US-ABDOMEN", "in-acquisition", {
    clinicalIndication: "Right hypochondrial pain. R/o cholelithiasis.",
    orderedAt: hoursAgo(3),
    scheduledAt: hoursAgo(1.5),
  }),
  build("ro7", 7, "MR-2025-00003", "Rahul Verma", "MR-LSPINE", "acquired", {
    clinicalIndication: "Chronic low back pain with radiculopathy.",
    orderedAt: hoursAgo(8),
    scheduledAt: hoursAgo(6),
    assignedRadiologist: "Dr. Neha Kapoor",
  }),
  build("ro8", 8, "MR-2025-00002", "Meera Iyer", "MR-BRAIN-PLAIN", "acquired", {
    clinicalIndication: "Episodic headache with visual aura.",
    orderedAt: hoursAgo(7),
    scheduledAt: hoursAgo(5),
    assignedRadiologist: "Dr. Neha Kapoor",
  }),
  build("ro9", 9, "MR-2025-00004", "Anaya Khan", "XR-WRIST", "reporting", {
    clinicalIndication: "Fall on outstretched hand. R/o fracture.",
    orderedAt: hoursAgo(5),
    scheduledAt: hoursAgo(4.5),
    assignedRadiologist: "Dr. Aniket Roy",
  }),
  build("ro10", 10, "MR-2025-00005", "Suresh Kumar", "CT-ABDOMEN", "reporting", {
    clinicalIndication: "Generalised abdominal pain, raised WBC.",
    orderedAt: hoursAgo(6),
    scheduledAt: hoursAgo(5),
    contrast: true,
    assignedRadiologist: "Dr. Aniket Roy",
    sourceType: "ipd",
  }),
  build("ro11", 11, "MR-2025-00001", "Arjun Singh", "XR-LSPINE", "verified", {
    clinicalIndication: "Lower back pain after lifting weight.",
    orderedAt: hoursAgo(28),
    scheduledAt: hoursAgo(27),
    assignedRadiologist: "Dr. Neha Kapoor",
  }),
  build("ro12", 12, "MR-2025-00003", "Rahul Verma", "CT-ANGIO-CORONARY", "verified", {
    clinicalIndication: "Atypical chest pain, intermediate pretest probability.",
    orderedAt: hoursAgo(54),
    scheduledAt: hoursAgo(50),
    contrast: true,
    priority: "urgent",
    assignedRadiologist: "Dr. Neha Kapoor",
    sourceType: "ipd",
  }),
  build("ro13", 13, "MR-2025-00002", "Meera Iyer", "MG-BILATERAL", "delivered", {
    clinicalIndication: "Screening mammography, family history of Ca breast.",
    orderedAt: hoursAgo(96),
    scheduledAt: hoursAgo(94),
    assignedRadiologist: "Dr. Aniket Roy",
  }),
  build("ro14", 14, "MR-2025-00004", "Anaya Khan", "US-PELVIS", "cancelled", {
    clinicalIndication: "Pelvic pain. Patient cancelled.",
    orderedAt: hoursAgo(120),
  }),
];

function studyFor(orderId: string, seriesSpecs: { description: string; imageCount: number }[], acquiredHoursAgo: number): RadiologyStudy {
  return {
    id: `st-${orderId}`,
    orderId,
    accessionNo: `ACC-${orderId.toUpperCase()}`,
    series: seriesSpecs.map((s, idx) => ({
      id: `${orderId}-s${idx + 1}`,
      description: s.description,
      imageCount: s.imageCount,
      thumbnailHint: `${orderId}-${idx}`,
    })),
    acquiredAt: hoursAgo(acquiredHoursAgo),
    acquiredBy: "Tech. Vikram",
    technologist: "Tech. Vikram",
  };
}

export const mockStudies: RadiologyStudy[] = [
  studyFor("ro5", [{ description: "Axial 5mm", imageCount: 32 }], 0.5),
  studyFor("ro6", [{ description: "Sweep RUQ", imageCount: 18 }, { description: "Sweep LUQ", imageCount: 12 }], 0.5),
  studyFor("ro7", [
    { description: "Sag T1", imageCount: 18 },
    { description: "Sag T2", imageCount: 18 },
    { description: "Ax T2", imageCount: 24 },
  ], 5.5),
  studyFor("ro8", [
    { description: "Ax T1", imageCount: 22 },
    { description: "Ax T2 FLAIR", imageCount: 22 },
    { description: "DWI", imageCount: 22 },
  ], 4.5),
  studyFor("ro9", [{ description: "AP", imageCount: 1 }, { description: "Lateral", imageCount: 1 }], 4),
  studyFor("ro10", [
    { description: "Plain Axial", imageCount: 48 },
    { description: "Portal Venous", imageCount: 48 },
  ], 4.5),
  studyFor("ro11", [{ description: "AP", imageCount: 1 }, { description: "Lateral", imageCount: 1 }], 26),
  studyFor("ro12", [
    { description: "Calcium Score", imageCount: 40 },
    { description: "CTA", imageCount: 220 },
  ], 49),
  studyFor("ro13", [
    { description: "R CC/MLO", imageCount: 2 },
    { description: "L CC/MLO", imageCount: 2 },
  ], 93),
];

function reportFor(orderId: string, templateId: string, opts: { critical?: boolean; verifiedBy?: string; verifiedHoursAgo?: number; impressionOverride?: string }): RadiologyReport {
  const tpl = reportTemplates.find((t) => t.id === templateId)!;
  const sections = tpl.sections.map((s) => ({
    heading: s.heading,
    text: s.heading === "Impression" && opts.impressionOverride ? opts.impressionOverride : s.defaultText,
  }));
  return {
    id: `rep-${orderId}`,
    studyId: `st-${orderId}`,
    templateId,
    sections,
    criticalFinding: opts.critical ?? false,
    draftedBy: opts.verifiedBy ?? "Dr. Neha Kapoor",
    draftedAt: hoursAgo((opts.verifiedHoursAgo ?? 1) + 0.5),
    verifiedBy: opts.verifiedBy ?? "Dr. Neha Kapoor",
    verifiedAt: hoursAgo(opts.verifiedHoursAgo ?? 1),
    version: 1,
  };
}

export const mockReports: RadiologyReport[] = [
  reportFor("ro11", "tpl-xr-chest", { verifiedHoursAgo: 25 }), // template by modality doesn't perfectly match but acceptable
  reportFor("ro12", "tpl-ct-head", {
    verifiedHoursAgo: 47,
    critical: true,
    impressionOverride: "Significant LAD stenosis (~70%) noted. Recommend urgent cardiology consult.",
    verifiedBy: "Dr. Neha Kapoor",
  }),
  reportFor("ro13", "tpl-us-abdomen", { verifiedHoursAgo: 90, verifiedBy: "Dr. Aniket Roy" }),
  // Drafts in progress (not verified) — use a partial report on ro9 / ro10
  {
    id: "rep-ro9",
    studyId: "st-ro9",
    templateId: undefined,
    sections: [
      { heading: "Technique", text: "AP and lateral views of the right wrist obtained." },
      { heading: "Findings", text: "Subtle cortical break at the distal radius dorsally. No displacement." },
      { heading: "Impression", text: "Undisplaced fracture of distal radius (Colles' type)." },
      { heading: "Recommendations", text: "Orthopaedic referral for plaster cast." },
    ],
    criticalFinding: false,
    draftedBy: "Dr. Aniket Roy",
    draftedAt: hoursAgo(3),
    version: 1,
  },
  {
    id: "rep-ro10",
    studyId: "st-ro10",
    templateId: "tpl-ct-abdomen",
    sections: reportTemplates.find((t) => t.id === "tpl-ct-abdomen")!.sections.map((s) => ({ heading: s.heading, text: s.defaultText })),
    criticalFinding: false,
    draftedBy: "Dr. Aniket Roy",
    draftedAt: hoursAgo(2),
    version: 1,
  },
];