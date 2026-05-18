import * as React from "react";
import type {
  AppUser,
  BedCategory,
  ConfiguredBed,
  Department,
  DoctorProfile,
  HospitalProfile,
  RatePlan,
  RoleDef,
  ServiceItem,
  Ward,
} from "@/lib/types";
import {
  mockAppUsers,
  mockBedCategories,
  mockConfiguredBeds,
  mockDepartments,
  mockDoctors,
  mockHospital,
  mockRatePlans,
  mockRoles,
  mockServices,
  mockWardsAdmin,
} from "@/lib/mock/admin";

type Upsert<T extends { id: string }> = (item: T) => void;
type Remove = (id: string) => void;

interface Ctx {
  hospital: HospitalProfile;
  saveHospital: (patch: Partial<HospitalProfile>) => void;

  departments: Department[];
  saveDepartment: Upsert<Department>;
  removeDepartment: Remove;

  doctors: DoctorProfile[];
  saveDoctor: Upsert<DoctorProfile>;
  removeDoctor: Remove;

  wards: Ward[];
  saveWard: Upsert<Ward>;
  removeWard: Remove;

  bedCategories: BedCategory[];
  saveBedCategory: Upsert<BedCategory>;
  removeBedCategory: Remove;

  beds: ConfiguredBed[];
  saveBed: Upsert<ConfiguredBed>;
  removeBed: Remove;
  bulkAddBeds: (input: { wardId: string; categoryId: string; prefix: string; start: number; count: number; dailyRate: number }) => void;

  services: ServiceItem[];
  saveService: Upsert<ServiceItem>;
  removeService: Remove;

  plans: RatePlan[];
  savePlan: Upsert<RatePlan>;
  removePlan: Remove;
  updateRate: (planId: string, serviceId: string, rate: number) => void;
  bulkAdjustPlan: (planId: string, pct: number, category?: string) => void;
  copyRatesFrom: (targetPlanId: string, sourcePlanId: string) => void;

  roles: RoleDef[];
  saveRole: Upsert<RoleDef>;
  removeRole: Remove;

  users: AppUser[];
  saveUser: Upsert<AppUser>;
  removeUser: Remove;
  toggleUserStatus: (id: string) => void;
}

const AdminContext = React.createContext<Ctx | null>(null);

function upsert<T extends { id: string }>(prev: T[], item: T): T[] {
  const idx = prev.findIndex((p) => p.id === item.id);
  if (idx === -1) return [item, ...prev];
  const next = prev.slice();
  next[idx] = item;
  return next;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [hospital, setHospital] = React.useState<HospitalProfile>(mockHospital);
  const [departments, setDepartments] = React.useState<Department[]>(mockDepartments);
  const [doctors, setDoctors] = React.useState<DoctorProfile[]>(mockDoctors);
  const [wards, setWards] = React.useState<Ward[]>(mockWardsAdmin);
  const [bedCategories, setBedCategories] = React.useState<BedCategory[]>(mockBedCategories);
  const [beds, setBeds] = React.useState<ConfiguredBed[]>(mockConfiguredBeds);
  const [services, setServices] = React.useState<ServiceItem[]>(mockServices);
  const [plans, setPlans] = React.useState<RatePlan[]>(mockRatePlans);
  const [roles, setRoles] = React.useState<RoleDef[]>(mockRoles);
  const [users, setUsers] = React.useState<AppUser[]>(mockAppUsers);

  const saveHospital = React.useCallback((patch: Partial<HospitalProfile>) => {
    setHospital((h) => ({ ...h, ...patch }));
  }, []);

  const value: Ctx = {
    hospital, saveHospital,
    departments,
    saveDepartment: (d) => setDepartments((p) => upsert(p, d)),
    removeDepartment: (id) => setDepartments((p) => p.filter((x) => x.id !== id)),
    doctors,
    saveDoctor: (d) => setDoctors((p) => upsert(p, d)),
    removeDoctor: (id) => setDoctors((p) => p.filter((x) => x.id !== id)),
    wards,
    saveWard: (w) => setWards((p) => upsert(p, w)),
    removeWard: (id) => setWards((p) => p.filter((x) => x.id !== id)),
    bedCategories,
    saveBedCategory: (c) => setBedCategories((p) => upsert(p, c)),
    removeBedCategory: (id) => setBedCategories((p) => p.filter((x) => x.id !== id)),
    beds,
    saveBed: (b) => setBeds((p) => upsert(p, b)),
    removeBed: (id) => setBeds((p) => p.filter((x) => x.id !== id)),
    bulkAddBeds: ({ wardId, categoryId, prefix, start, count, dailyRate }) => {
      const created: ConfiguredBed[] = [];
      for (let i = 0; i < count; i++) {
        const n = start + i;
        created.push({
          id: `cb_${Date.now()}_${i}`,
          wardId, categoryId,
          bedNumber: `${prefix}-${String(n).padStart(2, "0")}`,
          dailyRate, equipment: [], active: true,
        });
      }
      setBeds((p) => [...created, ...p]);
    },
    services,
    saveService: (s) => setServices((p) => upsert(p, s)),
    removeService: (id) => setServices((p) => p.filter((x) => x.id !== id)),
    plans,
    savePlan: (p) => setPlans((prev) => upsert(prev, p)),
    removePlan: (id) => setPlans((p) => p.filter((x) => x.id !== id)),
    updateRate: (planId, serviceId, rate) => {
      setPlans((prev) => prev.map((pl) => pl.id === planId ? { ...pl, rates: { ...pl.rates, [serviceId]: rate } } : pl));
    },
    bulkAdjustPlan: (planId, pct, category) => {
      setPlans((prev) => prev.map((pl) => {
        if (pl.id !== planId) return pl;
        const next = { ...pl.rates };
        for (const s of services) {
          if (category && s.category !== category) continue;
          next[s.id] = Math.max(0, Math.round((next[s.id] ?? s.defaultRate) * (1 + pct / 100)));
        }
        return { ...pl, rates: next };
      }));
    },
    copyRatesFrom: (target, source) => {
      const src = plans.find((p) => p.id === source);
      if (!src) return;
      setPlans((prev) => prev.map((pl) => pl.id === target ? { ...pl, rates: { ...src.rates } } : pl));
    },
    roles,
    saveRole: (r) => setRoles((p) => upsert(p, r)),
    removeRole: (id) => setRoles((p) => p.filter((x) => x.id !== id && !x.systemRole)),
    users,
    saveUser: (u) => setUsers((p) => upsert(p, u)),
    removeUser: (id) => setUsers((p) => p.filter((x) => x.id !== id)),
    toggleUserStatus: (id) => setUsers((p) => p.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)),
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = React.useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}