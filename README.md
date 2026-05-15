# HMS System — Hospital Management System

Production codebase for the MEDICORE.OS multi-role Hospital Management System.

## Two-repo workflow

| Repo | Purpose |
|---|---|
| `wellspring-ward-web` | Lovable design repo — screens and UI only |
| `HMS-system` (this repo) | Production app — wired, routed, state-managed |

Lovable builds screens → Claude wires them → pushes here.  
Never edit this repo in Lovable.

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **TanStack Router** (file-based routing)
- **TanStack Query** (server state)
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (client state — added Phase 2)

## Roles and demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@medicore.os | admin123 |
| Doctor | doctor@medicore.os | doctor123 |
| Receptionist | reception@medicore.os | reception123 |
| Nurse | nurse@medicore.os | nurse123 |
| Billing | billing@medicore.os | billing123 |
| TPA Coordinator | tpa@medicore.os | tpa123 |
| Radiologist | radiologist@medicore.os | radio123 |
| Radiology Tech | radtech@medicore.os | radtech123 |

## Getting started

```bash
npm install
npm run dev
```

## Screens built (41 total)

### ✅ Done
- [x] Screen 01 — Login
- [x] Screen 02 — Forgot Password
- [x] Screen 03 — Receptionist Dashboard
- [x] Screen 04 — Doctor Dashboard
- [x] Screen 05 — Nurse/Ward Dashboard
- [x] Screen 06 — Billing Dashboard
- [x] Screen 07 — Admin Dashboard
- [x] Screen 07b — TPA Dashboard
- [x] Screen 07c — Radiologist Dashboard
- [x] Screen 07d — Radiology Tech Dashboard
- [x] Layout Shell (Sidebar + Topbar)

### 🔜 Next
- [ ] Screen 08 — Patient Registration
- [ ] Screen 09 — Patient Search
- [ ] Screen 10 — Patient Profile
- [ ] Screen 11 — Appointment Booking
- [ ] Screen 12 — OPD Queue
...and 31 more

## Project structure

```
src/
├── components/
│   ├── layout/         # AppLayout, AppSidebar, AppTopbar
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── auth-context.tsx
│   ├── types.ts
│   ├── utils.ts
│   └── mock/           # Realistic mock data (replaced by API in Phase 2)
│       ├── users.ts
│       ├── patients.ts
│       └── dashboard-data.ts
└── routes/
    ├── __root.tsx
    ├── index.tsx
    ├── login.tsx
    ├── forgot-password.tsx
    └── _authenticated/
        └── dashboard.tsx   # Role-based dashboard router
```
