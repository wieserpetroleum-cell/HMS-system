export interface DiagnosisMock {
  code: string;
  text: string;
}

export const mockDiagnoses: DiagnosisMock[] = [
  { code: "I10", text: "Essential (primary) hypertension" },
  { code: "E11.9", text: "Type 2 diabetes mellitus without complications" },
  { code: "E78.5", text: "Hyperlipidemia, unspecified" },
  { code: "J45.909", text: "Asthma, unspecified, uncomplicated" },
  { code: "J06.9", text: "Acute upper respiratory infection, unspecified" },
  { code: "J20.9", text: "Acute bronchitis, unspecified" },
  { code: "J18.9", text: "Pneumonia, unspecified organism" },
  { code: "K21.9", text: "Gastro-esophageal reflux disease without esophagitis" },
  { code: "K29.70", text: "Gastritis, unspecified, without bleeding" },
  { code: "K59.00", text: "Constipation, unspecified" },
  { code: "A09", text: "Infectious gastroenteritis and colitis, unspecified" },
  { code: "R51", text: "Headache" },
  { code: "G43.909", text: "Migraine, unspecified, not intractable" },
  { code: "M54.5", text: "Low back pain" },
  { code: "M25.561", text: "Pain in right knee" },
  { code: "N39.0", text: "Urinary tract infection, site not specified" },
  { code: "B34.9", text: "Viral infection, unspecified" },
  { code: "L29.9", text: "Pruritus, unspecified" },
  { code: "H10.9", text: "Conjunctivitis, unspecified" },
  { code: "F41.9", text: "Anxiety disorder, unspecified" },
];
