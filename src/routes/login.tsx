import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { ROLE_DASHBOARD } from "@/lib/types";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const { login, isAuthenticated, dashboardRoute } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate({ to: dashboardRoute as "/dashboard", replace: true });
  }, [isAuthenticated, dashboardRoute, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@medicore.os", password: "admin123", remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const user = await login(values.email, values.password);
      toast.success(`Welcome, ${user.name.split(" ")[0]}`);
      const dest = ROLE_DASHBOARD[user.role] ?? "/dashboard";
      navigate({ to: dest as "/dashboard", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-sidebar text-foreground">
      {/* Brand panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-sidebar p-12 text-white lg:flex">
        <div className="text-2xl font-bold tracking-tight">
          Hospitrix
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Hospital Operations Console
          </p>
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            Clinical precision for every shift.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            Patient records, ward status, billing and TPA — coordinated in a
            single workspace built for clinical teams.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="size-1.5 rounded-full bg-status-ok" />
            All systems operational
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-3 text-[11px] text-slate-400">
            <p className="mb-1.5 font-semibold text-slate-300">Demo credentials</p>
            {[
              ["Admin",        "admin@medicore.os",        "admin123"],
              ["Doctor",       "doctor@medicore.os",       "doctor123"],
              ["Reception",    "reception@medicore.os",    "reception123"],
              ["Nurse",        "nurse@medicore.os",        "nurse123"],
              ["Billing",      "billing@medicore.os",      "billing123"],
              ["TPA",          "tpa@medicore.os",          "tpa123"],
              ["Radiologist",  "radiologist@medicore.os",  "radio123"],
              ["Rad Tech",     "radtech@medicore.os",      "radtech123"],
            ].map(([role, email, pass]) => (
              <div key={role} className="flex items-center gap-2 py-0.5">
                <span className="w-20 text-slate-500">{role}</span>
                <span className="font-mono">{email}</span>
                <span className="text-slate-500">/ {pass}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Sign in
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your hospital-issued credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked />
              <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground">
                Keep me signed in on this device
              </Label>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
