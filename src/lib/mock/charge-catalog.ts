import type { InvoiceItemCategory } from "@/lib/types";

export interface ChargeCatalogEntry {
  code: string;
  category: InvoiceItemCategory;
  description: string;
  unitPrice: number;
  taxable?: boolean;
}

export const chargeCatalog: ChargeCatalogEntry[] = [
  // Consultations
  { code: "CON-GEN", category: "consultation", description: "General OPD consultation", unitPrice: 600 },
  { code: "CON-CAR", category: "consultation", description: "Cardiology consultation", unitPrice: 1200 },
  { code: "CON-ORTHO", category: "consultation", description: "Orthopedic consultation", unitPrice: 1000 },
  { code: "CON-FU", category: "consultation", description: "Follow-up consultation", unitPrice: 300 },
  { code: "CON-EM", category: "consultation", description: "Emergency consultation", unitPrice: 1500 },
  // Procedures
  { code: "PROC-ECG", category: "procedure", description: "ECG — 12 lead", unitPrice: 450, taxable: true },
  { code: "PROC-ECHO", category: "procedure", description: "2D Echo with Doppler", unitPrice: 2800, taxable: true },
  { code: "PROC-XRAY", category: "procedure", description: "X-Ray single view", unitPrice: 600, taxable: true },
  { code: "PROC-DRESS", category: "procedure", description: "Dressing — major", unitPrice: 800 },
  { code: "PROC-SUT", category: "procedure", description: "Suturing", unitPrice: 1200 },
  { code: "PROC-NEB", category: "procedure", description: "Nebulization", unitPrice: 200 },
  // Room
  { code: "RM-GEN", category: "room", description: "General ward — per day", unitPrice: 2500 },
  { code: "RM-PVT", category: "room", description: "Private room — per day", unitPrice: 6500 },
  { code: "RM-ICU", category: "room", description: "ICU bed — per day", unitPrice: 12000 },
  { code: "RM-DLX", category: "room", description: "Deluxe room — per day", unitPrice: 9500 },
  // Pharmacy
  { code: "PH-PAN40", category: "pharmacy", description: "Pantoprazole 40 mg vial", unitPrice: 65, taxable: true },
  { code: "PH-PCM", category: "pharmacy", description: "Paracetamol 1g infusion", unitPrice: 85, taxable: true },
  { code: "PH-AUG", category: "pharmacy", description: "Augmentin 1.2g IV", unitPrice: 320, taxable: true },
  { code: "PH-ONDA", category: "pharmacy", description: "Ondansetron 4 mg", unitPrice: 35, taxable: true },
  { code: "PH-IVF", category: "pharmacy", description: "IV fluids — Ringer Lactate 500ml", unitPrice: 110, taxable: true },
  // Lab
  { code: "LAB-CBC", category: "lab", description: "Complete Blood Count", unitPrice: 350 },
  { code: "LAB-LFT", category: "lab", description: "Liver Function Test", unitPrice: 550 },
  { code: "LAB-KFT", category: "lab", description: "Kidney Function Test", unitPrice: 550 },
  { code: "LAB-HBA1C", category: "lab", description: "HbA1c", unitPrice: 480 },
  { code: "LAB-TROP", category: "lab", description: "Troponin-I quantitative", unitPrice: 1100 },
  { code: "LAB-COVID", category: "lab", description: "COVID-19 RT-PCR", unitPrice: 800 },
  // Radiology
  { code: "RAD-CT", category: "radiology", description: "CT scan — plain head", unitPrice: 3800, taxable: true },
  { code: "RAD-USG", category: "radiology", description: "USG Abdomen", unitPrice: 1500, taxable: true },
  { code: "RAD-MRI", category: "radiology", description: "MRI lumbar spine", unitPrice: 7500, taxable: true },
  // Misc
  { code: "MISC-REG", category: "misc", description: "Registration fee", unitPrice: 150 },
  { code: "MISC-AMB", category: "misc", description: "Ambulance — local", unitPrice: 1800 },
];

export function catalogToOptions() {
  return chargeCatalog.map((c) => ({
    value: c.code,
    label: c.description,
    hint: `₹${c.unitPrice}`,
  }));
}

export function findCatalog(code: string) {
  return chargeCatalog.find((c) => c.code === code);
}
