import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { PatientsProvider } from '@/lib/patients-store';
import { AppointmentsProvider } from '@/lib/appointments-store';
import { ConsultationsProvider } from '@/lib/consultations-store';
import { AdmissionsProvider } from '@/lib/admissions-store';
import { InvoicesProvider } from '@/lib/invoices-store';
import { RadiologyProvider } from '@/lib/radiology-store';
import { NotificationsProvider } from '@/lib/notifications-store';
import { AdminProvider } from '@/lib/admin-store';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, dashboardRoute } = useAuth();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={dashboardRoute} replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<div className="flex min-h-screen items-center justify-center bg-background"><div className="text-center"><h1 className="text-4xl font-bold">404</h1><p className="mt-2 text-muted-foreground">Page not found</p></div></div>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PatientsProvider>
          <AppointmentsProvider>
            <ConsultationsProvider>
              <AdmissionsProvider>
                <InvoicesProvider>
                  <RadiologyProvider>
                    <NotificationsProvider>
                      <AdminProvider>
                        <AppRoutes />
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
    </BrowserRouter>
  );
}
