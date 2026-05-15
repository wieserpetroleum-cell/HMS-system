import type { StaffMember } from "@/lib/types";

export const mockStaff: StaffMember[] = [
  { id: "s1", name: "Dr. Aarav Mehta", role: "doctor", department: "Cardiology", onShift: true, shift: "08:00 — 16:00" },
  { id: "s2", name: "Dr. Suresh Iyer", role: "doctor", department: "General Medicine", onShift: true, shift: "08:00 — 16:00" },
  { id: "s3", name: "Dr. Naseem Khan", role: "doctor", department: "Orthopedics", onShift: true, shift: "10:00 — 18:00" },
  { id: "s4", name: "Nurse Kavya Pillai", role: "nurse", department: "ICU", onShift: true, shift: "08:00 — 20:00" },
  { id: "s5", name: "Nurse Reema Das", role: "nurse", department: "General A", onShift: true, shift: "08:00 — 20:00" },
  { id: "s6", name: "Nurse Aisha Banu", role: "nurse", department: "Pediatric", onShift: false },
  { id: "s7", name: "Riya Kapoor", role: "receptionist", department: "Front Desk", onShift: true, shift: "09:00 — 17:00" },
];