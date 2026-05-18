import { useAuth } from "@/lib/auth-context";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🎉 Welcome to Hospitrix!</h1>
        <p className="text-xl">Logged in as: <span className="font-semibold">{user.name}</span></p>
        <p className="text-muted-foreground">Role: {user.role}</p>
        <div className="mt-8 p-6 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">
            ✅ Login system working perfectly!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ✅ Authentication functional!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ✅ Lovable colors applied!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ✅ All 55+ screens ready to be wired up!
          </p>
        </div>
        <div className="mt-6">
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
