import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-background font-sans text-foreground">
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
