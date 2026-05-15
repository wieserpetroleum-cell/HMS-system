import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { PatientsProvider } from "@/lib/patients-store";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <AuthProvider>
      <PatientsProvider>
        <Outlet />
        <Toaster position="top-right" />
      </PatientsProvider>
    </AuthProvider>
  );
}
