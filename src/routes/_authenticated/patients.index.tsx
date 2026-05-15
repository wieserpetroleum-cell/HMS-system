import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Plus, AlertTriangle, Activity } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePatients } from "@/lib/patients-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/patients/")({
  component: PatientRegistry,
});

function PatientRegistry() {
  const { patients } = usePatients();
  const navigate = useNavigate();
  const [q, setQ] = React.useState("");
  const [sex, setSex] = React.useState<"all" | "M" | "F" | "O">("all");
  const [type, setType] = React.useState<"all" | "OPD" | "IPD" | "Emergency">("all");
  const [allergyOnly, setAllergyOnly] = React.useState(false);

  const filtered = patients.filter((p) => {
    const ql = q.trim().toLowerCase();
    if (ql && !(`${p.name} ${p.uid} ${p.mobile ?? ""}`.toLowerCase().includes(ql))) return false;
    if (sex !== "all" && p.sex !== sex) return false;
    if (type !== "all" && p.registrationType !== type) return false;
    if (allergyOnly && p.allergies.length === 0) return false;
    return true;
  });

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Module 03 · Patients"
        title="Patient Registry"
        description={`${patients.length} records · ${filtered.length} matching filters`}
        right={
          <Link to="/patients/register">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Register Patient
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="relative min-w-[280px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, UID, or mobile…"
            className="pl-9"
          />
        </div>
        <FilterSelect
          label="Sex"
          value={sex}
          onChange={(v) => setSex(v as typeof sex)}
          options={[
            ["all", "All"],
            ["M", "Male"],
            ["F", "Female"],
            ["O", "Other"],
          ]}
        />
        <FilterSelect
          label="Type"
          value={type}
          onChange={(v) => setType(v as typeof type)}
          options={[
            ["all", "All"],
            ["OPD", "OPD"],
            ["IPD", "IPD"],
            ["Emergency", "Emergency"],
          ]}
        />
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <input
            type="checkbox"
            checked={allergyOnly}
            onChange={(e) => setAllergyOnly(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Allergy flag
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-3 text-left">UID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Sex / Age</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Last Visit</th>
              <th className="px-4 py-3 text-left">Flags</th>
              <th className="px-4 py-3 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No patients match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate({ to: "/patients/$uid", params: { uid: p.uid } })}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/40"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{p.uid}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {p.sex} · {p.age}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{p.mobile ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {p.lastVisit ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.allergies.slice(0, 2).map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 rounded border border-allergy/30 bg-allergy/10 px-1.5 py-0.5 text-[10px] font-semibold text-allergy"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" /> {a}
                        </span>
                      ))}
                      {p.conditions.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 rounded border border-condition/40 bg-condition/15 px-1.5 py-0.5 text-[10px] font-semibold text-condition-foreground"
                        >
                          <Activity className="h-2.5 w-2.5" /> {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        p.registrationType === "Emergency"
                          ? "border-allergy/30 bg-allergy/10 text-allergy"
                          : p.registrationType === "IPD"
                            ? "border-status-info/30 bg-status-info/10 text-status-info"
                            : "border-border bg-secondary text-muted-foreground",
                      )}
                    >
                      {p.registrationType ?? "—"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
