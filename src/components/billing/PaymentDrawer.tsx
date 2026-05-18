import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { PaymentMode } from "@/lib/types";
import { money } from "@/lib/money";

const MODES: { value: PaymentMode; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank Transfer" },
  { value: "tpa", label: "TPA Settlement" },
];

export function PaymentDrawer({
  open, onOpenChange, balance, onCollect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  balance: number;
  onCollect: (p: { mode: PaymentMode; amount: number; reference?: string }) => void;
}) {
  const [mode, setMode] = React.useState<PaymentMode>("cash");
  const [amount, setAmount] = React.useState(balance);
  const [reference, setReference] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setAmount(balance); setReference(""); setMode("cash"); setError("");
    }
  }, [open, balance]);

  const submit = () => {
    if (amount <= 0) return setError("Amount must be greater than 0");
    if (amount > balance) return setError(`Cannot exceed balance ${money(balance)}`);
    onCollect({ mode, amount, reference: reference || undefined });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Collect Payment</SheetTitle>
          <SheetDescription>Outstanding balance: <span className="font-semibold text-foreground">{money(balance)}</span></SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 py-6">
          <div>
            <Label className="mb-1.5 block">Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              {MODES.map((m) => (
                <button
                  key={m.value} type="button" onClick={() => setMode(m.value)}
                  className={[
                    "rounded-md border px-3 py-2 text-sm transition-colors",
                    mode === m.value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-accent/40",
                  ].join(" ")}
                >{m.label}</button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="pay-amount" className="mb-1.5 block">Amount</Label>
            <Input id="pay-amount" type="number" min={1} max={balance} value={amount}
              onChange={(e) => { setAmount(Number(e.target.value || 0)); setError(""); }}
              className="text-right tabular-nums" />
          </div>

          <div>
            <Label htmlFor="pay-ref" className="mb-1.5 block">Reference (optional)</Label>
            <Input id="pay-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Auth code / UTR / receipt #" />
          </div>

          {error && <div className="rounded border border-allergy/30 bg-allergy/10 px-3 py-2 text-sm text-allergy">{error}</div>}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Collect {money(amount)}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
