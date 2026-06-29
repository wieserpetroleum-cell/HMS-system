import type { InvoiceItemCategory } from "@/lib/types";

export interface ChargeCatalogEntry {
  code: string;
  category: InvoiceItemCategory;
  description: string;
  unitPrice: number;
  taxable?: boolean;
}

export const chargeCatalog: ChargeCatalogEntry[] = [
  // ── Consultations ───────────────────────────────────────────
  { code: "CON-GEN",   category: "consultation", description: "General OPD Consultation",        unitPrice: 500  },
  { code: "CON-CAR",   category: "consultation", description: "Cardiology Consultation",         unitPrice: 1200 },
  { code: "CON-ORTHO", category: "consultation", description: "Orthopedic Consultation",         unitPrice: 1000 },
  { code: "CON-PEDS",  category: "consultation", description: "Pediatrics Consultation",         unitPrice: 700  },
  { code: "CON-NEURO", category: "consultation", description: "Neurology Consultation",          unitPrice: 1500 },
  { code: "CON-GYN",   category: "consultation", description: "Gynecology Consultation",         unitPrice: 900  },
  { code: "CON-FU",    category: "consultation", description: "Follow-up Consultation",          unitPrice: 300  },
  { code: "CON-EM",    category: "consultation", description: "Emergency Consultation",          unitPrice: 1500 },

  // ── Procedures ──────────────────────────────────────────────
  { code: "PROC-ECG",  category: "procedure", description: "ECG — 12 Lead",                      unitPrice: 450,  taxable: true },
  { code: "PROC-ECHO", category: "procedure", description: "2D Echo with Doppler",               unitPrice: 2800, taxable: true },
  { code: "PROC-DRESS",category: "procedure", description: "Dressing — Major",                   unitPrice: 800  },
  { code: "PROC-SUT",  category: "procedure", description: "Suturing",                           unitPrice: 1200 },
  { code: "PROC-NEB",  category: "procedure", description: "Nebulization",                       unitPrice: 200  },
  { code: "PROC-PLASTER",category: "procedure",description: "POP Cast Application",             unitPrice: 1500 },

  // ── Room Charges ────────────────────────────────────────────
  { code: "RM-GEN",    category: "room", description: "General Ward — per day",                  unitPrice: 2500  },
  { code: "RM-PVT",    category: "room", description: "Private Room — per day",                  unitPrice: 6500  },
  { code: "RM-ICU",    category: "room", description: "ICU Bed — per day",                       unitPrice: 12000 },
  { code: "RM-DLX",    category: "room", description: "Deluxe Room — per day",                   unitPrice: 9500  },
  { code: "RM-HDU",    category: "room", description: "HDU Bed — per day",                       unitPrice: 8000  },

  // ── Pharmacy ────────────────────────────────────────────────
  { code: "PH-PAN40",  category: "pharmacy", description: "Pantoprazole 40mg vial",             unitPrice: 65,  taxable: true },
  { code: "PH-PCM",    category: "pharmacy", description: "Paracetamol 1g infusion",            unitPrice: 85,  taxable: true },
  { code: "PH-AUG",    category: "pharmacy", description: "Augmentin 1.2g IV",                  unitPrice: 320, taxable: true },
  { code: "PH-ONDA",   category: "pharmacy", description: "Ondansetron 4mg",                    unitPrice: 35,  taxable: true },
  { code: "PH-IVF",    category: "pharmacy", description: "IV Fluids — Ringer Lactate 500ml",   unitPrice: 110, taxable: true },

  // ── Laboratory ──────────────────────────────────────────────
  { code: "LAB-CBC",   category: "lab", description: "Complete Blood Count (CBC)",               unitPrice: 350  },
  { code: "LAB-LFT",   category: "lab", description: "Liver Function Test (LFT)",               unitPrice: 550  },
  { code: "LAB-KFT",   category: "lab", description: "Kidney Function Test (KFT)",              unitPrice: 550  },
  { code: "LAB-HBA1C", category: "lab", description: "HbA1c",                                   unitPrice: 480  },
  { code: "LAB-TROP",  category: "lab", description: "Troponin-I Quantitative",                 unitPrice: 1100 },
  { code: "LAB-COVID", category: "lab", description: "COVID-19 RT-PCR",                         unitPrice: 800  },
  { code: "LAB-LIPID", category: "lab", description: "Lipid Profile",                           unitPrice: 450  },
  { code: "LAB-TSH",   category: "lab", description: "TSH",                                     unitPrice: 380  },

  // ── Radiology — X-Ray (matches radiology catalog exactly) ───
  { code: "XR-CHEST-PA",  category: "radiology", description: "X-Ray Chest PA",                 unitPrice: 450,  taxable: true },
  { code: "XR-CHEST-LAT", category: "radiology", description: "X-Ray Chest Lateral",            unitPrice: 450,  taxable: true },
  { code: "XR-KNEE-AP",   category: "radiology", description: "X-Ray Knee AP/Lateral",          unitPrice: 550,  taxable: true },
  { code: "XR-LSPINE",    category: "radiology", description: "X-Ray Lumbar Spine",             unitPrice: 700,  taxable: true },
  { code: "XR-WRIST",     category: "radiology", description: "X-Ray Wrist",                    unitPrice: 500,  taxable: true },
  { code: "XR-PELVIS",    category: "radiology", description: "X-Ray Pelvis",                   unitPrice: 600,  taxable: true },

  // ── Radiology — CT (matches radiology catalog exactly) ──────
  { code: "CT-HEAD-PLAIN",    category: "radiology", description: "CT Head Plain",              unitPrice: 2800, taxable: true },
  { code: "CT-HEAD-CONTRAST", category: "radiology", description: "CT Head with Contrast",      unitPrice: 4200, taxable: true },
  { code: "CT-ABDOMEN",       category: "radiology", description: "CT Abdomen & Pelvis",        unitPrice: 5500, taxable: true },
  { code: "CT-CHEST-HRCT",    category: "radiology", description: "HRCT Chest",                 unitPrice: 4800, taxable: true },
  { code: "CT-ANGIO-CORONARY",category: "radiology", description: "CT Coronary Angiography",    unitPrice: 9500, taxable: true },

  // ── Radiology — MRI (matches radiology catalog exactly) ─────
  { code: "MR-BRAIN-PLAIN",    category: "radiology", description: "MRI Brain Plain",           unitPrice: 6500, taxable: true },
  { code: "MR-BRAIN-CONTRAST", category: "radiology", description: "MRI Brain with Contrast",  unitPrice: 9500, taxable: true },
  { code: "MR-LSPINE",         category: "radiology", description: "MRI Lumbar Spine",          unitPrice: 7200, taxable: true },
  { code: "MR-KNEE",           category: "radiology", description: "MRI Knee",                  unitPrice: 6800, taxable: true },
  { code: "MR-MRCP",           category: "radiology", description: "MRCP",                      unitPrice: 8500, taxable: true },

  // ── Radiology — Ultrasound (matches radiology catalog) ──────
  { code: "US-ABDOMEN",    category: "radiology", description: "USG Abdomen",                   unitPrice: 1200, taxable: true },
  { code: "US-PELVIS",     category: "radiology", description: "USG Pelvis",                    unitPrice: 1200, taxable: true },
  { code: "US-OBS",        category: "radiology", description: "USG Obstetric",                 unitPrice: 1400, taxable: true },
  { code: "US-THYROID",    category: "radiology", description: "USG Thyroid / Neck",            unitPrice: 1100, taxable: true },
  { code: "US-DOPPLER-LL", category: "radiology", description: "Doppler Lower Limb",            unitPrice: 2200, taxable: true },
  { code: "MG-BILATERAL",  category: "radiology", description: "Mammography Bilateral",         unitPrice: 2800, taxable: true },

  // ── Misc ────────────────────────────────────────────────────
  { code: "MISC-REG",  category: "misc", description: "Registration Fee",                       unitPrice: 150  },
  { code: "MISC-AMB",  category: "misc", description: "Ambulance — Local",                      unitPrice: 1800 },
  { code: "MISC-MORT", category: "misc", description: "Mortuary Charges — per day",             unitPrice: 500  },
];

export function catalogToOptions() {
  return chargeCatalog.map((c) => ({
    value: c.code,
    label: c.description,
    hint: `₹${c.unitPrice.toLocaleString('en-IN')}`,
  }));
}

export function findCatalog(code: string) {
  return chargeCatalog.find((c) => c.code === code);
}
