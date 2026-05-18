import type { Modality } from "@/lib/types";

export interface StudyCatalogEntry {
  code: string;
  modality: Modality;
  name: string;
  bodyPart: string;
  tariff: number;
  targetTatMin: number;
}

export const studyCatalog: StudyCatalogEntry[] = [
  // X-Ray
  { code: "XR-CHEST-PA", modality: "xray", name: "X-Ray Chest PA", bodyPart: "Chest", tariff: 450, targetTatMin: 60 },
  { code: "XR-CHEST-LAT", modality: "xray", name: "X-Ray Chest Lateral", bodyPart: "Chest", tariff: 450, targetTatMin: 60 },
  { code: "XR-KNEE-AP", modality: "xray", name: "X-Ray Knee AP/Lateral", bodyPart: "Knee", tariff: 550, targetTatMin: 60 },
  { code: "XR-LSPINE", modality: "xray", name: "X-Ray Lumbar Spine", bodyPart: "Lumbar Spine", tariff: 700, targetTatMin: 60 },
  { code: "XR-WRIST", modality: "xray", name: "X-Ray Wrist", bodyPart: "Wrist", tariff: 500, targetTatMin: 60 },
  { code: "XR-PELVIS", modality: "xray", name: "X-Ray Pelvis", bodyPart: "Pelvis", tariff: 600, targetTatMin: 60 },
  // CT
  { code: "CT-HEAD-PLAIN", modality: "ct", name: "CT Head Plain", bodyPart: "Head", tariff: 2800, targetTatMin: 90 },
  { code: "CT-HEAD-CONTRAST", modality: "ct", name: "CT Head with Contrast", bodyPart: "Head", tariff: 4200, targetTatMin: 120 },
  { code: "CT-ABDOMEN", modality: "ct", name: "CT Abdomen & Pelvis", bodyPart: "Abdomen", tariff: 5500, targetTatMin: 120 },
  { code: "CT-CHEST-HRCT", modality: "ct", name: "HRCT Chest", bodyPart: "Chest", tariff: 4800, targetTatMin: 120 },
  { code: "CT-ANGIO-CORONARY", modality: "ct", name: "CT Coronary Angiography", bodyPart: "Heart", tariff: 9500, targetTatMin: 180 },
  // MRI
  { code: "MR-BRAIN-PLAIN", modality: "mri", name: "MRI Brain Plain", bodyPart: "Brain", tariff: 6500, targetTatMin: 180 },
  { code: "MR-BRAIN-CONTRAST", modality: "mri", name: "MRI Brain with Contrast", bodyPart: "Brain", tariff: 9500, targetTatMin: 240 },
  { code: "MR-LSPINE", modality: "mri", name: "MRI Lumbar Spine", bodyPart: "Lumbar Spine", tariff: 7200, targetTatMin: 180 },
  { code: "MR-KNEE", modality: "mri", name: "MRI Knee", bodyPart: "Knee", tariff: 6800, targetTatMin: 180 },
  { code: "MR-MRCP", modality: "mri", name: "MRCP", bodyPart: "Abdomen", tariff: 8500, targetTatMin: 240 },
  // USG
  { code: "US-ABDOMEN", modality: "usg", name: "USG Abdomen", bodyPart: "Abdomen", tariff: 1200, targetTatMin: 60 },
  { code: "US-PELVIS", modality: "usg", name: "USG Pelvis", bodyPart: "Pelvis", tariff: 1200, targetTatMin: 60 },
  { code: "US-OBS", modality: "usg", name: "USG Obstetric", bodyPart: "Pelvis", tariff: 1400, targetTatMin: 60 },
  { code: "US-THYROID", modality: "usg", name: "USG Thyroid / Neck", bodyPart: "Neck", tariff: 1100, targetTatMin: 60 },
  { code: "US-DOPPLER-LL", modality: "usg", name: "Doppler Lower Limb", bodyPart: "Lower Limb", tariff: 2200, targetTatMin: 90 },
  // Mammo / Dexa
  { code: "MG-BILATERAL", modality: "mammo", name: "Mammography Bilateral", bodyPart: "Breast", tariff: 2800, targetTatMin: 120 },
  { code: "DX-WHOLE-BODY", modality: "dexa", name: "DEXA Whole Body", bodyPart: "Whole Body", tariff: 2500, targetTatMin: 120 },
  { code: "DX-HIP-SPINE", modality: "dexa", name: "DEXA Hip & Spine", bodyPart: "Hip/Spine", tariff: 2200, targetTatMin: 120 },
];

export const modalityLabels: Record<Modality, string> = {
  xray: "X-Ray",
  ct: "CT",
  mri: "MRI",
  usg: "Ultrasound",
  mammo: "Mammography",
  dexa: "DEXA",
};

export function findStudy(code: string) {
  return studyCatalog.find((s) => s.code === code);
}