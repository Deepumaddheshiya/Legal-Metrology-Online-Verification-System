# 🔄 LMOVS Platform — Complete Usage Flow Guide

**Platform:** Legal Metrology Online Verification System  
**Purpose:** End-to-end digital verification, certification & lifecycle management of weighing/measuring instruments under the Legal Metrology Act, 2009

---

## Overview: The Big Picture

```mermaid
flowchart LR
    A["🏪 Business Owner\nRegisters & Adds Instruments"] --> B["📋 Submits Verification\nApplication"]
    B --> C["💳 Pays Statutory Fee"]
    C --> D["👨‍💼 State Admin\nAssigns to Officer"]
    D --> E["🔍 LMO / GATC\nConducts Inspection"]
    E --> F{"Pass / Fail?"}
    F -->|Pass| G["📜 Digital Certificate\nIssued with QR Code"]
    F -->|Fail| H["❌ Defect Notice\nSent to Business"]
    G --> I["📱 Public Citizen\nScans QR to Verify"]
    G --> J["⏰ Automated Expiry\nAlerts at 30/15/7 days"]
    J --> B
```

---

## 👥 The 6 Roles & What They Do

| Role | Who | What They Do |
|------|-----|-------------|
| **🏪 Business Owner** | Shopkeepers, traders, manufacturers | Register business + instruments, submit verification applications, pay fees, download certificates |
| **👨‍💼 State Admin** | Head of state Legal Metrology dept | Approve business registrations, assign applications to officers, monitor state compliance |
| **🔍 LMO** | Legal Metrology Officer (field inspector) | Conduct physical inspections, record test observations, issue certificates |
| **🏭 GATC** | Govt Approved Test Centre | Same as LMO — test specialized instruments and issue certificates |
| **🛡️ Super Admin** | Dept of Consumer Affairs (central govt) | National oversight, provision State Admins, manage master data, view national analytics |
| **📱 Public Citizen** | Any person | Scan QR codes to verify instrument certificates, file complaints/grievances |

---

## Flow 1: Business Owner Registration

> **Route:** `/register` → API: `POST /api/auth/register`

```mermaid
flowchart TD
    A["Visit LMOVS Portal"] --> B["Click 'Register Business'"]
    B --> C["Step 1: Enter Personal Details\n- Full Name\n- Email\n- Mobile Number\n- Password"]
    C --> D["Step 2: Phone OTP Verification\n- Receive 6-digit SMS OTP\n- Enter OTP to verify phone"]
    D --> E["Step 3: Business Details\n- Business Name & Type\n- GSTIN (optional)\n- Trade License Number\n- Address, City, Pincode\n- Select State & District"]
    E --> F["Submit Registration"]
    F --> G["Status: pending_approval\n📩 Confirmation SMS + Email sent"]
    G --> H["⏳ Wait for State Admin\nto review & approve"]
    H --> I{"Approved?"}
    I -->|Yes| J["✅ Status → active\nCan now log in & use platform"]
    I -->|No| K["❌ Status → suspended\nNotification with rejection reason"]
```

### What happens behind the scenes:
1. Password is hashed using PBKDF2 with a random salt (100,000 iterations)
2. User is created with role `business_owner` and status `pending_approval`
3. A linked `Business` profile record is created
4. A welcome notification is stored in-app
5. Email + SMS confirmation dispatched

---

## Flow 2: Instrument Registration

> **Route:** `/dashboard/instruments` → API: `POST /api/instruments`  
> **Who:** Business Owner (after approval)

```mermaid
flowchart TD
    A["Log in to Dashboard"] --> B["Navigate to\n'Instruments' page"]
    B --> C{"Single or Bulk?"}
    C -->|Single| D["Click 'Add Instrument'\nFill form:\n- Type (Weighing Scale/Measuring/Weight/Measure)\n- Category\n- Make & Model\n- Serial Number\n- Capacity & Least Count\n- Location of Use\n- Installation Date\n- Upload Photo"]
    C -->|Bulk CSV| E["Click 'Bulk Upload'\n- Download CSV template\n- Fill in multiple instruments\n- Upload CSV file\n- Preview & validate\n- Confirm import"]
    D --> F["Submit"]
    E --> F
    F --> G["✅ Instrument registered\nwith status: active"]
    G --> H["Instrument appears in\n'My Instruments' list"]
```

### Uniqueness enforced:
Each instrument is uniquely identified by the combination of `(businessId, serialNumber, model, make)`. Duplicates are rejected.

---

## Flow 3: Verification Application + Payment

> **Route:** `/dashboard/applications/new` → API: `POST /api/applications`  
> **Who:** Business Owner

```mermaid
flowchart TD
    A["Go to 'Applications' → 'New Application'"] --> B["Select an Instrument\nfrom your registered list"]
    B --> C["Choose Application Type:\n• New Verification\n• Re-Verification"]
    C --> D["System Auto-Calculates Fee\nbased on instrument type,\ncategory, state rules"]
    D --> E["Set Priority:\nNormal or Urgent"]
    E --> F["Add optional notes\nor preferred date"]
    F --> G["Submit Application"]
    G --> H["Application Number generated:\nAPP/MH/2026/123456"]
    H --> I["📩 SMS + Email confirmation"]
    I --> J["Status: submitted"]
    J --> K["💳 Pay Verification Fee"]
    K --> L["Redirected to Payment Gateway\n(UPI / Net Banking / Card)"]
    L --> M{"Payment Success?"}
    M -->|Yes| N["✅ feePaid: true\nApplication ready for assignment"]
    M -->|No| O["❌ Payment failed\nCan retry later"]
```

### Active application guard:
You cannot submit a new application for an instrument that already has an active application (submitted / assigned / scheduled / in_progress).

---

## Flow 4: State Admin — Approval & Assignment

> **Routes:** `/dashboard/state-admin/approvals`, `/dashboard/state-admin/applications`  
> **Who:** State Admin or Super Admin

### 4A: Approve Business Registrations

```mermaid
flowchart TD
    A["State Admin logs in"] --> B["Navigate to\n'Pending Approvals'"]
    B --> C["Review business details:\n- Owner name & contact\n- GSTIN / Trade License\n- Address & State"]
    C --> D{"Decision"}
    D -->|Approve| E["✅ User status → active\n📩 Approval SMS + Email\nBusiness can now use platform"]
    D -->|Reject| F["❌ User status → suspended\n📩 Rejection notice with reason"]
```

### 4B: Assign Applications to Officers

```mermaid
flowchart TD
    A["View submitted applications\n(within your state)"] --> B["Select an application"]
    B --> C["Choose an Officer:\n- LMO (field inspector)\n- GATC (test centre)"]
    C --> D["Set priority if needed"]
    D --> E["Click 'Assign'"]
    E --> F["Application status → assigned\n📩 Officer notified (SMS + Email)\n📩 Business owner notified"]
```

### 4C: Provision New Officers

```mermaid
flowchart TD
    A["Navigate to 'Officers' page"] --> B["Click 'Add Officer'"]
    B --> C["Enter details:\n- Full Name, Email, Phone\n- Role: LMO or GATC\n- State & District\n- Designation"]
    C --> D["System creates account\nwith initial password"]
    D --> E["📩 Welcome email sent\nOfficer can log in immediately"]
```

> **Note:** Only Super Admin can provision State Admins. State Admins can only provision LMOs/GATCs within their own state.

---

## Flow 5: LMO/GATC — Inspection & Certificate Issuance

> **Routes:** `/dashboard/lmo/schedule`, `/dashboard/lmo/verify`, `/dashboard/lmo/field-mode`  
> **Who:** LMO or GATC

### Step-by-Step Inspection Flow:

```mermaid
flowchart TD
    A["LMO logs in"] --> B["View 'My Assigned Tasks'\n(/dashboard/lmo/applications)"]
    B --> C["Select an application"]
    C --> D["📅 Schedule Visit\n- Pick date\n- Select time slot\n- Enter location\n- Add notes"]
    D --> E["Application status → scheduled\n📩 Business owner notified\nof visit date/time"]
    E --> F["🏢 Go to business premises\nfor physical inspection"]
    F --> G["Open 'Digital Inspection Form'\n(/dashboard/lmo/verify)"]
    G --> H["Record Test Observations:\n- Accuracy readings\n- Error measurements\n- Test weights used\n- Environmental conditions"]
    H --> I["Upload:\n- Photos of instrument\n- Photos of stamp/seal\n- Signature"]
    I --> J["Enter seal number\nand any defects found"]
    J --> K{"Mark Result"}
    K -->|Pass| L["Result: pass\nApp status → in_progress"]
    K -->|Conditional Pass| L
    K -->|Fail| M["Result: fail\nApp status → rejected\n📩 Defect notice sent to business"]
    L --> N["Click 'Submit Final Verification'\nwith digital signature"]
    N --> O["🎉 CERTIFICATE AUTO-GENERATED!\n- Unique certificate number\n- QR code embedded\n- SHA-256 hash computed\n- 1-year validity set\n- PDF available for download"]
    O --> P["📩 Certificate SMS + Email\nsent to business owner"]
    O --> Q["⏰ Expiry alert schedules\ncreated: 30, 15, 7 days"]
```

### Certificate Number Format:
```
{STATE_CODE}/{YEAR}/{INSTRUMENT_TYPE_CODE}/{SEQUENTIAL_NUMBER}
Example: MH/2026/WS/000042
```

---

## Flow 6: Public Certificate Verification

> **Route:** `/verify` (no login required)  
> **Who:** Any citizen

```mermaid
flowchart TD
    A["Citizen sees instrument\nat a shop with QR sticker"] --> B{"How to verify?"}
    B -->|Scan QR| C["Open phone camera\nScan QR code on instrument"]
    B -->|Manual| D["Visit lmovs.gov.in/verify\nEnter certificate number"]
    C --> E["Redirected to\n/verify/{certificateId}"]
    D --> E
    E --> F["System checks:\n1. Certificate exists?\n2. SHA-256 hash matches?\n3. Still within validity?"]
    F --> G["Display Result Page"]
    G --> H["Shows:\n✅ Certificate Status (Active/Expired/Revoked)\n📋 Instrument details (make, model, serial)\n🏪 Business name (GSTIN masked)\n👤 Issuing officer name\n📅 Valid from → Valid until\n🔐 Cryptographic verification status"]
```

### What the public CANNOT see:
- Full GSTIN (masked as `22AA•••••ZA5`)
- Business owner's phone/email
- Internal application IDs
- Payment details

---

## Flow 7: Automated Expiry Alerts & Renewal

> **Trigger:** Daily cron job at `/api/cron/expiry-alerts`  
> **Who:** System (automated)

```mermaid
flowchart TD
    A["⏰ Daily Cron Job Runs"] --> B["Query all AlertSchedules\ndue on or before today\nthat haven't been sent"]
    B --> C["For each pending alert:"]
    C --> D["Calculate days remaining\nuntil certificate expiry"]
    D --> E["Send multi-channel alert:\n📱 SMS to business owner\n📧 Email with renewal link\n🔔 In-app notification"]
    E --> F["Mark alert as sent"]
    C --> G["Also: Find certificates\npast validUntil date"]
    G --> H["Auto-mark status → expired"]
    F --> I["Alert cycle:\n• 30 days before expiry\n• 15 days before expiry\n• 7 days before expiry"]
```

### Renewal Bridge:
The SMS/Email contains a **direct link** to submit a re-verification application:
```
/dashboard/applications/new?instrumentId={id}&type=re_verification
```
This pre-fills the form so the business owner can renew in 2 clicks.

---

## Flow 8: Grievance / Complaint Filing

> **Route:** `/complaints` (public, no login required)  
> **Who:** Any citizen or business owner

```mermaid
flowchart TD
    A["Visit /complaints page"] --> B["Fill complaint form:\n- Your name & phone\n- Target business name & address\n- District & State\n- Category:\n  • Tampered scale\n  • Missing stamp\n  • Overcharging\n  • Officer misconduct\n  • Other\n- Description of issue"]
    B --> C["Submit"]
    C --> D["Complaint number generated:\nGRV/MH/2026/54321"]
    D --> E["📩 Confirmation shown"]
    E --> F["Track status at /complaints\nusing complaint number"]
    F --> G["State Admin views complaint\nin dashboard"]
    G --> H["Assigns to jurisdictional LMO\nfor investigation"]
    H --> I["LMO investigates\nand records resolution"]
    I --> J["Status updated:\npending → under_investigation → resolved"]
```

---

## Flow 9: Admin Monitoring & Analytics

> **Route:** `/dashboard` (role-specific views)

### What each role sees on their dashboard:

````carousel
### 🛡️ Super Admin Dashboard
- **National-level KPIs:** Total instruments, certificates, pending applications
- **State-wise compliance charts**
- **Application trends over time**
- **Verification outcome distribution (Pass/Fail/Conditional)**
- **System health & audit logs**
- **Master data management** (States, Districts, Fee structures)
- **User provisioning** (State Admins)

Quick Actions:
- View all states' performance
- Manage national fee schedules
- Access full audit trail
- Export national reports
<!-- slide -->
### 👨‍💼 State Admin Dashboard
- **State-level KPIs:** Instruments in state, pending approvals, active applications
- **District workload distribution chart**
- **Officer performance metrics**
- **Pending business registrations** queue

Quick Actions:
- Approve/reject business registrations
- Assign applications to officers
- Provision new LMOs/GATCs
- View state grievances
<!-- slide -->
### 🔍 LMO / GATC Dashboard
- **My Tasks:** Assigned applications count
- **Scheduled visits** for today/this week
- **Completed inspections** this month
- **Certificates issued** by me

Quick Actions:
- View assigned tasks
- Schedule inspection visit
- Open field mode (mobile-optimized)
- Submit inspection form
<!-- slide -->
### 🏪 Business Owner Dashboard
- **My Instruments:** Total count, active/inactive
- **Applications:** Submitted, in-progress, completed
- **Certificates:** Active, expiring soon, expired
- **Quick Stats:** Fee payments, upcoming renewals

Quick Actions:
- ➕ Add New Instrument
- 📤 Bulk Upload (CSV)
- 📋 Submit Verification Application
- 📜 Download Certificates
````

---

## Complete End-to-End Lifecycle

Here's the **entire lifecycle** of an instrument from registration to renewal, showing all roles involved:

```mermaid
sequenceDiagram
    participant BO as 🏪 Business Owner
    participant SA as 👨‍💼 State Admin
    participant LMO as 🔍 LMO / GATC
    participant SYS as ⚙️ System
    participant PUB as 📱 Public Citizen

    Note over BO: PHASE 1: ONBOARDING
    BO->>SYS: Register business + verify phone
    SYS->>SA: New registration for approval
    SA->>SYS: ✅ Approve business
    SYS->>BO: 📩 Approval notification

    Note over BO: PHASE 2: INSTRUMENT SETUP
    BO->>SYS: Register instrument(s)
    BO->>SYS: Submit verification application
    BO->>SYS: 💳 Pay statutory fee

    Note over SA: PHASE 3: ASSIGNMENT
    SA->>LMO: Assign application to officer
    SYS->>BO: 📩 Officer assigned notification
    SYS->>LMO: 📩 New task notification

    Note over LMO: PHASE 4: INSPECTION
    LMO->>SYS: Schedule inspection visit
    SYS->>BO: 📩 Visit scheduled notification
    LMO->>SYS: Conduct inspection, record observations
    LMO->>SYS: Submit result (Pass ✅)
    LMO->>SYS: Sign & finalize verification

    Note over SYS: PHASE 5: CERTIFICATION
    SYS->>SYS: Generate certificate number
    SYS->>SYS: Compute SHA-256 hash
    SYS->>SYS: Generate QR code
    SYS->>BO: 📜 Certificate issued notification
    SYS->>SYS: Schedule expiry alerts (30/15/7 days)

    Note over PUB: PHASE 6: PUBLIC VERIFICATION
    PUB->>SYS: Scan QR code on instrument
    SYS->>PUB: ✅ Certificate valid until {date}

    Note over SYS: PHASE 7: RENEWAL CYCLE
    SYS->>BO: ⏰ 30-day expiry alert
    SYS->>BO: ⏰ 15-day expiry alert
    SYS->>BO: ⏰ 7-day expiry alert
    BO->>SYS: Submit re-verification application
    Note over BO,PUB: Cycle repeats from Phase 2 →
```

---

## URL Map — Where Everything Lives

| Page | URL | Role |
|------|-----|------|
| Home / Landing | `/` | Public |
| Login | `/login` | All |
| Register Business | `/register` | Public |
| Phone OTP Verify | `/verify-otp` | Public |
| Forgot Password | `/forgot-password` | All |
| Reset Password | `/reset-password` | All |
| **Dashboard** | `/dashboard` | All authenticated |
| My Instruments | `/dashboard/instruments` | Business Owner |
| Instrument Detail | `/dashboard/instruments/{id}` | Business Owner |
| Bulk Upload | `/dashboard/instruments/bulk` | Business Owner |
| My Applications | `/dashboard/applications` | All authenticated |
| New Application | `/dashboard/applications/new` | Business Owner |
| My Certificates | `/dashboard/certificates` | All authenticated |
| Profile | `/dashboard/profile` | All authenticated |
| **LMO Tasks** | `/dashboard/lmo/applications` | LMO |
| Schedule Visit | `/dashboard/lmo/schedule` | LMO |
| Inspection Form | `/dashboard/lmo/verify` | LMO |
| Field Mode | `/dashboard/lmo/field-mode` | LMO |
| **State Admin** | `/dashboard/state-admin/approvals` | State Admin |
| Assign Apps | `/dashboard/state-admin/applications` | State Admin |
| Manage Officers | `/dashboard/state-admin/officers` | State Admin |
| **Super Admin** | `/dashboard/admin/states` | Super Admin |
| Master Data | `/dashboard/master-data` | Super/State Admin |
| Audit Logs | `/dashboard/audit-logs` | Super Admin |
| Reports | `/dashboard/reports` | All authenticated |
| Global Search | `/dashboard/search` | All authenticated |
| Complaints (dashboard) | `/dashboard/complaints` | All authenticated |
| **Public Verify** | `/verify` | Public |
| Certificate Check | `/verify/{certificateId}` | Public |
| **Public Complaints** | `/complaints` | Public |
| Payment Gateway | `/payments/gateway/{applicationId}` | Business Owner |
