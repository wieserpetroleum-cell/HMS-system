
import { ShieldCheck, Clock, AlertTriangle, TrendingDown, FileText, ArrowRight } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockTpaClaims } from "@/lib/mock/tpa";
import { cn } from "@/lib/utils";
import type { ClaimStatus } from "@/lib/types";
const statusStyle: Record<ClaimStatus, string> = {
  "pre-auth-approved": "bg-status-ok/10 text-status-ok",
  "queried":           "bg-condition/15 text-condition",
  "claim-submitted":   "bg-status-info/10 text-status-info",
  "pre-auth-pending":  "bg-allergy/10 text-allergy",
  "settled":           "bg-status-ok/10 text-status-ok",
  "denied":            "bg-allergy/10 text-allergy",
};

const statusLabel: Record<ClaimStatus, string> = {
  "pre-auth-approved": "Pre-auth Approved",
  "queried":           "Queried",
  "claim-submitted":   "Claim Submitted",
  "pre-auth-pending":  "Pre-auth Pending",
  "settled":           "Settled",
  "denied":            "Denied",
};

function TpaDashboard() {
  const pending  = mockTpaClaims.filter(c => c.status === "pre-auth-pending").length;
  const queried  = mockTpaClaims.filter(c => c.status === "queried").length;
  const submitted = mockTpaClaims.filter(c => c.status === "claim-submitted").length;
  const totalAR  = mockTpaClaims.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6 p-8">
      <PageHeader
        eyebrow="Insurance / TPA"
        title="Active claims & pre-authorisations"
        description="Track pre-auth status, pending queries, and AR ageing."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Active Claims"       value={mockTpaClaims.length} tone="info" />
        <KpiCard label="Pre-auth Pending"    value={pending}   tone={pending  > 0 ? "danger" : "ok"} />
        <KpiCard label="Queries to Respond"  value={queried}   tone={queried  > 0 ? "warn"   : "ok"} />
        <KpiCard label="Total AR"            value={`₹${(totalAR / 1000).toFixed(0)}k`} tone="warn" />
      </div>

      {/* Claims table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-3.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Active Claims
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {["Patient","IP No","TPA","Policy","Admitted","Pre-Auth","Status","Day",""].map(h => (
                <th key={h} className="px-4 py-2.5 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockTpaClaims.map(c => (
              <tr key={c.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{c.patient}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.ipNo}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.tpa}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.policy}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.admissionDate}</td>
                <td className="px-4 py-3 text-xs">{c.preAuth}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", statusStyle[c.status])}>
                    {statusLabel[c.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">Day {c.days}</td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                    View <ArrowRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AR Ageing */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              AR Ageing by TPA
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {["TPA","0–30 days","31–60 days","61–90 days","90+ days","Total"].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { tpa:"MediAssist",    a:"₹85,000", b:"₹32,000", c:"—",       d:"—",       tot:"₹1,17,000" },
                { tpa:"Star Health",   a:"—",       b:"₹45,000", c:"₹28,000", d:"—",       tot:"₹73,000"   },
                { tpa:"ICICI Lombard", a:"₹45,000", b:"—",       c:"—",       d:"—",       tot:"₹45,000"   },
                { tpa:"Bajaj Allianz", a:"—",       b:"—",       c:"₹62,000", d:"₹15,000", tot:"₹77,000"   },
              ].map(row => (
                <tr key={row.tpa} className="hover:bg-muted/20">
                  <td className="px-5 py-3 font-medium">{row.tpa}</td>
                  <td className="px-5 py-3 text-status-ok font-medium">{row.a}</td>
                  <td className="px-5 py-3 text-condition font-medium">{row.b}</td>
                  <td className="px-5 py-3 text-allergy font-medium">{row.c}</td>
                  <td className="px-5 py-3 font-bold text-allergy">{row.d}</td>
                  <td className="px-5 py-3 font-bold">{row.tot}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QuickActions actions={[
          { label: "New Pre-Auth",     icon: ShieldCheck },
          { label: "Submit Claim",     icon: FileText },
          { label: "Log Follow-up",    icon: Clock },
          { label: "AR Report",        icon: TrendingDown },
        ]} />
      </div>
    </div>
  );
}
export default TpaDashboard;
