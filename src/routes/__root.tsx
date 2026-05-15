import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { PatientsProvider } from "@/lib/patients-store";
import { AppointmentsProvider } from "@/lib/appointments-store";
import { ConsultationsProvider } from "@/lib/consultations-store";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <AuthProvider>
      <PatientsProvider>
        <AppointmentsProvider>
          <ConsultationsProvider>
            <Outlet />
            <Toaster position="top-right" />
          </ConsultationsProvider>
        </AppointmentsProvider>
      </PatientsProvider>
    </AuthProvider>
  );
}
