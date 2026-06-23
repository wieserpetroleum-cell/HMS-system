import * as React from "react";
import type {
  Admission,
  DischargeSummary,
  IntakeOutput,
  MarAdministration,
  MarEntry,
  MarStatus,
  NursingNote,
  RoundNote,
  VitalReading,
} from "@/lib/types";
import { mockBeds, setBedStatus, getBed } from "@/lib/mock/wards";

interface Ctx {
  admissions: Admission[];
  vitals: VitalReading[];
  notes: NursingNote[];
  rounds: RoundNote[];
  mar: MarEntry[];
  io: IntakeOutput[];
  addAdmission: (
    input: Omit<Admission, "id" | "admissionNo" | "admittedAt" | "status">,
  ) => Admission;
  transferBed: (admissionId: string, newBedId: string, reason: string, by: string) => void;
  discharge: (admissionId: string, summary: DischargeSummary) => void;
  getById: (id: string) => Admission | undefined;
  getByPatientUid: (uid: string) => Admission | undefined;
  addVital: (admissionId: string, v: Omit<VitalReading, "id" | "admissionId">) => void;
  addNote: (admissionId: string, n: Omit<NursingNote, "id" | "admissionId">) => void;
  addRound: (admissionId: string, r: Omit<RoundNote, "id" | "admissionId">) => void;
  addMarEntry: (admissionId: string, e: Omit<MarEntry, "id" | "admissionId">) => void;
  markMar: (entryId: string, slotIndex: number, status: MarStatus, by: string, note?: string) => void;
  addIo: (admissionId: string, i: Omit<IntakeOutput, "id" | "admissionId">) => void;
  markBedReady: (bedId: string) => void;
}

const AdmissionsContext = React.createContext<Ctx | null>(null);

function nextAdmissionNo(seq: number) {
  const y = new Date().getFullYear();
  return `IPD-${y}-${String(seq).padStart(4, "0")}`;
}

function makeSchedule(perDay: number, days: number, startHour = 8): MarAdministration[] {
  const out: MarAdministration[] = [];
  const stepH = Math.floor(24 / perDay);
  const base = new Date();
  base.setHours(startHour, 0, 0, 0);
  for (let d = 0; d < days; d++) {
    for (let i = 0; i < perDay; i++) {
      const t = new Date(base.getTime() + d * 86400000 + i * stepH * 3600000);
      out.push({ scheduledFor: t.toISOString(), status: "due" });
    }
  }
  return out;
}

// Seed: 4 active admissions tied to existing occupied beds (b1, b5, b7, b10)
function seed(): {
  admissions: Admission[];
  vitals: VitalReading[];
  notes: NursingNote[];
  rounds: RoundNote[];
  mar: MarEntry[];
  io: IntakeOutput[];
} {
  const now = Date.now();
  const iso = (offsetH: number) => new Date(now - offsetH * 3600000).toISOString();

  const seedBeds = [
    { bedId: "b1", patientUid: "MR-2024-00010", patientName: "Rajesh Verma", doctor: "Dr. Mehta", dept: "Cardiology", reason: "Acute coronary syndrome — observation", days: 2 },
    { bedId: "b5", patientUid: "MR-2024-00001", patientName: "Arjun Singh", doctor: "Dr. Iyer", dept: "General Medicine", reason: "Pyrexia of unknown origin", days: 3 },
    { bedId: "b7", patientUid: "MR-2024-00006", patientName: "Meera Nair", doctor: "Dr. Iyer", dept: "General Medicine", reason: "Community-acquired pneumonia", days: 1 },
    { bedId: "b10", patientUid: "MR-2024-00008", patientName: "Lakshmi Rao", doctor: "Dr. Khan", dept: "Orthopedics", reason: "Post-op femur fracture care", days: 4 },
  ];

  const admissions: Admission[] = seedBeds.map((s, i) => {
    const bed = mockBeds.find((b) => b.id === s.bedId)!;
    return {
      id: `adm${i + 1}`,
      admissionNo: nextAdmissionNo(i + 1),
      patientUid: s.patientUid,
      patientName: s.patientName,
      bedId: bed.id,
      ward: bed.ward,
      bedNumber: bed.bedNumber,
      primaryDoctor: s.doctor,
      department: s.dept,
      admittedAt: iso(s.days * 24),
      reason: s.reason,
      diet: i === 1 ? "Diabetic" : "Regular",
      status: "active",
    };
  });

  const vitals: VitalReading[] = admissions.flatMap((a) => {
    const arr: VitalReading[] = [];
    for (let h = 24; h >= 0; h -= 4) {
      arr.push({
        id: `${a.id}-v${h}`,
        admissionId: a.id,
        recordedAt: iso(h),
        recordedBy: "N. Patel",
        bp: `${110 + Math.round(Math.random() * 20)}/${70 + Math.round(Math.random() * 15)}`,
        pulse: 72 + Math.round(Math.random() * 18),
        temp: +(36.8 + Math.random() * 1.4).toFixed(1),
        spo2: 95 + Math.round(Math.random() * 4),
        respRate: 16 + Math.round(Math.random() * 6),
      });
    }
    return arr;
  });

  const notes: NursingNote[] = admissions.flatMap((a, i) => [
    { id: `${a.id}-n1`, admissionId: a.id, at: iso(6), by: "N. Patel", category: "observation", text: "Patient resting comfortably. No fresh complaints." },
    { id: `${a.id}-n2`, admissionId: a.id, at: iso(2 + i), by: "N. Patel", category: "medication", text: "IV antibiotics administered as charted." },
  ]);

  const rounds: RoundNote[] = admissions.map((a, i) => ({
    id: `${a.id}-r1`,
    admissionId: a.id,
    at: iso(8 + i),
    doctor: a.primaryDoctor,
    subjective: "Slept well, mild residual discomfort.",
    objective: "Afebrile, vitals stable. Chest clear.",
    assessment: a.reason,
    plan: "Continue current management. Review labs tomorrow.",
  }));

  const mar: MarEntry[] = admissions.flatMap((a) => [
    {
      id: `${a.id}-m1`,
      admissionId: a.id,
      drug: "Pantoprazole",
      strength: "40 mg",
      dose: "1 vial",
      route: "IV",
      frequencyLabel: "OD · 08:00",
      startedAt: a.admittedAt,
      schedule: (() => {
        const s = makeSchedule(1, 3, 8);
        // mark past ones as given
        return s.map((slot) =>
          new Date(slot.scheduledFor).getTime() < now
            ? { ...slot, status: "given", administeredAt: slot.scheduledFor, by: "N. Patel" }
            : slot,
        );
      })(),
    },
    {
      id: `${a.id}-m2`,
      admissionId: a.id,
      drug: "Paracetamol",
      strength: "1 g",
      dose: "1 tab",
      route: "PO",
      frequencyLabel: "TDS · 06/14/22",
      startedAt: a.admittedAt,
      schedule: makeSchedule(3, 3, 6).map((slot) =>
        new Date(slot.scheduledFor).getTime() < now
          ? { ...slot, status: "given", administeredAt: slot.scheduledFor, by: "N. Patel" }
          : slot,
      ),
    },
  ]);

  const io: IntakeOutput[] = admissions.flatMap((a) => [
    { id: `${a.id}-i1`, admissionId: a.id, at: iso(6), type: "intake", source: "Oral", volumeMl: 250, by: "N. Patel" },
    { id: `${a.id}-i2`, admissionId: a.id, at: iso(4), type: "intake", source: "IV", volumeMl: 500, by: "N. Patel" },
    { id: `${a.id}-i3`, admissionId: a.id, at: iso(3), type: "output", source: "Urine", volumeMl: 300, by: "N. Patel" },
  ]);

  return { admissions, vitals, notes, rounds, mar, io };
}

export function AdmissionsProvider({ children }: { children: React.ReactNode }) {
  const initial = React.useMemo(() => seed(), []);
  const [admissions, setAdmissions] = React.useState<Admission[]>(initial.admissions);
  const [vitals, setVitals] = React.useState<VitalReading[]>(initial.vitals);
  const [notes, setNotes] = React.useState<NursingNote[]>(initial.notes);
  const [rounds, setRounds] = React.useState<RoundNote[]>(initial.rounds);
  const [mar, setMar] = React.useState<MarEntry[]>(initial.mar);
  const [io, setIo] = React.useState<IntakeOutput[]>(initial.io);

  const addAdmission = React.useCallback<Ctx["addAdmission"]>(
    (input) => {
      const bed = getBed(input.bedId);
      const seq = admissions.length + 1;
      const adm: Admission = {
        ...input,
        id: `adm${Date.now()}`,
        admissionNo: nextAdmissionNo(seq),
        admittedAt: new Date().toISOString(),
        status: "active",
        ward: bed?.ward ?? input.ward,
        bedNumber: bed?.bedNumber ?? input.bedNumber,
      };
      setBedStatus(input.bedId, {
        status: "occupied",
        patientName: input.patientName,
        patientId: input.patientUid,
        alert: "stable",
      });
      setAdmissions((prev) => [adm, ...prev]);
      return adm;
    },
    [admissions.length],
  );

  const transferBed = React.useCallback<Ctx["transferBed"]>((admissionId, newBedId, reason, by) => {
    setAdmissions((prev) =>
      prev.map((a) => {
        if (a.id !== admissionId) return a;
        const newBed = getBed(newBedId);
        if (!newBed) return a;
        // Free old bed
        setBedStatus(a.bedId, { status: "cleaning", patientName: undefined, patientId: undefined, alert: undefined, vitalsDue: false });
        // Occupy new bed
        setBedStatus(newBedId, { status: "occupied", patientName: a.patientName, patientId: a.patientUid, alert: "stable" });
        return { ...a, bedId: newBedId, ward: newBed.ward, bedNumber: newBed.bedNumber };
      }),
    );
    setNotes((prev) => [
      {
        id: `n${Date.now()}`,
        admissionId,
        at: new Date().toISOString(),
        by,
        category: "handover",
        text: `Transferred to ${getBed(newBedId)?.bedNumber ?? newBedId}. Reason: ${reason}`,
      },
      ...prev,
    ]);
  }, []);

  const discharge = React.useCallback<Ctx["discharge"]>((admissionId, summary) => {
    setAdmissions((prev) =>
      prev.map((a) => {
        if (a.id !== admissionId) return a;
        setBedStatus(a.bedId, { status: "cleaning", patientName: undefined, patientId: undefined, alert: undefined, vitalsDue: false });
        return { ...a, status: "discharged", dischargedAt: new Date().toISOString(), dischargeSummary: summary };
      }),
    );
  }, []);

  const getById = React.useCallback((id: string) => admissions.find((a) => a.id === id), [admissions]);
  const getByPatientUid = React.useCallback(
    (uid: string) => admissions.find((a) => a.patientUid === uid && a.status === "active"),
    [admissions],
  );

  const addVital = React.useCallback<Ctx["addVital"]>((admissionId, v) => {
    setVitals((prev) => [{ ...v, id: `v${Date.now()}`, admissionId }, ...prev]);
  }, []);
  const addNote = React.useCallback<Ctx["addNote"]>((admissionId, n) => {
    setNotes((prev) => [{ ...n, id: `n${Date.now()}`, admissionId }, ...prev]);
  }, []);
  const addRound = React.useCallback<Ctx["addRound"]>((admissionId, r) => {
    setRounds((prev) => [{ ...r, id: `r${Date.now()}`, admissionId }, ...prev]);
  }, []);
  const addMarEntry = React.useCallback<Ctx["addMarEntry"]>((admissionId, e) => {
    setMar((prev) => [...prev, { ...e, id: `m${Date.now()}`, admissionId }]);
  }, []);
  const markMar = React.useCallback<Ctx["markMar"]>((entryId, slotIndex, status, by, note) => {
    setMar((prev) =>
      prev.map((m) => {
        if (m.id !== entryId) return m;
        const schedule = m.schedule.map((slot, i) =>
          i === slotIndex
            ? { ...slot, status, administeredAt: new Date().toISOString(), by, note }
            : slot,
        );
        return { ...m, schedule };
      }),
    );
  }, []);
  const addIo = React.useCallback<Ctx["addIo"]>((admissionId, i) => {
    setIo((prev) => [{ ...i, id: `io${Date.now()}`, admissionId }, ...prev]);
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({
      admissions, vitals, notes, rounds, mar, io,
      addAdmission, transferBed, discharge, getById, getByPatientUid,
      addVital, addNote, addRound, addMarEntry, markMar, addIo,
      markBedReady: (bedId: string) => {
        setBedStatus(bedId, { status: "available", patientName: undefined, patientId: undefined, alert: undefined, vitalsDue: false });
      },
    }),
    [admissions, vitals, notes, rounds, mar, io, addAdmission, transferBed, discharge, getById, getByPatientUid, addVital, addNote, addRound, addMarEntry, markMar, addIo],
  );

  return <AdmissionsContext.Provider value={value}>{children}</AdmissionsContext.Provider>;
}

export function useAdmissions() {
  const ctx = React.useContext(AdmissionsContext);
  if (!ctx) throw new Error("useAdmissions must be used within AdmissionsProvider");
  return ctx;
}