# Hospitrix

**Modern Hospital Management System**

A comprehensive, production-ready HMS built with React, TypeScript, and TanStack Router.

---

## 🏥 What is Hospitrix?

Hospitrix is a complete hospital management software designed for Indian hospitals. It handles:

- **Patient Registration** - Complete demographics + medical history
- **OPD Management** - Appointments, queue, consultations, prescriptions
- **IPD/Ward Management** - Admissions, vitals, nursing notes, MAR, discharge
- **Radiology** - Orders, worklist, DICOM viewer integration, structured reporting
- **Billing & Revenue** - Invoices, payments, TPA claims
- **Notifications** - Real-time alerts for clinical staff
- **Administration** - Users, departments, rates, audit logs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/wieserpetroleum-cell/HMS-system.git
cd HMS-system

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Login Credentials (Demo)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | `doctor` | `doctor123` |
| Nurse | `nurse` | `nurse123` |
| Reception | `reception` | `reception123` |
| Billing | `billing` | `billing123` |
| Radiologist | `radiologist` | `radiologist123` |

---

## 📦 Tech Stack

- **Frontend:** React 18 + TypeScript
- **Routing:** TanStack Router (file-based, type-safe)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context API
- **Build Tool:** Vite

---

## 🏗️ Project Structure

```
src/
├── routes/              # File-based routing
│   ├── _authenticated/  # Protected routes (all 45 screens)
│   ├── login.tsx        # Login page
│   └── __root.tsx       # Root layout with providers
├── components/          # Reusable UI components
│   ├── layout/          # Sidebar, topbar, shell
│   ├── dashboard/       # KPI cards, charts
│   ├── forms/           # Form components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── stores/          # Context providers (10 domain stores)
│   ├── mock/            # Seed data for development
│   ├── validation/      # Zod schemas
│   └── types.ts         # TypeScript types
└── styles.css           # Tailwind CSS + design tokens
```

---

## 🎯 Features

### ✅ Complete Workflows
- Patient Registration → OPD Consultation → Prescription → Billing
- Admission → Ward Care → Vitals Tracking → Discharge → Final Bill
- Radiology Order → Scan → Report → Verification
- Invoice → Payment Collection → TPA Claim Processing

### ✅ Role-Based Access
8 different dashboards tailored for each role:
- Admin, Doctor, Nurse, Reception, Billing, TPA, Radiologist, Rad Tech

### ✅ Clinical Features
- 7-section patient registration
- Appointment booking with token system
- Complete OPD consultation workspace
- IPD charts with vitals, nursing notes, MAR, I/O tracking
- Structured radiology reporting
- Comprehensive billing with TPA integration

### ✅ Production-Ready
- Type-safe throughout (full TypeScript)
- Form validation (Zod schemas)
- Keyboard shortcuts (Cmd+1-6, Cmd+Enter)
- Responsive design
- Error handling with toast notifications

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Build for Production

```bash
npm run build
# or
bun run build

# Output in dist/ directory
```

---

## 🔧 Configuration

### Hospital Settings

Configure your hospital details in the admin panel:
- Navigate to **Admin → Hospital Settings**
- Update hospital name, address, contact details
- Upload logo
- Configure billing and appointment settings

### User Management

Add users and assign roles:
- Navigate to **Admin → User Management**
- Create users with appropriate roles
- Set department assignments
- Configure permissions

---

## 🗄️ Backend Integration

Currently, Hospitrix uses mock data (Context API). To connect to a real backend:

1. Replace store functions with API calls
2. Add authentication tokens
3. Connect to PostgreSQL/MySQL database
4. Deploy API server

Example:
```typescript
// Before (mock)
const addPatient = (data) => {
  setPatients([...patients, { id: uuid(), ...data }]);
};

// After (API)
const addPatient = async (data) => {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const patient = await res.json();
  setPatients([...patients, patient]);
};
```

---

## 📄 License

Proprietary - All Rights Reserved

---

## 📞 Support

For support, contact: [your-email@example.com]

---

**Built with ❤️ for Indian healthcare**
