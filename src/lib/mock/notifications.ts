import type { MessageTemplate, NotificationEntry } from "@/lib/types";

const day = 24 * 60 * 60 * 1000;
const now = Date.now();
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString();

export const mockTemplates: MessageTemplate[] = [
  {
    id: "t1",
    name: "Appointment booked — EN",
    trigger: "appointment_booked",
    channels: ["whatsapp", "sms"],
    language: "English",
    body: "Hello {{patient_name}}, your appointment with {{doctor_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Token: {{token_number}}. — {{hospital_name}}",
    variables: ["patient_name", "doctor_name", "appointment_date", "appointment_time", "token_number", "hospital_name"],
    status: "active",
    metaApprovalAt: iso(40 * day),
    updatedAt: iso(8 * day),
  },
  {
    id: "t2",
    name: "Appointment booked — HI",
    trigger: "appointment_booked",
    channels: ["whatsapp"],
    language: "Hindi",
    body: "नमस्ते {{patient_name}}, आपका अपॉइंटमेंट {{doctor_name}} के साथ {{appointment_date}} को {{appointment_time}} बजे तय है। टोकन: {{token_number}}.",
    variables: ["patient_name", "doctor_name", "appointment_date", "appointment_time", "token_number"],
    status: "pending-meta",
    updatedAt: iso(2 * day),
  },
  {
    id: "t3",
    name: "Appointment reminder",
    trigger: "appointment_reminder",
    channels: ["sms", "whatsapp"],
    language: "English",
    body: "Reminder: {{patient_name}}, your appointment is tomorrow at {{appointment_time}} with {{doctor_name}}. Reply STOP to opt out.",
    variables: ["patient_name", "appointment_time", "doctor_name"],
    status: "active",
    metaApprovalAt: iso(60 * day),
    updatedAt: iso(30 * day),
  },
  {
    id: "t4",
    name: "Prescription ready",
    trigger: "consult_complete",
    channels: ["whatsapp"],
    language: "English",
    body: "Hi {{patient_name}}, your prescription from {{doctor_name}} is ready. Download: {{payment_link}}",
    variables: ["patient_name", "doctor_name", "payment_link"],
    status: "active",
    metaApprovalAt: iso(50 * day),
    updatedAt: iso(20 * day),
  },
  {
    id: "t5",
    name: "Radiology report ready",
    trigger: "report_ready",
    channels: ["whatsapp", "email"],
    language: "English",
    body: "{{patient_name}}, your radiology report is now available. Collect from the reception or download via the link sent separately.",
    variables: ["patient_name"],
    status: "active",
    metaApprovalAt: iso(45 * day),
    updatedAt: iso(15 * day),
  },
  {
    id: "t6",
    name: "IPD admission confirmation",
    trigger: "ipd_admission",
    channels: ["whatsapp", "sms"],
    language: "English",
    body: "{{patient_name}} has been admitted to {{hospital_name}}. Care team will share updates here.",
    variables: ["patient_name", "hospital_name"],
    status: "active",
    metaApprovalAt: iso(70 * day),
    updatedAt: iso(35 * day),
  },
  {
    id: "t7",
    name: "IPD running bill alert",
    trigger: "ipd_bill_alert",
    channels: ["whatsapp"],
    language: "English",
    body: "Dear attendant, current IPD bill for {{patient_name}} is ₹{{amount}}. Please visit billing.",
    variables: ["patient_name", "amount"],
    status: "active",
    metaApprovalAt: iso(20 * day),
    updatedAt: iso(10 * day),
  },
  {
    id: "t8",
    name: "Discharge summary",
    trigger: "discharge",
    channels: ["whatsapp", "email"],
    language: "English",
    body: "{{patient_name}} has been discharged. Discharge summary attached. Wishing a speedy recovery.",
    variables: ["patient_name"],
    status: "active",
    metaApprovalAt: iso(15 * day),
    updatedAt: iso(5 * day),
  },
  {
    id: "t9",
    name: "Payment due",
    trigger: "payment_due",
    channels: ["sms", "whatsapp"],
    language: "English",
    body: "{{patient_name}}, an amount of ₹{{amount}} is due. Pay securely: {{payment_link}}",
    variables: ["patient_name", "amount", "payment_link"],
    status: "active",
    metaApprovalAt: iso(25 * day),
    updatedAt: iso(12 * day),
  },
  {
    id: "t10",
    name: "Payment received",
    trigger: "payment_received",
    channels: ["whatsapp", "sms"],
    language: "English",
    body: "Receipt: ₹{{amount}} received from {{patient_name}}. Thank you — {{hospital_name}}.",
    variables: ["amount", "patient_name", "hospital_name"],
    status: "inactive",
    updatedAt: iso(70 * day),
  },
];

const types = ["appointment", "report", "payment", "discharge", "preauth", "other"] as const;
const channels = ["whatsapp", "sms", "email"] as const;
const statuses = ["delivered", "delivered", "delivered", "delivered", "failed", "pending"] as const;
const patients = [
  { uid: "UID-1001", name: "Arjun Singh" },
  { uid: "UID-1002", name: "Priya Sharma" },
  { uid: "UID-1003", name: "Rohan Verma" },
  { uid: "UID-1004", name: "Meera Nair" },
  { uid: "UID-1005", name: "Saurav Khan" },
  { uid: "UID-1006", name: "Lata Rao" },
  { uid: "UID-1007", name: "Vikram Joshi" },
];
const previews: Record<string, string> = {
  appointment: "Your appointment with Dr. Mehta is confirmed for tomorrow at 10:30 AM.",
  report: "Your radiology report is now available. Please collect from reception.",
  payment: "An amount of ₹4,200 is due. Tap to pay securely.",
  discharge: "Discharge summary attached. Wishing a speedy recovery.",
  preauth: "Pre-authorisation status updated by Star Health.",
  other: "Reminder from the hospital about your next visit.",
};

export const mockNotifications: NotificationEntry[] = Array.from({ length: 32 }).map((_, i) => {
  const p = patients[i % patients.length];
  const t = types[i % types.length];
  const c = channels[i % channels.length];
  const s = statuses[i % statuses.length];
  const offset = i * 3.7 * 60 * 60 * 1000;
  return {
    id: `n${i + 1}`,
    at: iso(offset),
    patientUid: p.uid,
    patientName: p.name,
    type: t,
    channel: c,
    preview: previews[t],
    body: previews[t] + " (auto-generated demo payload)",
    status: s,
    deliveredAt: s === "delivered" ? iso(offset - 30_000) : undefined,
    failureReason: s === "failed" ? "Recipient mobile not on WhatsApp" : undefined,
  };
});