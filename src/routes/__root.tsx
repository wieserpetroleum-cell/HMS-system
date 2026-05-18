import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { PatientsProvider } from "@/lib/patients-store";
import { AppointmentsProvider } from "@/lib/appointments-store";
import { ConsultationsProvider } from "@/lib/consultations-store";
import { AdmissionsProvider } from "@/lib/admissions-store";
import { InvoicesProvider } from "@/lib/invoices-store";
import { RadiologyProvider } from "@/lib/radiology-store";
import { NotificationsProvider } from "@/lib/notifications-store";
import { AdminProvider } from "@/lib/admin-store";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
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
                  <NotificationsProvider>
                    <AdminProvider>
                      <Outlet />
                      <Toaster position="top-right" />
                    </AdminProvider>
                  </NotificationsProvider>
                </RadiologyProvider>
              </InvoicesProvider>
            </AdmissionsProvider>
          </ConsultationsProvider>
        </AppointmentsProvider>
      </PatientsProvider>
    </AuthProvider>
  );
}
