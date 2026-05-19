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
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';

// Dashboard
import AdminDashboard from '@/routes/_authenticated/dashboard.index';
import DoctorDashboard from '@/routes/_authenticated/dashboard.doctor';
import NurseDashboard from '@/routes/_authenticated/dashboard.nurse';
import ReceptionDashboard from '@/routes/_authenticated/dashboard.reception';
import BillingDashboardPage from '@/routes/_authenticated/dashboard.billing';
import TpaDashboard from '@/routes/_authenticated/dashboard.tpa';
import RadiologistDashboard from '@/routes/_authenticated/dashboard.radiologist';
import RadtechDashboard from '@/routes/_authenticated/dashboard.radtech';

// Patients
import PatientRegistry from '@/routes/_authenticated/patients.index';
import RegisterPatient from '@/routes/_authenticated/patients.register';
import PatientProfile from '@/routes/_authenticated/patients.$uid';

// Appointments
import AppointmentsQueue from '@/routes/_authenticated/appointments.index';
import NewAppointment from '@/routes/_authenticated/appointments.new';

// Consultations
import ConsultationWorkspace from '@/routes/_authenticated/consultations.$appointmentId.index';
import PrescriptionPreview from '@/routes/_authenticated/consultations.$appointmentId.prescription';

// IPD
import FloorView from '@/routes/_authenticated/ipd.index';
import AdmitPatient from '@/routes/_authenticated/ipd.admit';
import WardChart from '@/routes/_authenticated/ipd.$admissionId.index';
import DischargePage from '@/routes/_authenticated/ipd.$admissionId.discharge';
import TransferBed from '@/routes/_authenticated/ipd.$admissionId.transfer';

// Billing
import BillingDashboard from '@/routes/_authenticated/billing.index';
import InvoicesList from '@/routes/_authenticated/billing.invoices.index';
import NewInvoice from '@/routes/_authenticated/billing.invoices.new';
import InvoiceWorkspace from '@/routes/_authenticated/billing.invoices.$id';
import TpaQueue from '@/routes/_authenticated/billing.tpa';

// Radiology
import RadiologyDashboard from '@/routes/_authenticated/radiology.index';
import NewRadiologyOrder from '@/routes/_authenticated/radiology.orders.new';
import StudyWorkspace from '@/routes/_authenticated/radiology.studies.$id';
import ReportView from '@/routes/_authenticated/radiology.studies.$id.report';
import Worklist from '@/routes/_authenticated/radiology.worklist';

// Notifications
import NotificationLogPage from '@/routes/_authenticated/notifications.log';
import TemplateManagerPage from '@/routes/_authenticated/notifications.templates';

// Admin
import AuditPage from '@/routes/_authenticated/admin.audit';
import BedsPage from '@/routes/_authenticated/admin.beds';
import DeptDoctorsPage from '@/routes/_authenticated/admin.departments';
import HospitalProfilePage from '@/routes/_authenticated/admin.hospital';
import RatesPage from '@/routes/_authenticated/admin.rates';
import ServicesPage from '@/routes/_authenticated/admin.services';
import UsersPage from '@/routes/_authenticated/admin.users';
import AdminLayout from '@/routes/_authenticated/admin';
import AdminIndex from '@/routes/_authenticated/admin.index';

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

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
        <Route path="/dashboard/nurse" element={<NurseDashboard />} />
        <Route path="/dashboard/reception" element={<ReceptionDashboard />} />
        <Route path="/dashboard/billing" element={<BillingDashboardPage />} />
        <Route path="/dashboard/tpa" element={<TpaDashboard />} />
        <Route path="/dashboard/radiologist" element={<RadiologistDashboard />} />
        <Route path="/dashboard/radtech" element={<RadtechDashboard />} />

        {/* Patients */}
        <Route path="/patients" element={<PatientRegistry />} />
        <Route path="/patients/register" element={<RegisterPatient />} />
        <Route path="/patients/:uid" element={<PatientProfile />} />

        {/* Appointments */}
        <Route path="/appointments" element={<AppointmentsQueue />} />
        <Route path="/appointments/new" element={<NewAppointment />} />

        {/* Consultations */}
        <Route path="/consultations/:appointmentId" element={<ConsultationWorkspace />} />
        <Route path="/consultations/:appointmentId/prescription" element={<PrescriptionPreview />} />

        {/* IPD */}
        <Route path="/ipd" element={<FloorView />} />
        <Route path="/ipd/admit" element={<AdmitPatient />} />
        <Route path="/ipd/:admissionId" element={<WardChart />} />
        <Route path="/ipd/:admissionId/discharge" element={<DischargePage />} />
        <Route path="/ipd/:admissionId/transfer" element={<TransferBed />} />

        {/* Billing */}
        <Route path="/billing" element={<BillingDashboard />} />
        <Route path="/billing/invoices" element={<InvoicesList />} />
        <Route path="/billing/invoices/new" element={<NewInvoice />} />
        <Route path="/billing/invoices/:id" element={<InvoiceWorkspace />} />
        <Route path="/billing/tpa" element={<TpaQueue />} />

        {/* Radiology */}
        <Route path="/radiology" element={<RadiologyDashboard />} />
        <Route path="/radiology/orders/new" element={<NewRadiologyOrder />} />
        <Route path="/radiology/studies/:id" element={<StudyWorkspace />} />
        <Route path="/radiology/studies/:id/report" element={<ReportView />} />
        <Route path="/radiology/worklist" element={<Worklist />} />

        {/* Notifications */}
        <Route path="/notifications" element={<NotificationLogPage />} />
        <Route path="/notifications/log" element={<NotificationLogPage />} />
        <Route path="/notifications/templates" element={<TemplateManagerPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminIndex />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="beds" element={<BedsPage />} />
          <Route path="departments" element={<DeptDoctorsPage />} />
          <Route path="hospital" element={<HospitalProfilePage />} />
          <Route path="rates" element={<RatesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="mt-2 text-muted-foreground">Page not found</p>
            <a href="/dashboard" className="mt-4 inline-block text-primary hover:underline">Go to Dashboard</a>
          </div>
        </div>
      } />
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
