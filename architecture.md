# Architecture Document: Legal Metrology Online Verification System (LMOVS)

This document outlines the architecture, technology stack, database design, and operational requirements for the Legal Metrology Online Verification System (LMOVS). The platform facilitates online verification, digital certification, and lifecycle management of weighing and measuring instruments.

---

## 1. Tech Stack with Reasoning

The following technologies have been chosen to provide a scalable, secure, and maintainable platform that meets modern government software standards.

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend Framework | **Next.js 14 (App Router)** with TypeScript | Server-side rendering improves performance and search visibility. The App Router simplifies complex dashboard routing. TypeScript prevents many common runtime errors, leading to a more robust application. |
| UI Library | **Tailwind CSS + Shadcn/UI** | Tailwind allows for rapid styling without leaving the HTML. Shadcn/UI provides pre-built, accessible components that look professional and are easy to customize for a government portal, saving development time. |
| State Management | **Zustand** | It provides a very simple and lightweight way to manage application state (like user sessions or temporary form data) across different pages without the heavy boilerplate code required by older tools like Redux. |
| Backend / API | **Next.js API Routes + tRPC** | Keeping the backend API within Next.js reduces the complexity of managing a separate server. tRPC ensures that the data types sent from the backend exactly match what the frontend expects, eliminating a whole category of bugs. |
| Database | **PostgreSQL (via Supabase)** | PostgreSQL is a highly reliable relational database, perfect for structured government data. Supabase adds essential features like Row Level Security (ensuring users only see their own data), real-time updates, and managed backups out of the box. |
| ORM | **Prisma** | Prisma translates database queries into plain TypeScript code. This means developers can interact with the database safely and easily without writing raw SQL, and it handles database structural changes (migrations) smoothly. |
| Authentication | **Supabase Auth + Firebase Phone Auth** | Supabase Auth provides secure, ready-to-use session management, password hashing, and RLS integration. Firebase Phone Auth handles phone number verification and SMS OTP delivery (with 10,000 free SMS/month and zero telecom DLT setup overhead). |
| File Storage | **Supabase Storage** | A secure place to store uploaded files like instrument photos and PDF certificates. It ties directly into Supabase Auth, meaning we can restrict file access based on user roles easily. |
| QR Code Generation | **qrcode library (npm)** | A simple, reliable tool to generate QR codes. These codes will be embedded on digital certificates, allowing anyone to scan them and instantly verify the certificate's authenticity on the platform. |
| PDF Generation | **@react-pdf/renderer or Puppeteer** | Needed to create high-quality, printable digital certificates. @react-pdf allows us to design PDFs using React components, making it easier to match the web application's design. |
| Email Notifications | **Resend** | A modern, developer-friendly email service. It allows us to build HTML emails using React, ensuring alerts and notifications look great on all devices and are delivered reliably. |
| SMS / Phone Verification | **Firebase Phone Auth (or C-DAC / NIC Gateway)** | Handles phone OTP verification during registration and login with 10,000 free monthly SMS. In local development, a mock OTP provider is used; in production, official NIC/C-DAC Mobile Seva can be plugged in. |
| Deployment | **Vercel or Government Cloud (NIC)** | Vercel provides incredibly fast, automated deployments for testing and staging. For production, deploying to the National Informatics Centre (NIC) cloud ensures data sovereignty and compliance with government hosting policies. |
| Cron Jobs | **Vercel Cron or node-cron** | These act as automated background workers. They run on a schedule to check for tasks like "which certificates expire in 30 days" and automatically trigger the necessary email or SMS alerts. |
| Charts/Analytics | **Recharts** | A library that makes it easy to build interactive graphs and charts. This will be used to build insightful dashboards for Super Admins and State Admins to monitor verification statistics. |
| Form Handling | **React Hook Form + Zod** | Managing complex forms (like instrument registration) can be slow. React Hook Form makes forms fast. Zod ensures that the data users type into the form is exactly in the format we expect before it's sent to the server. |
| Search | **PostgreSQL Full-Text Search** | Built directly into our database, this allows users to search across certificates and businesses quickly. It avoids the cost and complexity of setting up a separate search engine like Elasticsearch while providing excellent performance. |

---

## 2. Complete Project File & Folder Structure

The project follows a standard Next.js App Router structure, enhanced for a full-stack TypeScript application.

```
lmovs/
├── .env.local                  # Local environment variables (secrets, DB URLs) - never committed to git
├── .env.example                # Template of required environment variables for new developers
├── next.config.ts              # Configuration settings for the Next.js framework
├── package.json                # Lists all project dependencies (libraries) and basic scripts
├── tsconfig.json               # Rules for the TypeScript compiler
├── tailwind.config.ts          # Design system configuration (colors, fonts) for Tailwind CSS
├── prisma/                     # Database ORM directory
│   ├── schema.prisma           # The master blueprint of our database tables
│   └── migrations/             # History of changes made to the database structure over time
├── public/                     # Static assets accessible directly via URL
│   ├── images/                 # Logos, default avatars, background images
│   └── icons/                  # SVG icons used across the app
├── src/                        # Main source code directory
│   ├── app/                    # Next.js App Router root (defines all pages and routes)
│   │   ├── (auth)/             # Grouped routes for authentication (login, signup) - URL ignores '(auth)'
│   │   │   ├── login/          # Login page for all roles
│   │   │   ├── register/       # Registration page for new businesses
│   │   │   └── verify-otp/     # Page to enter OTP sent via SMS/Email
│   │   ├── (dashboard)/        # Grouped routes for authenticated dashboards
│   │   │   ├── admin/          # Super Admin dashboard and management tools
│   │   │   ├── state-admin/    # State-level reporting and management
│   │   │   ├── lmo/            # Legal Metrology Officer workspace (view assigned tasks)
│   │   │   ├── gatc/           # Government Approved Test Centre workspace
│   │   │   └── business/       # Business owner portal to manage their instruments
│   │   ├── (public)/           # Publicly accessible pages without login
│   │   │   ├── verify/[certificateId]/ # Dynamic route to verify a specific certificate via QR scan
│   │   │   └── search/         # Public search for GATCs or verified businesses
│   │   ├── api/                # Backend API routes
│   │   │   ├── trpc/[trpc]/    # Catch-all route for tRPC requests
│   │   │   ├── webhooks/       # Endpoints to receive automatic updates from external services (e.g., payment gateways)
│   │   │   └── cron/           # Endpoints triggered by automated scheduled tasks (e.g., expiry alerts)
│   │   ├── layout.tsx          # The master HTML layout that wraps every page
│   │   └── page.tsx            # The main landing/home page of the website
│   ├── components/             # Reusable UI building blocks
│   │   ├── ui/                 # Primitive components from Shadcn/UI (buttons, inputs, dialogs)
│   │   ├── forms/              # Complex form components (e.g., InstrumentRegistrationForm)
│   │   ├── dashboard/          # Specialized components for dashboards (charts, stat cards)
│   │   ├── certificates/       # Components specifically for rendering and previewing certificates
│   │   └── shared/             # Components used everywhere (Navbar, Footer, Sidebar)
│   ├── lib/                    # Core logic, utilities, and integrations
│   │   ├── supabase/           # Configuration to connect to Supabase (Auth & Storage)
│   │   ├── firebase.ts         # Firebase Client SDK for phone OTP verification
│   │   ├── firebase-admin.ts   # Firebase Admin SDK for server-side token validation
│   │   ├── prisma.ts           # Singleton database connection to prevent connection exhaustion
│   │   ├── trpc/               # tRPC client and server setup files
│   │   ├── utils.ts            # General helper functions (e.g., formatting dates, currencies)
│   │   ├── qr-code.ts          # Logic to generate and decode QR codes
│   │   ├── pdf-generator.ts    # Logic to assemble and render PDF files
│   │   ├── email.ts            # Functions to send emails using Resend
│   │   ├── sms.ts              # Unified SMS/OTP utility (Firebase Phone Auth / Mock provider)
│   │   └── constants.ts        # Hardcoded values (e.g., role names, status codes)
│   ├── server/                 # Backend business logic (tRPC routers)
│   │   ├── routers/            # Grouped backend functions
│   │   │   ├── auth.ts         # Logic for login, signup, permissions
│   │   │   ├── instruments.ts  # Logic for adding, editing, listing instruments
│   │   │   ├── applications.ts # Logic for submitting and routing verification applications
│   │   │   ├── verification.ts # Logic for recording test results
│   │   │   ├── certificates.ts # Logic for generating and retrieving certificates
│   │   │   ├── users.ts        # Logic for managing user accounts and roles
│   │   │   └── dashboard.ts    # Logic for aggregating data for dashboard charts
│   │   ├── trpc.ts             # tRPC initialization and context definition
│   │   └── root.ts             # The master router combining all individual routers
│   ├── hooks/                  # Custom React hooks (e.g., useAuth, useGeolocation)
│   ├── stores/                 # Zustand state stores (e.g., useCartStore for fee payments)
│   ├── types/                  # Global TypeScript interfaces and type definitions
│   ├── validations/            # Zod schemas used to validate form data and API inputs
│   └── styles/                 # Global CSS files
│       └── globals.css         # Main stylesheet including Tailwind directives
└── tests/                      # Automated test files (unit and integration tests)
```

---

## 3. Complete Database Schema

The database is built on PostgreSQL.

### Tables

#### 1. users
- **Purpose**: Central table for all individuals logging into the system.
- **Columns**:
  - `id` (UUID, Primary Key): Unique identifier.
  - `email` (String, Unique): User's email address.
  - `phone` (String, Unique): User's phone number for SMS.
  - `password_hash` (String): Securely hashed password.
  - `full_name` (String): Full name of the user.
  - `role` (Enum): Type of user (`super_admin`, `state_admin`, `lmo`, `gatc`, `business_owner`, `public`).
  - `state_id` (UUID, Foreign Key, Nullable): Links to the state they operate in.
  - `district` (String, Nullable): District name.
  - `address` (Text, Nullable): Full address.
  - `is_active` (Boolean, Default: true): Soft delete flag.
  - `is_verified` (Boolean, Default: false): Whether their email/phone is verified.
  - `created_at` (Timestamp), `updated_at` (Timestamp).
- **Relationships**: Belongs to a State. One user can have one Business, GATC Profile, or LMO Profile. One user can be assigned many Applications.

#### 2. states
- **Purpose**: Master list of Indian States and Union Territories.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `name` (String): Full state name.
  - `code` (String): Short code (e.g., MH, DL).
  - `is_active` (Boolean, Default: true).
- **Relationships**: Has many Districts. Has many Users. Has many Businesses.

#### 3. districts
- **Purpose**: Master list of districts within states.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `state_id` (UUID, Foreign Key): Links to the parent state.
  - `name` (String): District name.
  - `is_active` (Boolean, Default: true).
- **Relationships**: Belongs to a State. Has many Businesses.

#### 4. businesses
- **Purpose**: Represents the commercial entity that owns instruments needing verification.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key): Links to the user managing this business.
  - `business_name` (String): Official company name.
  - `business_type` (String): Type of business (retail, manufacturing, etc.).
  - `gstin` (String, Nullable): Goods and Services Tax number.
  - `trade_license_number` (String, Nullable).
  - `address` (Text), `city` (String), `pincode` (String).
  - `state_id` (UUID, Foreign Key), `district_id` (UUID, Foreign Key).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to a User, State, and District. Has many Instruments. Has many Applications.

#### 5. instruments
- **Purpose**: The actual physical weighing or measuring devices.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `business_id` (UUID, Foreign Key): Links to the owning business.
  - `instrument_type` (Enum): `weighing_scale`, `measuring_instrument`, `weight`, `measure`.
  - `category` (String): Specific classification.
  - `make` (String): Manufacturer.
  - `model` (String): Model number.
  - `serial_number` (String).
  - `capacity` (String): E.g., "50 kg".
  - `least_count` (String): Precision, e.g., "5 g".
  - `location_of_use` (Text): Where it is installed.
  - `installation_date` (Date, Nullable).
  - `photo_url` (String, Nullable): Link to image in storage.
  - `status` (Enum): `active`, `inactive`, `condemned`.
  - `created_at`, `updated_at` (Timestamp).
- **Relationships**: Belongs to a Business. Has many Applications. Has many Certificates.

#### 6. applications
- **Purpose**: Requests submitted by businesses for verification of an instrument.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `instrument_id` (UUID, Foreign Key): The instrument to be verified.
  - `business_id` (UUID, Foreign Key): The requesting business.
  - `applicant_user_id` (UUID, Foreign Key): The user who submitted it.
  - `application_type` (Enum): `new_verification`, `re_verification`.
  - `status` (Enum): `draft`, `submitted`, `assigned`, `scheduled`, `in_progress`, `completed`, `rejected`.
  - `assigned_to_user_id` (UUID, Foreign Key, Nullable): LMO or GATC user assigned.
  - `assigned_to_type` (Enum, Nullable): `lmo`, `gatc`.
  - `priority` (String).
  - `submitted_at` (Timestamp, Nullable).
  - `fee_amount` (Decimal), `fee_paid` (Boolean, Default: false).
  - `payment_reference` (String, Nullable).
  - `notes` (Text, Nullable).
  - `created_at`, `updated_at` (Timestamp).
- **Relationships**: Belongs to an Instrument, Business, Applicant User, and Assignee User. Has one Verification Schedule. Has one Verification Result. Has one Certificate.

#### 7. verification_schedules
- **Purpose**: Plans for physical inspection visits.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `application_id` (UUID, Foreign Key): The related application.
  - `verifier_user_id` (UUID, Foreign Key): LMO or GATC performing the visit.
  - `scheduled_date` (Date), `scheduled_time_slot` (String).
  - `actual_date` (Timestamp, Nullable).
  - `status` (Enum): `scheduled`, `completed`, `cancelled`, `rescheduled`.
  - `location` (Text).
  - `notes` (Text, Nullable).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to an Application and a Verifier User.

#### 8. verification_results
- **Purpose**: The technical data recorded during the actual inspection.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `application_id` (UUID, Foreign Key).
  - `verifier_user_id` (UUID, Foreign Key).
  - `instrument_id` (UUID, Foreign Key).
  - `verification_date` (Timestamp).
  - `test_observations` (JSONB): Flexible format to store all technical readings.
  - `result` (Enum): `pass`, `fail`, `conditional_pass`.
  - `remarks` (Text, Nullable).
  - `defects_found` (Text, Nullable).
  - `corrective_action` (Text, Nullable).
  - `photos` (Text Array): URLs to inspection photos.
  - `verifier_signature_url` (String, Nullable).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to an Application, Verifier User, and Instrument.

#### 9. certificates
- **Purpose**: The final legal digital document issued after a successful verification.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `certificate_number` (String, Unique): Formatted string (e.g., MH/2024/12345).
  - `application_id` (UUID, Foreign Key).
  - `instrument_id` (UUID, Foreign Key).
  - `business_id` (UUID, Foreign Key).
  - `issued_by_user_id` (UUID, Foreign Key).
  - `issue_date` (Timestamp).
  - `valid_from` (Date), `valid_until` (Date).
  - `qr_code_data` (Text): The raw data encoded in the QR.
  - `qr_code_url` (String): Link to generated QR image.
  - `certificate_pdf_url` (String): Link to the generated PDF.
  - `status` (Enum): `active`, `expired`, `revoked`, `superseded`.
  - `revocation_reason` (Text, Nullable).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to Application, Instrument, Business, and Issuer User.

#### 10. notifications
- **Purpose**: System messages displayed inside the web app for users.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key): The recipient.
  - `title` (String), `message` (Text).
  - `type` (Enum): `verification_due`, `application_update`, `certificate_issued`, `system_alert`.
  - `is_read` (Boolean, Default: false).
  - `related_entity_type` (String, Nullable): E.g., 'application'.
  - `related_entity_id` (UUID, Nullable).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to a User.

#### 11. alert_schedules
- **Purpose**: Queue for automated SMS/Email reminders (e.g., 30 days before expiry).
- **Columns**:
  - `id` (UUID, Primary Key)
  - `certificate_id` (UUID, Foreign Key).
  - `instrument_id` (UUID, Foreign Key).
  - `business_user_id` (UUID, Foreign Key).
  - `alert_type` (Enum): `30_days_before`, `15_days_before`, `7_days_before`, `expired`.
  - `scheduled_date` (Date).
  - `sent_at` (Timestamp, Nullable).
  - `channel` (Enum): `email`, `sms`, `in_app`.
  - `status` (Enum): `pending`, `sent`, `failed`.
  - `created_at` (Timestamp).
- **Relationships**: Belongs to Certificate, Instrument, and Business User.

#### 12. documents
- **Purpose**: Central table for all file uploads.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `uploaded_by_user_id` (UUID, Foreign Key).
  - `related_entity_type` (String): E.g., 'instrument', 'business'.
  - `related_entity_id` (UUID).
  - `document_type` (Enum): `photo`, `trade_license`, `calibration_report`, `other`.
  - `file_url` (String): Location in Supabase storage.
  - `file_name` (String), `file_size` (Integer), `mime_type` (String).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to a User.

#### 13. audit_logs
- **Purpose**: Security trail of every significant action taken in the system.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key, Nullable).
  - `action` (String): E.g., 'UPDATE_STATUS', 'LOGIN'.
  - `entity_type` (String), `entity_id` (UUID, Nullable).
  - `old_values` (JSONB, Nullable), `new_values` (JSONB, Nullable).
  - `ip_address` (String, Nullable), `user_agent` (String, Nullable).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to a User.

#### 14. gatc_profiles
- **Purpose**: Extra details specific only to GATC users.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key, Unique).
  - `centre_name` (String).
  - `registration_number` (String).
  - `accreditation_details` (Text).
  - `accreditation_valid_until` (Date).
  - `authorized_instrument_types` (Text Array): What they are allowed to test.
  - `max_capacity_per_day` (Integer).
  - `is_active` (Boolean, Default: true).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to (Extends) one User.

#### 15. lmo_profiles
- **Purpose**: Extra details specific only to LMO users.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key, Unique).
  - `employee_id` (String).
  - `designation` (String).
  - `jurisdiction_state_id` (UUID, Foreign Key).
  - `jurisdiction_districts` (Text Array): Array of district IDs they cover.
  - `is_active` (Boolean, Default: true).
  - `created_at` (Timestamp).
- **Relationships**: Belongs to (Extends) one User. Belongs to a State.

#### 16. fees
- **Purpose**: Rules engine for calculating application fees.
- **Columns**:
  - `id` (UUID, Primary Key)
  - `instrument_type` (String).
  - `instrument_category` (String).
  - `verification_type` (String): E.g., 'new', 're-verification'.
  - `fee_amount` (Decimal).
  - `effective_from` (Date), `effective_until` (Date, Nullable).
  - `state_id` (UUID, Foreign Key, Nullable): If null, applies nationally.
  - `created_at` (Timestamp).
- **Relationships**: Belongs optionally to a State.

### ER Diagram

```mermaid
erDiagram
    USERS ||--o| BUSINESSES : "owns"
    USERS ||--o| LMO_PROFILES : "has profile"
    USERS ||--o| GATC_PROFILES : "has profile"
    USERS }|--|| STATES : "belongs to"
    
    STATES ||--|{ DISTRICTS : "contains"
    STATES ||--o{ FEES : "sets"
    
    BUSINESSES }|--|| DISTRICTS : "located in"
    BUSINESSES ||--|{ INSTRUMENTS : "owns"
    
    INSTRUMENTS ||--o{ APPLICATIONS : "subject of"
    
    APPLICATIONS }|--|| USERS : "assigned to/applicant"
    APPLICATIONS ||--o| VERIFICATION_SCHEDULES : "has"
    APPLICATIONS ||--o| VERIFICATION_RESULTS : "yields"
    APPLICATIONS ||--o| CERTIFICATES : "results in"
    
    CERTIFICATES ||--o{ ALERT_SCHEDULES : "triggers"
    
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ DOCUMENTS : "uploads"
    USERS ||--o{ AUDIT_LOGS : "performs"
```

---

## 4. Environment Variables

To run this application securely, the following configurations must be provided in the server environment.

| Variable | Description |
|---|---|
| `SUPABASE_URL` | The URL of the Supabase project instance. |
| `SUPABASE_ANON_KEY` | Public key used for frontend client operations (safe to expose). |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key used ONLY on the server to bypass Row Level Security. Never expose to client. |
| `DATABASE_URL` | Connection string for Prisma to connect to the PostgreSQL database directly. |
| `NEXTAUTH_SECRET` | A long random string used to encrypt session cookies. |
| `JWT_SECRET` | Used for signing custom JSON Web Tokens if integrating with external legacy systems. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public Firebase API key for client-side Phone Auth & reCAPTCHA. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (e.g., `your-app.firebaseapp.com`). |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID. |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Private JSON credentials / string for Firebase Admin SDK token verification on server. |
| `RESEND_API_KEY` | Secret key to authenticate with the Resend email service. |
| `FROM_EMAIL` | The official email address emails will be sent from (e.g., `noreply@lmovs.gov.in`). |
| `ENABLE_MOCK_SMS` | Set to `true` in local development to log OTPs to console without sending real SMS. |
| `SUPABASE_STORAGE_BUCKET` | The name of the storage bucket for uploads (e.g., `lmovs-secure-files`). |
| `NEXT_PUBLIC_APP_URL` | The base URL of the deployed application (e.g., `https://lmovs.gov.in`). Needed for generating absolute links in emails. |
| `NEXT_PUBLIC_QR_VERIFICATION_URL` | Base URL used inside QR codes (e.g., `https://lmovs.gov.in/verify/`). |

### `.env.example` Template

```env
# Database & Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# Auth & Security
NEXTAUTH_SECRET="generate-a-random-32-char-string"
JWT_SECRET="generate-a-random-32-char-string"

# Firebase Phone Auth (Free 10,000 SMS/month)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyYourFirebaseApiKey"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="lmovs-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="lmovs-app"
FIREBASE_SERVICE_ACCOUNT_KEY='{"project_id":"...","private_key":"...","client_email":"..."}'

# Development / Mock Mode
ENABLE_MOCK_SMS="true"

# Email (Resend)
RESEND_API_KEY="re_123456789"
FROM_EMAIL="noreply@lmovs.gov.in"

# Storage
SUPABASE_STORAGE_BUCKET="lmovs-secure-files"

# App Info
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_QR_VERIFICATION_URL="http://localhost:3000/verify/"
```

---

## 5. Deployment Notes

### Development Setup
1. Developers must clone the repository and run `npm install`.
2. Copy `.env.example` to `.env.local` and fill in local development keys.
3. Ensure a local PostgreSQL or a development Supabase instance is running.
4. Run `npx prisma db push` to create the local database tables.
5. Run `npm run dev` to start the Next.js development server.

### Staging vs Production
- **Staging**: Hosted on Vercel for fast iteration. Connects to a staging database containing fake/anonymized data. Used by QA and stakeholders for testing new features before release.
- **Production**: Must be hosted in a highly secure environment, complying with data localization laws.

### Government Cloud Hosting (NIC)
Since this is a platform for the Indian Ministry of Consumer Affairs, deploying to National Informatics Centre (NIC) cloud or a MeitY-empanelled cloud provider (like AWS India, Azure India) is mandatory.
- Next.js can be exported as a standalone Node.js server.
- It will be containerized using Docker and deployed via Kubernetes on the NIC cloud for scalability.
- A managed PostgreSQL instance within the same region must be used.

### Database Backup Strategy
- **Automated Daily Backups**: Full database snapshot taken every 24 hours during low-traffic periods (e.g., 2:00 AM IST).
- **Point-in-Time Recovery (PITR)**: Enable Write-Ahead Logging (WAL) archiving to allow restoring the database to any specific minute within the last 7 days in case of catastrophic failure.
- **Geographic Redundancy**: Backups should be securely replicated to a secondary data center in a different seismic zone within India.

### CI/CD Recommendations
- Use GitHub Actions or GitLab CI.
- **Continuous Integration**: On every commit to a pull request, the pipeline should automatically run TypeScript type checking, linting, and all unit tests.
- **Continuous Deployment**: Merging to the `main` branch should trigger an automatic build and deployment to the staging environment. Production deployments should require manual approval from a release manager.
- Implement automated security scanning (e.g., SonarQube, Snyk) in the pipeline to catch vulnerabilities before they reach production.
