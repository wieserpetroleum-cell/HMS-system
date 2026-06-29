import * as React from "react";
import type { Patient } from "@/lib/types";
import { mockPatients } from "@/lib/mock/patients";
import { generateUid } from "@/lib/age";

interface PatientsContextValue {
  patients: Patient[];
  addPatient: (input: Omit<Patient, "id" | "uid" | "registeredAt">) => Patient;
  updatePatient: (uid: string, input: Partial<Omit<Patient, "id" | "uid">>) => Patient | undefined;
  getPatient: (uid: string) => Patient | undefined;
  nextUid: () => string;
}

const PatientsContext = React.createContext<PatientsContextValue | null>(null);

export function PatientsProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = React.useState<Patient[]>(mockPatients);

  const nextUid = React.useCallback(
    () => generateUid(patients.length + 1),
    [patients.length],
  );

  const addPatient = React.useCallback<PatientsContextValue["addPatient"]>(
    (input) => {
      const uid = generateUid(patients.length + 1);
      const id = `p${Date.now()}`;
      const patient: Patient = { ...input, id, uid, registeredAt: new Date().toISOString() };
      setPatients((prev) => [patient, ...prev]);
      return patient;
    },
    [patients.length],
  );

  const updatePatient = React.useCallback(
    (uid: string, input: Partial<Omit<Patient, "id" | "uid">>) => {
      let updated: Patient | undefined;
      setPatients((prev) => prev.map((p) => {
        if (p.uid !== uid) return p;
        updated = { ...p, ...input };
        return updated;
      }));
      return updated;
    },
    [],
  );

  const getPatient = React.useCallback(
    (uid: string) => patients.find((p) => p.uid === uid),
    [patients],
  );

  const value = React.useMemo(
    () => ({ patients, addPatient, updatePatient, getPatient, nextUid }),
    [patients, addPatient, updatePatient, getPatient, nextUid],
  );

  return <PatientsContext.Provider value={value}>{children}</PatientsContext.Provider>;
}

export function usePatients() {
  const ctx = React.useContext(PatientsContext);
  if (!ctx) throw new Error("usePatients must be used within PatientsProvider");
  return ctx;
}
