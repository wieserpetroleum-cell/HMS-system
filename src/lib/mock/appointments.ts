import type { Appointment } from "@/lib/types";

const today = new Date().toISOString().slice(0, 10);

export const mockAppointments: Appointment[] = [
  { id: "a1",  patientId: "p1",  patientUid: "MCI-2024-00001", patientName: "Arjun Singh",   doctor: "Dr. Mehta",  department: "Cardiology",       room: "C-204", time: "09:00", status: "completed",       type: "Follow-up", date: today, complaint: "Chest pain follow-up" },
  { id: "a2",  patientId: "p2",  patientUid: "MCI-2024-00002", patientName: "Priya Sharma",  doctor: "Dr. Mehta",  department: "Cardiology",       room: "C-204", time: "09:30", status: "in-consultation", type: "OPD",       date: today, complaint: "Shortness of breath" },
  { id: "a3",  patientId: "p3",  patientUid: "MCI-2024-00003", patientName: "Ravi Kumar",    doctor: "Dr. Iyer",   department: "General Medicine", room: "G-101", time: "10:00", status: "checked-in",     type: "OPD",       date: today, complaint: "Fever for 3 days" },
  { id: "a4",  patientId: "p4",  patientUid: "MCI-2024-00004", patientName: "Anita Desai",   doctor: "Dr. Iyer",   department: "General Medicine", room: "G-101", time: "10:15", status: "checked-in",     type: "Walk-in",   date: today, complaint: "Headache and vomiting" },
  { id: "a5",  patientId: "p5",  patientUid: "MCI-2024-00005", patientName: "Sanjay Patel",  doctor: "Dr. Khan",   department: "Orthopedics",      room: "O-302", time: "10:45", status: "scheduled",      type: "OPD",       date: today, complaint: "Lower back pain" },
  { id: "a6",  patientId: "p6",  patientUid: "MCI-2024-00006", patientName: "Meera Nair",    doctor: "Dr. Mehta",  department: "Cardiology",       room: "C-204", time: "11:00", status: "scheduled",      type: "OPD",       date: today, complaint: "Palpitations" },
  { id: "a7",  patientId: "p7",  patientUid: "MCI-2024-00007", patientName: "Vikram Joshi",  doctor: "Dr. Khan",   department: "Orthopedics",      room: "O-302", time: "11:30", status: "scheduled",      type: "Follow-up", date: today, complaint: "Knee pain review" },
  { id: "a8",  patientId: "p8",  patientUid: "MCI-2024-00008", patientName: "Lakshmi Rao",   doctor: "Dr. Iyer",   department: "General Medicine", room: "G-101", time: "12:00", status: "scheduled",      type: "OPD",       date: today, complaint: "Diabetes checkup" },
  { id: "a9",  patientId: "p9",  patientUid: "MCI-2024-00009", patientName: "Rahul Sharma",  doctor: "Dr. Sharma", department: "Pediatrics",       room: "P-110", time: "12:30", status: "scheduled",      type: "OPD",       date: today, complaint: "Child fever" },
  { id: "a10", patientId: "p10", patientUid: "MCI-2024-00010", patientName: "Sunita Verma",  doctor: "Dr. Sharma", department: "Pediatrics",       room: "P-110", time: "13:00", status: "scheduled",      type: "Walk-in",   date: today, complaint: "Vaccination" },
];
