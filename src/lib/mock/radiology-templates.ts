import type { ReportTemplate } from "@/lib/types";

export const reportTemplates: ReportTemplate[] = [
  {
    id: "tpl-xr-chest",
    modality: "xray",
    name: "Chest X-Ray (PA)",
    sections: [
      { heading: "Technique", defaultText: "PA view of the chest obtained in full inspiration, erect position." },
      { heading: "Findings", defaultText: "Lung fields are clear. No focal consolidation, effusion or pneumothorax. Cardiac silhouette is normal in size and contour. Mediastinum is unremarkable. Both hila appear normal. Bony thorax is intact." },
      { heading: "Impression", defaultText: "Normal chest radiograph." },
      { heading: "Recommendations", defaultText: "Clinical correlation advised." },
    ],
  },
  {
    id: "tpl-ct-head",
    modality: "ct",
    name: "CT Head Plain",
    sections: [
      { heading: "Technique", defaultText: "Axial sections of 5 mm thickness obtained through the brain without IV contrast." },
      { heading: "Findings", defaultText: "Grey-white matter differentiation is preserved. No intra- or extra-axial haemorrhage. Ventricular system is normal in size, shape and position. No midline shift. Basal cisterns are patent. Visualised paranasal sinuses are clear." },
      { heading: "Impression", defaultText: "No acute intracranial abnormality." },
      { heading: "Recommendations", defaultText: "Correlate clinically; MRI if symptoms persist." },
    ],
  },
  {
    id: "tpl-ct-abdomen",
    modality: "ct",
    name: "CT Abdomen & Pelvis",
    sections: [
      { heading: "Technique", defaultText: "Axial sections obtained from dome of diaphragm to symphysis pubis with oral and IV contrast." },
      { heading: "Findings", defaultText: "Liver, gall bladder, spleen, pancreas, both kidneys and adrenals appear normal. No free fluid or lymphadenopathy. Bowel loops are unremarkable. Urinary bladder is partially distended and unremarkable." },
      { heading: "Impression", defaultText: "Unremarkable CT scan of the abdomen and pelvis." },
      { heading: "Recommendations", defaultText: "" },
    ],
  },
  {
    id: "tpl-mri-brain",
    modality: "mri",
    name: "MRI Brain Plain",
    sections: [
      { heading: "Technique", defaultText: "Multiplanar multisequence MRI of the brain performed including T1, T2, FLAIR, DWI and SWI sequences." },
      { heading: "Findings", defaultText: "No restricted diffusion. Normal grey-white matter signal. Ventricles and cisterns are normal. No mass, midline shift or abnormal enhancement. Posterior fossa structures are normal." },
      { heading: "Impression", defaultText: "Normal MRI of the brain." },
      { heading: "Recommendations", defaultText: "" },
    ],
  },
  {
    id: "tpl-us-abdomen",
    modality: "usg",
    name: "USG Abdomen",
    sections: [
      { heading: "Technique", defaultText: "Greyscale and colour Doppler evaluation of the abdomen performed." },
      { heading: "Findings", defaultText: "Liver normal in size and echotexture; no focal lesion. Gall bladder distended, walls thin, no calculi. CBD not dilated. Pancreas, spleen, both kidneys appear normal. No free fluid. Urinary bladder normal." },
      { heading: "Impression", defaultText: "Normal ultrasound of the abdomen." },
      { heading: "Recommendations", defaultText: "" },
    ],
  },
  {
    id: "tpl-us-obs",
    modality: "usg",
    name: "USG Obstetric",
    sections: [
      { heading: "Technique", defaultText: "Transabdominal ultrasound of the gravid uterus performed." },
      { heading: "Findings", defaultText: "Single live intrauterine gestation. Cardiac activity present. Placenta anterior, upper segment, Grade I. Adequate liquor. Estimated gestational age corresponds to clinical dates." },
      { heading: "Impression", defaultText: "Single live intrauterine pregnancy, age-appropriate." },
      { heading: "Recommendations", defaultText: "Routine antenatal follow-up." },
    ],
  },
];

export function templatesFor(modality: string) {
  return reportTemplates.filter((t) => t.modality === modality);
}

export function getTemplate(id: string) {
  return reportTemplates.find((t) => t.id === id);
}