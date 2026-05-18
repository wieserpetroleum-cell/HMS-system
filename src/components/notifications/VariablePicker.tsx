import { Button } from "@/components/ui/button";

const ALL_VARS = [
  "patient_name",
  "appointment_date",
  "appointment_time",
  "doctor_name",
  "token_number",
  "amount",
  "payment_link",
  "hospital_name",
];

export function VariablePicker({
  onInsert,
  body,
  channel,
}: {
  onInsert: (token: string) => void;
  body: string;
  channel: "whatsapp" | "sms" | "email";
}) {
  const limit = channel === "sms" ? 160 : channel === "whatsapp" ? 1024 : 5000;
  const over = body.length > limit;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {ALL_VARS.map((v) => (
          <Button
            key={v}
            type="button"
            size="sm"
            variant="outline"
            className="h-6 rounded-full px-2 text-[10px] font-mono"
            onClick={() => onInsert(`{{${v}}}`)}
          >
            {`{{${v}}}`}
          </Button>
        ))}
      </div>
      <div className={`text-[11px] ${over ? "text-allergy" : "text-muted-foreground"}`}>
        {body.length} / {limit} characters
        {over && " — exceeds channel limit"}
      </div>
    </div>
  );
}