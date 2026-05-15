import type { WardBed } from "@/lib/types";

export const mockBeds: WardBed[] = [
  { id: "b1", ward: "ICU", bedNumber: "ICU-01", status: "occupied", patientName: "R. Verma", patientId: "p10", vitalsDue: true, alert: "critical" },
  { id: "b2", ward: "ICU", bedNumber: "ICU-02", status: "occupied", patientName: "S. Khan", patientId: "p11", vitalsDue: false, alert: "watch" },
  { id: "b3", ward: "ICU", bedNumber: "ICU-03", status: "available" },
  { id: "b4", ward: "ICU", bedNumber: "ICU-04", status: "cleaning" },
  { id: "b5", ward: "General A", bedNumber: "GA-01", status: "occupied", patientName: "A. Singh", patientId: "p1", vitalsDue: true, alert: "stable" },
  { id: "b6", ward: "General A", bedNumber: "GA-02", status: "occupied", patientName: "P. Sharma", patientId: "p2", vitalsDue: false, alert: "stable" },
  { id: "b7", ward: "General A", bedNumber: "GA-03", status: "occupied", patientName: "M. Nair", patientId: "p6", vitalsDue: true, alert: "watch" },
  { id: "b8", ward: "General A", bedNumber: "GA-04", status: "available" },
  { id: "b9", ward: "General A", bedNumber: "GA-05", status: "reserved" },
  { id: "b10", ward: "General B", bedNumber: "GB-01", status: "occupied", patientName: "L. Rao", patientId: "p8", vitalsDue: false, alert: "stable" },
  { id: "b11", ward: "General B", bedNumber: "GB-02", status: "available" },
  { id: "b12", ward: "General B", bedNumber: "GB-03", status: "occupied", patientName: "V. Joshi", patientId: "p7", vitalsDue: true, alert: "stable" },
  { id: "b13", ward: "Pediatric", bedNumber: "PD-01", status: "occupied", patientName: "K. Bose", patientId: "p12", vitalsDue: false, alert: "stable" },
  { id: "b14", ward: "Pediatric", bedNumber: "PD-02", status: "available" },
  { id: "b15", ward: "Pediatric", bedNumber: "PD-03", status: "available" },
];

export function wardSummary() {
  const total = mockBeds.length;
  const occupied = mockBeds.filter((b) => b.status === "occupied").length;
  const available = mockBeds.filter((b) => b.status === "available").length;
  return { total, occupied, available, occupancyPct: Math.round((occupied / total) * 100) };
}

export function bedsByWard() {
  const map = new Map<string, WardBed[]>();
  for (const b of mockBeds) {
    if (!map.has(b.ward)) map.set(b.ward, []);
    map.get(b.ward)!.push(b);
  }
  return Array.from(map.entries()).map(([ward, beds]) => ({
    ward,
    beds,
    total: beds.length,
    occupied: beds.filter((b) => b.status === "occupied").length,
    available: beds.filter((b) => b.status === "available").length,
  }));
}