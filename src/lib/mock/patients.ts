import type { Patient } from "@/lib/types";

export const mockPatients: Patient[] = [
  { id: "p1",  uid: "MCI-2024-00001", name: "Arjun Singh",   sex: "M", age: "45y 4m",  dob: "1978-02-14", mobile: "9876543210", blood: "B+", allergies: ["Penicillin"], conditions: ["Type 2 Diabetes"] },
  { id: "p2",  uid: "MCI-2024-00002", name: "Priya Sharma",  sex: "F", age: "32y 1m",  dob: "1992-05-20", mobile: "9876543211", blood: "A+", allergies: [], conditions: ["Hypertension"] },
  { id: "p3",  uid: "MCI-2024-00003", name: "Ravi Kumar",    sex: "M", age: "28y 7m",  dob: "1995-11-03", mobile: "9876543212", blood: "O+", allergies: ["Sulfa"], conditions: [] },
  { id: "p4",  uid: "MCI-2024-00004", name: "Anita Desai",   sex: "F", age: "55y 3m",  dob: "1968-03-18", mobile: "9876543213", blood: "AB+", allergies: [], conditions: ["Arthritis", "Hypothyroid"] },
  { id: "p5",  uid: "MCI-2024-00005", name: "Sanjay Patel",  sex: "M", age: "41y 9m",  dob: "1982-09-07", mobile: "9876543214", blood: "O-", allergies: ["Aspirin"], conditions: ["Asthma"] },
  { id: "p6",  uid: "MCI-2024-00006", name: "Meera Nair",    sex: "F", age: "36y 2m",  dob: "1988-04-12", mobile: "9876543215", blood: "B+", allergies: [], conditions: [] },
  { id: "p7",  uid: "MCI-2024-00007", name: "Vikram Joshi",  sex: "M", age: "62y 5m",  dob: "1961-01-25", mobile: "9876543216", blood: "A-", allergies: ["Codeine"], conditions: ["Diabetes", "CKD"] },
  { id: "p8",  uid: "MCI-2024-00008", name: "Lakshmi Rao",   sex: "F", age: "48y 8m",  dob: "1975-10-30", mobile: "9876543217", blood: "O+", allergies: [], conditions: ["Hypertension"] },
  { id: "p9",  uid: "MCI-2024-00009", name: "Rahul Sharma",  sex: "M", age: "8y 3m",   dob: "2016-03-15", mobile: "9876543218", blood: "B+", allergies: [], conditions: [] },
  { id: "p10", uid: "MCI-2024-00010", name: "Sunita Verma",  sex: "F", age: "29y 6m",  dob: "1994-12-05", mobile: "9876543219", blood: "A+", allergies: [], conditions: [] },
];
