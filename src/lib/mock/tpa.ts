import type { TpaClaim } from "@/lib/types";

export const mockTpaClaims: TpaClaim[] = [
  { id:"c1", patient:"Rajendra Prasad", ipNo:"IPD-0143", tpa:"MediAssist",    policy:"MA-001234", admissionDate:"12 Nov", preAuth:"Approved ₹85,000", status:"pre-auth-approved", days:4,  amount:85000 },
  { id:"c2", patient:"Harish Patel",    ipNo:"IPD-0141", tpa:"Star Health",   policy:"SH-556677", admissionDate:"09 Nov", preAuth:"Queried",          status:"queried",           days:7,  amount:62000 },
  { id:"c3", patient:"Priya Agarwal",   ipNo:"IPD-0139", tpa:"ICICI Lombard", policy:"IC-998812", admissionDate:"11 Nov", preAuth:"Approved ₹45,000", status:"claim-submitted",   days:5,  amount:45000 },
  { id:"c4", patient:"Ravi Teja",       ipNo:"IPD-0137", tpa:"Bajaj Allianz", policy:"BA-334455", admissionDate:"08 Nov", preAuth:"Pending",          status:"pre-auth-pending",  days:8,  amount:0     },
];
