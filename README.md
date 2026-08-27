# Legal Metrology Online Verification System (LMOVS)

> **Smart India Hackathon (SIH) Project** — *Development of an Online Verification System for Weighing and Measuring Instruments*

A unified, secure, digital platform for the **online verification, certification, and lifecycle management** of weighing and measuring instruments across India, built for the **Ministry of Consumer Affairs, Food & Public Distribution — Department of Consumer Affairs (DoCA)**.

It replaces paper-ledger, jurisdiction-siloed verification workflows under the **Legal Metrology Act, 2009** and the **Legal Metrology (General) Rules, 2011** with a transparent, centrally monitored system accessible to every stakeholder.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Vision & Stakeholders](#vision--stakeholders)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Roles & Access Control](#roles--access-control-rbac)
- [Certificate Lifecycle & Security](#certificate-lifecycle--security)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Team & Acknowledgement](#team--acknowledgement)

---

## Problem Statement

Under the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011, every weighing and measuring instrument used in commercial transaction or protection must be periodically **verified and stamped** before use. Verification is carried out by **Legal Metrology Officers (LMOs)** of State Legal Metrology Departments and **Government Approved Test Centres (GATCs)**.

Today this process is heavily manual — physical applications, isolated local record systems, paper certificates — leading to:

- Delays in verification and absence of a central source of truth.
- No digital, tamper-evident certificates; easy loss or forgery of physical copies.
- No automated re-verification reminders, causing unintentional non-compliance.
- No transparency for businesses on application status, and no easy way for the public to verify an instrument.
- Jurisdictional silos across states hindering national compliance monitoring.

**LMOVS** delivers a single platform for online registration, application, scheduling, digital inspection, QR-enabled certificate issuance, public verification, and automated expiry alerts.

---

## Vision & Stakeholders

**Vision:** A transparent, efficient, fully digitized legal metrology compliance ecosystem that protects consumers and simplifies regulatory adherence for businesses.

**Mission:** Transition instrument verification and stamping from a manual, paper-based process to a seamless, centrally monitored online system accessible to all stakeholders.

| Stakeholder | Role in LMOVS |
| :--- | :--- |
| **Super Admin (DoCA)** | Central oversight; manages State Admins, fee structures, national analytics. |
| **State Admin** | Manages LMOs, GATCs, and business approvals within an assigned state. |
| **Legal Metrology Officer (LMO)** | Conducts field inspections, records results, issues digital certificates. |
| **Government Approved Test Centre (GATC)** | Approved third-party facility performing verifications. |
| **Business Owner / Instrument User** | Registers instruments, applies for verification, tracks status, downloads certificates. |
| **Public User** | Verifies certificate authenticity via QR scan or certificate number. |

---

## Key Features

**Must-Have (MVP)**

- Role-based authentication with Email/Password and Mobile OTP verification.
- Business, instrument, and application registration workflows.
- Verification scheduling and assignment to LMOs/GATCs.
- Digital inspection form with observations, photos, signature, and pass/fail result.
- Automatic digital certificate generation with **QR code** and **SHA-256 tamper hash**.
- Secure certificate repository (view / download / print / revoke).
- Public QR & certificate-number verification portal.
- Role-specific dashboards with analytics (Recharts).
- Automated expiry alerts (Email/SMS/in-app) at 30 / 15 / 7 days.
- Document & photo upload, search/filter, CSV/PDF export.

**Implemented Beyond MVP (present in codebase)**

- **Grievance / Complaint module** (`Grievance` model + public & admin complaint pages).
- **Bulk instrument upload** via CSV (template + validation preview).
- **Multi-language UI store** (`useLanguageStore`).
- **Offline-capable field mode** for LMOs (`offline-sync` lib, `lmo/field-mode`).
- **Audit logging** across significant actions.
- **Fee rules engine** with state-level overrides.

**Documented Post-MVP (design-phase)**

- Integrated payment gateway (Bharatkosh), Aadhaar/DigiLocker, advanced analytics, GPS capture, API integration.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | **Next.js 14** (App Router) + **TypeScript** |
| UI | **Tailwind CSS** + Shadcn/UI-style primitives, **lucide-react**, **framer-motion** |
| State | **Zustand** (auth, language, notifications stores) |
| Validation | **React Hook Form** + **Zod** |
| Database | **PostgreSQL** (via **Supabase**) + **Prisma** ORM |
| Auth | **Supabase Auth** (JWT, httpOnly cookies) + **Firebase Phone Auth** (SMS OTP) |
| Storage | **Supabase Storage** (instrument photos, documents, certificate PDFs) |
| QR Codes | **qrcode** |
| PDF Generation | **jsPDF** + **jspdf-autotable** |
| Email | **Resend** |
| Charts | **Recharts** |
| CSV | **papaparse** |
| Dates | **date-fns** |

> Note: Architecture documentation references `@react-pdf/renderer` / `Puppeteer`; the implementation uses **jsPDF** for server-side certificate PDF generation. The README reflects the implemented stack.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client (Next.js 14 App Router, Tailwind, Shadcn/UI)         │
│  - Auth pages · Role dashboards · Public verify portal       │
└───────────────┬───────────────────────────┬─────────────────┘
                │ tRPC-style API routes       │ Supabase Auth
                ▼                             ▼
┌──────────────────────────────┐   ┌─────────────────────────────┐
│  Next.js API Layer (Routes)  │   │  Supabase (Postgres)        │
│  - auth, applications, lmo,  │   │  - JWT verification         │
│    certificates, cron, etc.  │   │  - Storage buckets          │
│  - Zod validation per route  │   │  - RLS (defense-in-depth)   │
│  - RBAC + Prisma scoping     │   │  - AES-256 encryption       │
└───────────────┬──────────────┘   └─────────────────────────────┘
                │
                ▼
        ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
        │  Prisma Client    │   │  Firebase Phone  │   │  Resend (Email)  │
        │  (PostgreSQL)     │   │  Auth (SMS OTP)  │   │  + SMS Gateway    │
        └──────────────────┘   └──────────────────┘   └──────────────────┘
```

### Database (PostgreSQL / Prisma)

16 core models: `User`, `State`, `District`, `Business`, `Instrument`, `Application`, `VerificationSchedule`, `VerificationResult`, `Certificate`, `Notification`, `AlertSchedule`, `Document`, `AuditLog`, `GatcProfile`, `LmoProfile`, `Fee`, plus `Grievance`.

Highlights:

- Enums for roles, instrument/application/certificate statuses, alert channels.
- Unique constraint on `(businessId, serialNumber, model, make)` to prevent duplicate instruments.
- Certificates carry `certificateNumber`, `verificationToken`, and `sha256Hash` for tamper detection.
- Full audit trail via `AuditLog`.

See [`prisma/schema.prisma`](Frontend/prisma/schema.prisma) and the ER diagram in [`architecture.md`](architecture.md).

---

## Roles & Access Control (RBAC)

Authorization is enforced **on the server** via API route guards (`getSessionFromRequest`) plus Prisma query scoping by role/state/business, with a database-layer RLS policy file (`supabase/rls-policies.sql`) provided as defense-in-depth.

| Capability | Super Admin | State Admin | LMO | GATC | Business | Public |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| National dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| State dashboard | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Manage LMOs / GATCs | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Approve businesses | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ |
| Submit applications | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Conduct verification | ❌ | ❌ | ✅† | ✅† | ❌ | ❌ |
| Generate certificate | ❌ | ❌ | ✅† | ✅† | ❌ | ❌ |
| View/Download own certs | ✅ | ✅* | ✅† | ✅† | ✅ | ❌ |
| Public certificate verify | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

\* Own state/jurisdiction only. † Assigned applications only.

---

## Certificate Lifecycle & Security

1. **Issuance** — On a `pass` result, the system generates a certificate with a standardized number `STATE_CODE/YEAR/INSTRUMENT_TYPE/SERIAL` (e.g., `MH/2025/WS/000001`).
2. **Tamper Evidence** — A **SHA-256 hash** of core certificate data is stored; public verification recalculates and compares it.
3. **QR Code** — Encodes a secure, unguessable URL containing the `verificationToken`; scanning opens the public verify page.
4. **Public Verification** — `/verify/[certificateId]` returns validity (Valid / Expired / Revoked) and basic instrument details without exposing PII.
5. **Revocation** — A dedicated revoke workflow updates status immediately on the public endpoint.
6. **Alerts** — A daily cron (`/api/cron/expiry-alerts`) queues Email/SMS/in-app reminders at 30/15/7 days before expiry.

Security controls include httpOnly JWT cookies, rate limiting (authenticated 100/min, unauthenticated 20/min), Zod input validation, parameterized queries via Prisma, CSP/security headers, AES-256 encryption at rest and TLS 1.3 in transit, and account lockout after 5 failed logins. Full detail in [`security.md`](security.md).

---

## Project Structure

```
SIH/
├── architecture.md          # Tech stack, DB schema, ER diagram, env, deployment
├── frontend.md             # Design system, layouts, API/integration spec
├── security.md             # Auth, RBAC, RLS, API & data security, edge cases
├── prd.md                  # Product Requirements Document
├── feature-tickets.md      # Module-by-module feature tickets (LMOVS-001 …)
├── PS26.txt                # Source problem statement (SIH PS ID 26)
└── Frontend/               # Next.js 14 application
    ├── prisma/             # schema.prisma (database blueprint)
    ├── public/             # static assets
    ├── src/
    │   ├── app/            # routes: (auth), (dashboard), (public), api
    │   ├── components/     # ui, forms, dashboard, certificates, shared, auth
    │   ├── lib/            # supabase, prisma, auth, rbac, pdf, qr, crypto-hash, sms, email
    │   ├── stores/         # zustand stores
    │   ├── hooks/          # custom hooks
    │   ├── types/          # global types
    │   └── validations/    # zod schemas
    └── tests / *.mjs       # endpoint test scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Supabase** project (PostgreSQL + Auth + Storage)
- A **Firebase** project (Phone Auth for SMS OTP)
- A **Resend** account (transactional email)
- *(Dev only)* Mock SMS can be enabled to skip real OTP delivery

### Local Setup

```bash
# 1. Clone and enter the frontend app
cd Frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
#    fill in Supabase, Firebase, Resend, and secrets (see below)

# 4. Apply database schema
npx prisma generate
npx prisma db push        # or: npx prisma migrate dev

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Configuration

Required variables (see [`Frontend/.env.example`](Frontend/.env.example)):

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` / `DIRECT_URL` | Supabase PostgreSQL connection (pooled + direct) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin key (never expose) |
| `NEXTAUTH_SECRET` / `JWT_SECRET` | Session & token signing secrets |
| `NEXTAUTH_URL` | Base auth URL (e.g., `http://localhost:3000`) |
| `CRON_SECRET` | Secret to secure scheduled cron endpoints |
| `ENABLE_MOCK_SMS` | `true` to log OTPs instead of sending SMS |
| `SMS_GATEWAY_API_KEY` / `SMS_SENDER_ID` | SMS provider credentials |
| `RESEND_API_KEY` / `FROM_EMAIL` | Email delivery |

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint with ESLint |

Database:

```bash
npx prisma generate     # regenerate client
npx prisma db push      # sync schema to database
npx prisma studio       # browse data locally
```

---

## Deployment

- **Staging:** Vercel with a staging Supabase instance (anonymized data).
- **Production:** Must run on **Government Cloud (NIC)** or a MeitY-empanelled provider (AWS India / Azure India) to satisfy data-localization and hosting policy. Containerized via Docker/Kubernetes; managed PostgreSQL in-region.
- **Backups:** Daily encrypted snapshots + Point-in-Time Recovery (WAL); geographically redundant within India.
- **CI/CD:** GitHub Actions — type-check, lint, and unit tests on PR; staging auto-deploy on `main`; production requires manual approval. Security scanning (Snyk / SonarQube) in pipeline.

See [`architecture.md → Deployment Notes`](architecture.md) for full details.

---

## Documentation

| Document | Contents |
| :--- | :--- |
| [`prd.md`](prd.md) | Product overview, problem statement, features, user flows, KPIs |
| [`architecture.md`](architecture.md) | Tech stack, file structure, full DB schema, ER diagram, env, deployment |
| [`frontend.md`](frontend.md) | Design system, color/typography, layouts, integration specs |
| [`security.md`](security.md) | Auth, RBAC matrix, RLS policies, API/data security, 25 edge cases, launch checklist |
| [`feature-tickets.md`](feature-tickets.md) | Module-by-module feature tickets (LMOVS-001 …) |
| [`PS26.txt`](PS26.txt) | Original SIH problem statement |

---

## Team & Acknowledgement

Built as a submission for the **Smart India Hackathon** under the problem statement *"Development of an Online Verification System for Weighing and Measuring Instruments"* (Ministry of Consumer Affairs, Food & Public Distribution — Department of Consumer Affairs).

> This repository is a hackathon/prototype implementation. Production deployment requires completion of the security launch checklist in [`security.md`](security.md) (VAPT, CERT-In compliance, applying/testing `supabase/rls-policies.sql` on a non-service-role connection, and NIC hosting).

---

<p align="center">
  <sub>Legal Metrology Online Verification System · LMOVS · Smart India Hackathon</sub>
</p>
