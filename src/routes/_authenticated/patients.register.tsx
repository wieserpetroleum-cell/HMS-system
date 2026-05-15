import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Plus, Camera } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { FormSection, FormGrid } from "@/components/forms/FormSection";
import { Field } from "@/components/forms/Field";
import { ChipInput } from "@/components/forms/ChipInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

import { usePatients } from "@/lib/patients-store";
import { ageFromDob } from "@/lib/age";
import { patientFormSchema, type PatientFormValues } from "@/lib/validation/patient";

export const Route = createFileRoute("/_authenticated/patients/register")({
  component: RegisterPatient,
});

const blankForm: PatientFormValues = {
  title: "Mr",
  firstName: "",
  middleName: "",
  lastName: "",
  sex: "M",
  dob: "",
  bloodGroup: "Unknown",
  maritalStatus: "single",
  mobile: "",
  altMobile: "",
  email: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  idType: "Aadhaar",
  idNumber: "",
  nationality: "Indian",
  emergencyName: "",
  emergencyRelation: "",
  emergencyPhone: "",
  allergies: [],
  conditions: [],
  notes: "",
  hasInsurance: false,
  insuranceProvider: "",
  policyNumber: "",
  tpaName: "",
  policyValidity: "",
  registrationType: "OPD",
  referredBy: "",
  consent: false as unknown as true,
};

type Errors = Partial<Record<keyof PatientFormValues, string>>;

function RegisterPatient() {
  const { addPatient, nextUid } = usePatients();
  const navigate = useNavigate();
  const [values, setValues] = React.useState<PatientFormValues>(blankForm);
  const [errors, setErrors] = React.useState<Errors>({});
  const previewUid = React.useMemo(() => nextUid(), [nextUid]);

  const set = <K extends keyof PatientFormValues>(key: K, v: PatientFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const computedAge = ageFromDob(values.dob);
  const fullName = [values.title, values.firstName, values.middleName, values.lastName]
    .filter(Boolean)
    .join(" ");

  const validate = (): PatientFormValues | null => {
    const result = patientFormSchema.safeParse(values);
    if (result.success) return result.data;
    const next: Errors = {};
    for (const issue of result.error.issues) {
      const k = issue.path[0] as keyof PatientFormValues;
      if (k && !next[k]) next[k] = issue.message;
    }
    setErrors(next);
    toast.error("Please fix the highlighted fields");
    return null;
  };

  const submit = (mode: "open" | "new") => {
    const data = validate();
    if (!data) return;
    const patient = addPatient({
      title: data.title,
      firstName: data.firstName,
      middleName: data.middleName || undefined,
      lastName: data.lastName,
      name: [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" "),
      sex: data.sex,
      dob: data.dob,
      age: ageFromDob(data.dob),
      bloodGroup: data.bloodGroup,
      maritalStatus: data.maritalStatus,
      mobile: data.mobile,
      altMobile: data.altMobile || undefined,
      email: data.email || undefined,
      address1: data.address1,
      address2: data.address2 || undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country,
      idType: data.idType,
      idNumber: data.idNumber,
      nationality: data.nationality,
      emergencyName: data.emergencyName,
      emergencyRelation: data.emergencyRelation,
      emergencyPhone: data.emergencyPhone,
      allergies: data.allergies,
      conditions: data.conditions,
      notes: data.notes || undefined,
      hasInsurance: data.hasInsurance,
      insuranceProvider: data.insuranceProvider || undefined,
      policyNumber: data.policyNumber || undefined,
      tpaName: data.tpaName || undefined,
      policyValidity: data.policyValidity || undefined,
      registrationType: data.registrationType,
      referredBy: data.referredBy || undefined,
    });
    toast.success(`Patient registered · ${patient.uid}`);
    if (mode === "open") {
      navigate({ to: "/patients/$uid", params: { uid: patient.uid } });
    } else {
      setValues(blankForm);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        submit("open");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div className="space-y-6 p-8 pb-32">
      <Link
        to="/patients"
        className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Patient Registry
      </Link>

      <PageHeader
        eyebrow="Module 03 · Screen 08"
        title="New Patient Registration"
        description="Capture identity, contact, and clinical baselines. Required fields marked with an asterisk."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* 01 Identity */}
          <FormSection number="01" title="Identity" description="Legal name, sex, and core demographics.">
            <FormGrid cols={4}>
              <Field label="Title" required error={errors.title}>
                <NativeSelect
                  value={values.title}
                  onChange={(v) => set("title", v as PatientFormValues["title"])}
                  options={["Mr", "Mrs", "Ms", "Dr", "Master", "Miss"]}
                />
              </Field>
              <Field label="First name" required error={errors.firstName} className="md:col-span-1">
                <Input
                  value={values.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  placeholder="Arjun"
                />
              </Field>
              <Field label="Middle name" error={errors.middleName}>
                <Input
                  value={values.middleName}
                  onChange={(e) => set("middleName", e.target.value)}
                />
              </Field>
              <Field label="Last name" required error={errors.lastName}>
                <Input
                  value={values.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="Singh"
                />
              </Field>

              <Field label="Sex" required error={errors.sex}>
                <NativeSelect
                  value={values.sex}
                  onChange={(v) => set("sex", v as PatientFormValues["sex"])}
                  options={[
                    ["M", "Male"],
                    ["F", "Female"],
                    ["O", "Other"],
                  ]}
                />
              </Field>
              <Field
                label="Date of birth"
                required
                error={errors.dob}
                hint={values.dob ? `Age: ${computedAge}` : "Used to derive age"}
              >
                <Input
                  type="date"
                  value={values.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </Field>
              <Field label="Blood group" required error={errors.bloodGroup}>
                <NativeSelect
                  value={values.bloodGroup}
                  onChange={(v) => set("bloodGroup", v as PatientFormValues["bloodGroup"])}
                  options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]}
                />
              </Field>
              <Field label="Marital status" required error={errors.maritalStatus}>
                <NativeSelect
                  value={values.maritalStatus}
                  onChange={(v) => set("maritalStatus", v as PatientFormValues["maritalStatus"])}
                  options={[
                    ["single", "Single"],
                    ["married", "Married"],
                    ["divorced", "Divorced"],
                    ["widowed", "Widowed"],
                    ["other", "Other"],
                  ]}
                />
              </Field>
            </FormGrid>

            <div className="mt-6 flex items-center gap-3 rounded-md border border-dashed border-border bg-secondary/30 p-3">
              <div className="grid size-10 place-items-center rounded bg-secondary text-muted-foreground">
                <Camera className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">
                Patient photo upload — placeholder. File capture ships with Module 6.
              </p>
            </div>
          </FormSection>

          {/* 02 Contact */}
          <FormSection number="02" title="Contact" description="Primary reach-out and address.">
            <FormGrid cols={3}>
              <Field label="Mobile" required error={errors.mobile}>
                <Input
                  value={values.mobile}
                  onChange={(e) => set("mobile", e.target.value)}
                  placeholder="+91 98xxx xxxxx"
                  inputMode="tel"
                />
              </Field>
              <Field label="Alt mobile" error={errors.altMobile}>
                <Input
                  value={values.altMobile}
                  onChange={(e) => set("altMobile", e.target.value)}
                  inputMode="tel"
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
            </FormGrid>
            <div className="mt-4">
              <FormGrid cols={2}>
                <Field label="Address line 1" required error={errors.address1}>
                  <Input
                    value={values.address1}
                    onChange={(e) => set("address1", e.target.value)}
                  />
                </Field>
                <Field label="Address line 2" error={errors.address2}>
                  <Input
                    value={values.address2}
                    onChange={(e) => set("address2", e.target.value)}
                  />
                </Field>
              </FormGrid>
            </div>
            <div className="mt-4">
              <FormGrid cols={4}>
                <Field label="City" required error={errors.city}>
                  <Input value={values.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
                <Field label="State" required error={errors.state}>
                  <Input value={values.state} onChange={(e) => set("state", e.target.value)} />
                </Field>
                <Field label="Pincode" required error={errors.pincode}>
                  <Input value={values.pincode} onChange={(e) => set("pincode", e.target.value)} />
                </Field>
                <Field label="Country" required error={errors.country}>
                  <Input value={values.country} onChange={(e) => set("country", e.target.value)} />
                </Field>
              </FormGrid>
            </div>
          </FormSection>

          {/* 03 Identification */}
          <FormSection number="03" title="Identification" description="Government identity for medico-legal records.">
            <FormGrid cols={3}>
              <Field label="ID type" required error={errors.idType}>
                <NativeSelect
                  value={values.idType}
                  onChange={(v) => set("idType", v as PatientFormValues["idType"])}
                  options={["Aadhaar", "Passport", "PAN", "Other"]}
                />
              </Field>
              <Field label="ID number" required error={errors.idNumber}>
                <Input value={values.idNumber} onChange={(e) => set("idNumber", e.target.value)} />
              </Field>
              <Field label="Nationality" required error={errors.nationality}>
                <Input
                  value={values.nationality}
                  onChange={(e) => set("nationality", e.target.value)}
                />
              </Field>
            </FormGrid>
          </FormSection>

          {/* 04 Emergency */}
          <FormSection number="04" title="Emergency Contact" description="Required for all admissions.">
            <FormGrid cols={3}>
              <Field label="Name" required error={errors.emergencyName}>
                <Input
                  value={values.emergencyName}
                  onChange={(e) => set("emergencyName", e.target.value)}
                />
              </Field>
              <Field label="Relationship" required error={errors.emergencyRelation}>
                <Input
                  value={values.emergencyRelation}
                  onChange={(e) => set("emergencyRelation", e.target.value)}
                  placeholder="Spouse, Parent…"
                />
              </Field>
              <Field label="Phone" required error={errors.emergencyPhone}>
                <Input
                  value={values.emergencyPhone}
                  onChange={(e) => set("emergencyPhone", e.target.value)}
                  inputMode="tel"
                />
              </Field>
            </FormGrid>
          </FormSection>

          {/* 05 Clinical Flags */}
          <FormSection
            number="05"
            title="Clinical Flags"
            description="Surface allergy and chronic markers everywhere this patient appears."
          >
            <FormGrid cols={2}>
              <Field label="Known allergies" hint="Type and press Enter">
                <ChipInput
                  value={values.allergies}
                  onChange={(v) => set("allergies", v)}
                  tone="allergy"
                  placeholder="e.g. Penicillin"
                />
              </Field>
              <Field label="Chronic conditions" hint="Type and press Enter">
                <ChipInput
                  value={values.conditions}
                  onChange={(v) => set("conditions", v)}
                  tone="condition"
                  placeholder="e.g. Hypertension"
                />
              </Field>
            </FormGrid>
            <div className="mt-4">
              <Field label="Notes" error={errors.notes}>
                <Textarea
                  value={values.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  placeholder="Any clinical context worth recording at intake…"
                />
              </Field>
            </div>
          </FormSection>

          {/* 06 Insurance */}
          <FormSection number="06" title="Insurance / TPA" description="Skip if patient is self-pay.">
            <div className="mb-4 flex items-center gap-3">
              <Switch
                checked={values.hasInsurance}
                onCheckedChange={(v) => set("hasInsurance", v)}
                id="hasInsurance"
              />
              <label htmlFor="hasInsurance" className="text-sm font-medium">
                Patient has insurance / TPA coverage
              </label>
            </div>
            {values.hasInsurance && (
              <FormGrid cols={4}>
                <Field label="Provider" required error={errors.insuranceProvider}>
                  <Input
                    value={values.insuranceProvider}
                    onChange={(e) => set("insuranceProvider", e.target.value)}
                  />
                </Field>
                <Field label="Policy #" required error={errors.policyNumber}>
                  <Input
                    value={values.policyNumber}
                    onChange={(e) => set("policyNumber", e.target.value)}
                  />
                </Field>
                <Field label="TPA name" error={errors.tpaName}>
                  <Input
                    value={values.tpaName}
                    onChange={(e) => set("tpaName", e.target.value)}
                  />
                </Field>
                <Field label="Validity" error={errors.policyValidity}>
                  <Input
                    type="date"
                    value={values.policyValidity}
                    onChange={(e) => set("policyValidity", e.target.value)}
                  />
                </Field>
              </FormGrid>
            )}
          </FormSection>

          {/* 07 Registration meta */}
          <FormSection number="07" title="Registration" description="Where this record originates.">
            <FormGrid cols={3}>
              <Field label="Registration type" required error={errors.registrationType}>
                <NativeSelect
                  value={values.registrationType}
                  onChange={(v) =>
                    set("registrationType", v as PatientFormValues["registrationType"])
                  }
                  options={["OPD", "IPD", "Emergency"]}
                />
              </Field>
              <Field label="Referred by" error={errors.referredBy} className="md:col-span-2">
                <Input
                  value={values.referredBy}
                  onChange={(e) => set("referredBy", e.target.value)}
                  placeholder="Internal department or external physician"
                />
              </Field>
            </FormGrid>
            <div className="mt-5 flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-4">
              <Checkbox
                id="consent"
                checked={values.consent === true}
                onCheckedChange={(v) =>
                  set("consent", (v === true) as unknown as PatientFormValues["consent"])
                }
              />
              <label htmlFor="consent" className="text-sm leading-snug">
                Patient (or guardian) consents to data collection, storage, and use for clinical
                care under the hospital privacy policy.
                {errors.consent && (
                  <span className="ml-2 text-[11px] font-semibold text-allergy">
                    {errors.consent}
                  </span>
                )}
              </label>
            </div>
          </FormSection>
        </div>

        {/* Summary rail */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Live Preview
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  UID (preview)
                </p>
                <p className="mt-0.5 font-mono text-base font-bold tracking-tight text-primary">
                  {previewUid}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Name
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {fullName.trim() || <span className="text-muted-foreground">—</span>}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SummaryStat label="Sex" value={values.sex} />
                <SummaryStat label="Age" value={computedAge} />
                <SummaryStat label="Blood" value={values.bloodGroup} />
                <SummaryStat label="Type" value={values.registrationType} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Flags
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {values.allergies.length === 0 && values.conditions.length === 0 && (
                    <span className="text-xs text-muted-foreground">None recorded</span>
                  )}
                  {values.allergies.map((a) => (
                    <span
                      key={`a-${a}`}
                      className="rounded border border-allergy/30 bg-allergy/10 px-1.5 py-0.5 text-[10px] font-semibold text-allergy"
                    >
                      {a}
                    </span>
                  ))}
                  {values.conditions.map((c) => (
                    <span
                      key={`c-${c}`}
                      className="rounded border border-condition/40 bg-condition/15 px-1.5 py-0.5 text-[10px] font-semibold text-condition-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Tip: <kbd className="rounded border border-border bg-secondary px-1">⌘</kbd> +{" "}
            <kbd className="rounded border border-border bg-secondary px-1">Enter</kbd> to save &
            open profile.
          </p>
        </aside>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-8 py-3">
          <p className="text-xs text-muted-foreground">
            UID will be assigned as{" "}
            <span className="font-mono font-semibold text-primary">{previewUid}</span> on save.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: "/patients" })}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => submit("new")}>
              <Plus className="mr-1.5 h-4 w-4" /> Save & New
            </Button>
            <Button onClick={() => submit("open")}>
              <Save className="mr-1.5 h-4 w-4" /> Save & Open Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-secondary/40 px-2.5 py-1.5">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold tabular-nums">{value}</p>
    </div>
  );
}

type SelectOption = string | [string, string];

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
  );
}
