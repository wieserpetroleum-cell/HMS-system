import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, Activity, CalendarPlus, BedDouble, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatients } from "@/lib/patients-store";
import type { Patient } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/patients/$uid")({
  component: PatientProfile,
});

function PatientProfile() {
  const { uid } = Route.useParams();
  const { getPatient } = usePatients();
  const navigate = useNavigate();
  const patient = getPatient(uid);

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
        <p className="text-sm text-muted-foreground">No patient found with UID {uid}.</p>
        <Button variant="outline" onClick={() => navigate({ to: "/patients" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to registry
        </Button>
      </div>
    );
  }

  const initials = patient.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="space-y-6 p-8">
      <Link
        to="/patients"
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Patient Registry
      </Link>

      <div className="flex flex-wrap items-start gap-6 rounded-lg border border-border bg-card p-6">
        <div className="grid size-20 place-items-center rounded-md bg-secondary text-2xl font-bold tracking-tight text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {patient.uid}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{patient.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {patient.sex} · {patient.age}
            </span>
            {patient.bloodGroup && <span>· {patient.bloodGroup}</span>}
            {patient.mobile && <span>· {patient.mobile}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {patient.allergies.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded border border-allergy/30 bg-allergy/10 px-2 py-0.5 text-[11px] font-semibold text-allergy"
              >
                <AlertTriangle className="h-3 w-3" /> {a}
              </span>
            ))}
            {patient.conditions.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded border border-condition/40 bg-condition/15 px-2 py-0.5 text-[11px] font-semibold text-condition-foreground"
              >
                <Activity className="h-3 w-3" /> {c}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast("Coming in Module 4")}>
            <CalendarPlus className="mr-1.5 h-4 w-4" /> New Appointment
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast("Coming in Module 5")}>
            <BedDouble className="mr-1.5 h-4 w-4" /> Admit
          </Button>
          <Button size="sm" onClick={() => toast("Edit flow ships in the next module")}>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="clinical">Allergies & Conditions</TabsTrigger>
          <TabsTrigger value="docs">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Overview patient={patient} />
        </TabsContent>
        <TabsContent value="visits" className="mt-4">
          <PlaceholderPanel
            title="Visit History"
            body={`Last visit: ${patient.lastVisit ?? "—"}. Detailed encounter timeline arrives with Module 4 (OPD) and Module 5 (IPD).`}
          />
        </TabsContent>
        <TabsContent value="clinical" className="mt-4">
          <ClinicalPanel patient={patient} />
        </TabsContent>
        <TabsContent value="docs" className="mt-4">
          <PlaceholderPanel
            title="Documents"
            body="Lab reports, imaging, and consent forms will appear here once Module 6 (Radiology) and Module 7 (Lab) are wired in."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Overview({ patient }: { patient: Patient }) {
  const groups: Array<{ heading: string; rows: Array<[string, React.ReactNode]> }> = [
    {
      heading: "Demographics",
      rows: [
        ["Title", patient.title ?? "—"],
        ["Full name", patient.name],
        ["Sex / Age", `${patient.sex} · ${patient.age}`],
        ["DOB", patient.dob ?? "—"],
        ["Blood group", patient.bloodGroup ?? "—"],
        ["Marital status", patient.maritalStatus ?? "—"],
      ],
    },
    {
      heading: "Contact",
      rows: [
        ["Mobile", patient.mobile ?? "—"],
        ["Alt mobile", patient.altMobile ?? "—"],
        ["Email", patient.email ?? "—"],
        ["Address", [patient.address1, patient.address2].filter(Boolean).join(", ") || "—"],
        ["City / State", `${patient.city ?? "—"} · ${patient.state ?? "—"}`],
        ["Pincode", patient.pincode ?? "—"],
      ],
    },
    {
      heading: "Identification",
      rows: [
        ["ID type", patient.idType ?? "—"],
        ["ID number", patient.idNumber ?? "—"],
        ["Nationality", patient.nationality ?? "—"],
      ],
    },
    {
      heading: "Emergency",
      rows: [
        ["Name", patient.emergencyName ?? "—"],
        ["Relationship", patient.emergencyRelation ?? "—"],
        ["Phone", patient.emergencyPhone ?? "—"],
      ],
    },
    {
      heading: "Insurance",
      rows: patient.hasInsurance
        ? [
            ["Provider", patient.insuranceProvider ?? "—"],
            ["Policy #", patient.policyNumber ?? "—"],
            ["TPA", patient.tpaName ?? "—"],
            ["Validity", patient.policyValidity ?? "—"],
          ]
        : [["Status", "Self-pay"]],
    },
    {
      heading: "Registration",
      rows: [
        ["Type", patient.registrationType ?? "—"],
        ["Referred by", patient.referredBy ?? "—"],
        ["Registered at", patient.registeredAt?.slice(0, 10) ?? "—"],
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((g) => (
        <div key={g.heading} className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {g.heading}
          </h3>
          <dl className="mt-3 space-y-2 text-sm">
            {g.rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-2">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function ClinicalPanel({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-allergy/20 bg-allergy/5 p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-allergy">Allergies</h3>
        {patient.allergies.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No known allergies.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {patient.allergies.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-allergy" /> {a}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rounded-lg border border-condition/30 bg-condition/5 p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-condition-foreground">
          Chronic Conditions
        </h3>
        {patient.conditions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No chronic conditions recorded.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {patient.conditions.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-condition-foreground" /> {c}
              </li>
            ))}
          </ul>
        )}
      </div>
      {patient.notes && (
        <div className="rounded-lg border border-border bg-card p-5 md:col-span-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Notes
          </h3>
          <p className="mt-2 text-sm">{patient.notes}</p>
        </div>
      )}
    </div>
  );
}

function PlaceholderPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
