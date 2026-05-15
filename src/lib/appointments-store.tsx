import * as React from "react";
import type { Appointment, AppointmentStatus } from "@/lib/types";
import { mockAppointments } from "@/lib/mock/appointments";

interface Ctx {
  appointments: Appointment[];
  addAppointment: (input: Omit<Appointment, "id">) => Appointment;
  updateStatus: (id: string, status: AppointmentStatus) => void;
  getById: (id: string) => Appointment | undefined;
}

const AppointmentsContext = React.createContext<Ctx | null>(null);

export function AppointmentsProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = React.useState<Appointment[]>(mockAppointments);

  const addAppointment = React.useCallback<Ctx["addAppointment"]>((input) => {
    const appt: Appointment = { ...input, id: `a${Date.now()}` };
    setAppointments((prev) => [appt, ...prev]);
    return appt;
  }, []);

  const updateStatus = React.useCallback((id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const getById = React.useCallback(
    (id: string) => appointments.find((a) => a.id === id),
    [appointments],
  );

  const value = React.useMemo(
    () => ({ appointments, addAppointment, updateStatus, getById }),
    [appointments, addAppointment, updateStatus, getById],
  );

  return <AppointmentsContext.Provider value={value}>{children}</AppointmentsContext.Provider>;
}

export function useAppointments() {
  const ctx = React.useContext(AppointmentsContext);
  if (!ctx) throw new Error("useAppointments must be used within AppointmentsProvider");
  return ctx;
}
