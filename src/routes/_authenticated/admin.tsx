import { Outlet, Link, useRouterState } from "react-router-dom";
import { cn } from "@/lib/utils";
const TABS = [
  { to: "/admin/hospital", label: "Hospital" },
  { to: "/admin/departments", label: "Departments & Doctors" },
  { to: "/admin/beds", label: "Beds & Wards" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/rates", label: "Rate Plans" },
  { to: "/admin/users", label: "Users & Roles" },
  { to: "/admin/audit", label: "Audit Log" },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-card">
        <div className="flex items-end gap-1 overflow-x-auto px-4 pt-3">
          {TABS.map((t) => {
            const active = pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "shrink-0 border-b-2 px-3 pb-2 pt-1.5 text-sm transition-colors",
                  active
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}export default AdminLayout;
