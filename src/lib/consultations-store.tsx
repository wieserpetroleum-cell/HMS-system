import * as React from "react";
import type { Consultation } from "@/lib/types";

interface Ctx {
  consultations: Consultation[];
  addConsultation: (input: Omit<Consultation, "id" | "date" | "status">) => Consultation;
  getByAppointment: (appointmentId: string) => Consultation | undefined;
}

const ConsultationsContext = React.createContext<Ctx | null>(null);

export function ConsultationsProvider({ children }: { children: React.ReactNode }) {
  const [consultations, setConsultations] = React.useState<Consultation[]>([]);

  const addConsultation = React.useCallback<Ctx["addConsultation"]>((input) => {
    const consult: Consultation = {
      ...input,
      id: `c${Date.now()}`,
      date: new Date().toISOString(),
      status: "completed",
    };
    setConsultations((prev) => [consult, ...prev]);
    return consult;
  }, []);

  const getByAppointment = React.useCallback(
    (appointmentId: string) => consultations.find((c) => c.appointmentId === appointmentId),
    [consultations],
  );

  const value = React.useMemo(
    () => ({ consultations, addConsultation, getByAppointment }),
    [consultations, addConsultation, getByAppointment],
  );

  return <ConsultationsContext.Provider value={value}>{children}</ConsultationsContext.Provider>;
}

export function useConsultations() {
  const ctx = React.useContext(ConsultationsContext);
  if (!ctx) throw new Error("useConsultations must be used within ConsultationsProvider");
  return ctx;
}
