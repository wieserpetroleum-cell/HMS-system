import type { Appointment } from "@/lib/types";

export const mockAppointments: Appointment[] = [
  { id: "a1", patientId: "p1", patientName: "Arjun Singh", doctor: "Dr. Mehta", department: "Cardiology", room: "C-204", time: "09:00", status: "completed", type: "Follow-up" },
  { id: "a2", patientId: "p2", patientName: "Priya Sharma", doctor: "Dr. Mehta", department: "Cardiology", room: "C-204", time: "09:30", status: "in-consultation", type: "OPD" },
  { id: "a3", patientId: "p3", patientName: "Ravi Kumar", doctor: "Dr. Iyer", department: "General Medicine", room: "G-101", time: "10:00", status: "checked-in", type: "OPD" },
  { id: "a4", patientId: "p4", patientName: "Anita Desai", doctor: "Dr. Iyer", department: "General Medicine", room: "G-101", time: "10:15", status: "checked-in", type: "Walk-in" },
  { id: "a5", patientId: "p5", patientName: "Sanjay Patel", doctor: "Dr. Khan", department: "Orthopedics", room: "O-302", time: "10:45", status: "scheduled", type: "OPD" },
  { id: "a6", patientId: "p6", patientName: "Meera Nair", doctor: "Dr. Mehta", department: "Cardiology", room: "C-204", time: "11:00", status: "scheduled", type: "OPD" },
  { id: "a7", patientId: "p7", patientName: "Vikram Joshi", doctor: "Dr. Khan", department: "Orthopedics", room: "O-302", time: "11:30", status: "scheduled", type: "Follow-up" },
  { id: "a8", patientId: "p8", patientName: "Lakshmi Rao", doctor: "Dr. Iyer", department: "General Medicine", room: "G-101", time: "12:00", status: "scheduled", type: "OPD" },
];