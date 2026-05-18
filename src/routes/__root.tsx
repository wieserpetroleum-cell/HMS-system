import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { PatientsProvider } from "@/lib/patients-store";
import { AppointmentsProvider } from "@/lib/appointments-store";
import { ConsultationsProvider } from "@/lib/consultations-store";
import { AdmissionsProvider } from "@/lib/admissions-store";
import { InvoicesProvider } from "@/lib/invoices-store";
import { RadiologyProvider } from "@/lib/radiology-store";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <AuthProvider>
      <PatientsProvider>
        <AppointmentsProvider>
          <ConsultationsProvider>
            <AdmissionsProvider>
              <InvoicesProvider>
                <RadiologyProvider>
                  <Outlet />
                  <Toaster position="top-right" />
                </RadiologyProvider>
              </InvoicesProvider>
            </AdmissionsProvider>
          </ConsultationsProvider>
        </AppointmentsProvider>
      </PatientsProvider>
    </AuthProvider>
  );
}
