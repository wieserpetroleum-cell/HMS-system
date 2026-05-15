import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { isAuthenticated, dashboardRoute } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate({
      to: isAuthenticated ? (dashboardRoute as "/dashboard") : "/login",
      replace: true,
    });
  }, [isAuthenticated, dashboardRoute, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  );
}
