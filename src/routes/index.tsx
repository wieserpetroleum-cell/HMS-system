import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  // Direct redirect to login - bypassing auth check for now
  return <Navigate to="/login" replace />;
}
