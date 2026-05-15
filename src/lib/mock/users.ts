import type { User } from "@/lib/types";

export const mockUsers: Array<User & { password: string }> = [
  { id:"u_admin",  name:"Dr. Elena Rossi",   email:"admin@medicore.os",        role:"admin",        title:"Hospital Administrator",          department:"Administration", password:"admin123"     },
  { id:"u_doc",    name:"Dr. Rajesh Kumar",  email:"doctor@medicore.os",       role:"doctor",       title:"Consultant — Internal Medicine",  department:"General Medicine",password:"doctor123"    },
  { id:"u_rec",    name:"Priya Nair",        email:"reception@medicore.os",    role:"receptionist", title:"Senior Receptionist",             department:"Front Office",   password:"reception123" },
  { id:"u_nurse",  name:"Sunita Sharma",     email:"nurse@medicore.os",        role:"nurse",        title:"Head Nurse — General A",          department:"Ward A",         password:"nurse123"     },
  { id:"u_bill",   name:"Amit Verma",        email:"billing@medicore.os",      role:"billing",      title:"Billing Manager",                 department:"Finance",        password:"billing123"   },
  { id:"u_tpa",    name:"Kavitha Reddy",     email:"tpa@medicore.os",          role:"tpa",          title:"TPA Coordinator",                 department:"Insurance",      password:"tpa123"       },
  { id:"u_radio",  name:"Dr. Sanjay Mehta",  email:"radiologist@medicore.os",  role:"radiologist",  title:"Consultant Radiologist",          department:"Radiology",      password:"radio123"     },
  { id:"u_rtech",  name:"Ravi Pillai",       email:"radtech@medicore.os",      role:"radtech",      title:"Radiology Technician",            department:"Radiology",      password:"radtech123"   },
];
