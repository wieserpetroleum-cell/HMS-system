export type Drug = {
  id: string;
  name: string;
  form: string;
  strength: string;
};

export const mockDrugs: Drug[] = [
  { id: "1", name: "Paracetamol", form: "Tablet", strength: "500mg" },
  { id: "2", name: "Amoxicillin", form: "Capsule", strength: "250mg" },
  { id: "3", name: "Ibuprofen", form: "Tablet", strength: "400mg" },
  { id: "4", name: "Metformin", form: "Tablet", strength: "500mg" },
  { id: "5", name: "Atorvastatin", form: "Tablet", strength: "10mg" },
  { id: "6", name: "Omeprazole", form: "Capsule", strength: "20mg" },
  { id: "7", name: "Amlodipine", form: "Tablet", strength: "5mg" },
  { id: "8", name: "Azithromycin", form: "Tablet", strength: "500mg" },
  { id: "9", name: "Cetirizine", form: "Tablet", strength: "10mg" },
  { id: "10", name: "Pantoprazole", form: "Tablet", strength: "40mg" },
];
