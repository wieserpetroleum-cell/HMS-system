import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Stethoscope, BedDouble, Users, Receipt,
  ScanLine, ShieldCheck, Bell, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { heading: string; items: NavItem[] };

const navByRole: Record<Role, NavGroup[]> = {
  admin: [
    { heading: "Overview", items: [
      { to: "/dashboard",           label: "Dashboard",          icon: LayoutDashboard },
    ]},
    { heading: "Clinical", items: [
      { to: "/patients",            label: "Patient Registry",   icon: Users },
      { to: "/appointments",        label: "OPD & Appointments", icon: Stethoscope },
      { to: "/ipd",                 label: "IPD Ward Mgmt",      icon: BedDouble },
      { to: "/radiology",           label: "Radiology",          icon: ScanLine },
    ]},
    { heading: "Finance", items: [
      { to: "/billing",             label: "Billing",            icon: Receipt },
      { to: "/billing/tpa",         label: "Insurance / TPA",    icon: ShieldCheck },
    ]},
    { heading: "System", items: [
      { to: "/notifications",       label: "Notifications",      icon: Bell },
      { to: "/admin",               label: "Administration",     icon: Settings },
    ]},
  ],
  doctor: [
    { heading: "Clinical", items: [
      { to: "/dashboard/doctor",    label: "My Dashboard",       icon: LayoutDashboard },
      { to: "/patients",            label: "Patient Registry",   icon: Users },
      { to: "/appointments",        label: "OPD Queue",          icon: Stethoscope },
      { to: "/ipd",                 label: "My IPD Patients",    icon: BedDouble },
      { to: "/radiology",           label: "Radiology Orders",   icon: ScanLine },
    ]},
  ],
  receptionist: [
    { heading: "Front Desk", items: [
      { to: "/dashboard/reception", label: "My Dashboard",       icon: LayoutDashboard },
      { to: "/patients",            label: "Patient Registry",   icon: Users },
      { to: "/appointments",        label: "Appointments",       icon: Stethoscope },
      { to: "/billing",             label: "Billing & Payments", icon: Receipt },
    ]},
  ],
  nurse: [
    { heading: "Ward", items: [
      { to: "/dashboard/nurse",     label: "My Dashboard",       icon: LayoutDashboard },
      { to: "/ipd",                 label: "Ward & Beds",        icon: BedDouble },
      { to: "/patients",            label: "Patient Registry",   icon: Users },
    ]},
  ],
  billing: [
    { heading: "Finance", items: [
      { to: "/dashboard/billing",   label: "My Dashboard",       icon: LayoutDashboard },
      { to: "/billing",             label: "Billing",            icon: Receipt },
      { to: "/billing/tpa",         label: "Insurance / TPA",    icon: ShieldCheck },
      { to: "/patients",            label: "Patient Registry",   icon: Users },
    ]},
  ],
  tpa: [
    { heading: "Insurance", items: [
      { to: "/dashboard/tpa",       label: "My Dashboard",       icon: LayoutDashboard },
      { to: "/billing/tpa",         label: "TPA & Claims",       icon: ShieldCheck },
      { to: "/patients",            label: "Patient Registry",   icon: Users },
      { to: "/billing",             label: "Billing",            icon: Receipt },
    ]},
  ],
  radiologist: [
    { heading: "Radiology", items: [
      { to: "/dashboard/radiologist", label: "My Dashboard",     icon: LayoutDashboard },
      { to: "/radiology",           label: "Pending Reports",    icon: ScanLine },
      { to: "/patients",            label: "Patient Registry",   icon: Users },
    ]},
  ],
  radtech: [
    { heading: "Radiology", items: [
      { to: "/dashboard/radtech",   label: "My Dashboard",       icon: LayoutDashboard },
      { to: "/radiology",           label: "Worklist",           icon: ScanLine },
      { to: "/patients",            label: "Patient Registry",   icon: Users },
    ]},
  ],
};

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-slate-400 hover:bg-white/5 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(to + "/");

  const groups = user ? (navByRole[user.role as Role] ?? navByRole.admin) : navByRole.admin;

  const initials = user
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")
    : "—";

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="border-b border-white/10 p-6">
        <div className="text-xl font-bold tracking-tight text-white">Hospitrix</div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Hospital Management
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-4">
        {groups.map((group) => (
          <div key={group.heading}>
            <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {group.heading}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.to} item={item} active={isActive(item.to)} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-full bg-slate-700 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">{user?.name ?? "Guest"}</div>
            <div className="truncate text-[10px] capitalize text-slate-400">{user?.role ?? ""}</div>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="rounded p-1 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
