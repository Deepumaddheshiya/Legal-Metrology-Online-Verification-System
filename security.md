# Legal Metrology Online Verification System (LMOVS) - Security Architecture Document

This document outlines the comprehensive security architecture for the Legal Metrology Online Verification System (LMOVS). It details the mechanisms that ensure data integrity, privacy, and secure access across all user roles.

## 1. Authentication Strategy

The primary authentication method relies on **Supabase Auth** utilizing JSON Web Tokens (JWT). This provides a secure, scalable, and standardized approach to identity management.

### Primary Auth Method: Supabase Auth with JWT

*   **Registration & Login:**
    *   **Email + Password:** Standard registration flow requiring email verification via a securely generated link.
    *   **Mobile OTP:** Mandatory for Business Owners and Legal Metrology Officers (LMOs) as an additional layer of identity verification.
*   **JWT Tokens:** Upon successful login, the system issues an **Access Token** (short-lived, used for API requests) and a **Refresh Token** (long-lived, used to obtain new access tokens).
*   **Token Storage:** To prevent Cross-Site Scripting (XSS) attacks, tokens are strictly stored in **httpOnly cookies**. They are *never* stored in `localStorage` or `sessionStorage`.
*   **Session Management:** Access tokens expire quickly (e.g., 15 minutes). The client automatically uses the refresh token (via a secure `/api/auth/refresh` endpoint) to seamlessly maintain the session. If the refresh token expires or is revoked, the user must log in again.
*   **Password Requirements:** Passwords must be strong: minimum 8 characters, containing at least one uppercase letter, one lowercase letter, one number, and one special character.
*   **Account Lockout:** To mitigate brute-force attacks, accounts are temporarily locked for 30 minutes after 5 consecutive failed login attempts.
*   **Password Reset:** Users can initiate a password reset via email, which sends a secure, time-bound reset link.
*   **Multi-Factor Authentication (MFA):** Strongly recommended or mandatory for all admin roles (Super Admin, State Admin) to protect highly sensitive access.

### Registration Flow Security by Role

| Role | Registration Flow & Security Checks |
| :--- | :--- |
| **Business Owner** | Self-registration via Email + Password. **Must** complete Email Verification AND Mobile OTP verification. Requires **manual approval** by a State Admin before full access is granted. |
| **LMO** | **Cannot self-register.** Accounts are provisioned exclusively by State Admins. Requires verification of their Government Employee ID. |
| **GATC** | **Cannot self-register.** Accounts are provisioned by State Admins. Requires verification of their official GATC Registration Number and accreditation status. |
| **State Admin** | **Cannot self-register.** Accounts are provisioned exclusively by the Super Admin. |
| **Public User** | Self-registration via Email + Password. Requires only Email Verification. Access is limited strictly to public search and verification features. |

---

## 2. Authorization — Role-Based Access Control (RBAC)

LMOVS employs strict Role-Based Access Control (RBAC) to ensure users can only perform actions explicitly permitted by their assigned role.

### Permissions Overview

*   **Super Admin:** Full system access. Manages all users, state admins, settings, fee structures, and views national-level dashboards/reports.
*   **State Admin:** Manages LMOs, GATCs, and business approvals within their assigned state. Generates state reports. Cannot access data outside their state or modify system-wide settings.
*   **LMO (Legal Metrology Officer):** Conducts verifications, fills forms, and generates certificates for assigned applications. Cannot access unassigned applications, modify issued certificates, or access admin panels.
*   **GATC (Government Approved Test Centre):** Similar to LMOs but for test centres. Manages centre profile and assigned verifications. Cannot access admin panels or approve registrations.
*   **Business Owner:** Registers instruments, submits applications, tracks status, and downloads their own certificates. Cannot view other businesses' data or alter verification results.
*   **Public User:** Can search and verify certificate authenticity using the certificate number or QR code. No access to dashboards or sensitive business data.

### Detailed Permissions Matrix

| Route / Action | Super Admin | State Admin | LMO | GATC | Business Owner | Public User |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard (National)** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Dashboard (State)** | ✅ | ✅ (Own state only)| ❌ | ❌ | ❌ | ❌ |
| **Dashboard (Personal)**| ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Manage State Admins** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage LMOs/GATCs** | ✅ | ✅ (Own state only)| ❌ | ❌ | ❌ | ❌ |
| **Approve Businesses** | ✅ | ✅ (Own state only)| ❌ | ❌ | ❌ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Fee Structures**| ✅ | ✅ (Own state only)| ❌ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Submit Applications** | ❌ | ❌ | ❌ | ❌ | ✅ (Own only) | ❌ |
| **Assign Applications** | ✅ | ✅ (Own state only)| ❌ | ❌ | ❌ | ❌ |
| **Conduct Verification**| ❌ | ❌ | ✅ (Assigned only)| ✅ (Assigned only)| ❌ | ❌ |
| **Generate Certificate**| ❌ | ❌ | ✅ (Assigned only)| ✅ (Assigned only)| ❌ | ❌ |
| **View/Download Certs** | ✅ | ✅ (Own state only)| ✅ (Assigned only)| ✅ (Assigned only)| ✅ (Own only) | ❌ |
| **Verify Public Cert** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> [!NOTE]
> Authorization is enforced both on the client-side (UI element visibility and route protection) and fundamentally on the server-side (API endpoints + Prisma query scoping). A database-layer RLS policy file is provided as defense-in-depth (see §3).

---

## 3. Access Control & Row-Level Security (RLS)

### 3.1 Enforced control — Application-Layer RBAC (authoritative)

LMOVS enforces authorization **at the application layer**, which is the control that is actually live in this build:

- Every protected API route calls `getSessionFromRequest(req)` (in `src/lib/auth.ts`), which verifies the **httpOnly JWT cookie** and extracts the caller's `role`, `stateId`, and `userId`.
- Each route then scopes its Prisma queries with a `where` clause based on that session — e.g. business owners are limited to `where.businessId = user.business.id`, state admins to `where.business = { stateId }`, LMO/GATC to `where.OR = [{ issuedByUserId }, { application: { assignedToUserId } }]`, and only `super_admin` sees all. (See `src/app/api/{applications,certificates}/route.ts`.)
- The custom JWT secret is required at startup (no insecure default) — see `src/lib/auth.ts` / `src/lib/jwt-edge.ts`.

This is the primary, tested enforcement. **A data-access bug was found and fixed (issue H1):** `src/app/api/certificates/route.ts` previously checked `session.role === "trader"` (a non-existent role), which caused `where = {}` and returned **every** certificate to business owners. It now correctly checks `"business_owner"`.

### 3.2 Database-Layer RLS — Defense-in-Depth (provided, not active by default)

PostgreSQL RLS policies are provided in **`Frontend/supabase/rls-policies.sql`** to add a second, independent layer of protection at the database. Two important facts about the current architecture:

1. **The app connects via Prisma using the Supabase service-role key**, which **bypasses RLS by design**. Therefore these policies are *defense-in-depth*: they protect data if/when a connection is made with a per-request user JWT (e.g. Supabase Auth / PostgREST / a role-scoped pooler), or if the app is later migrated to per-user database connections.
2. The policies read the **custom JWT claims** that LMOVS issues (`role`, `stateId`, `userId`) via `request.jwt.claims` — **not** Supabase `auth.uid()`. The earlier version of this document described `auth.uid()`/`owner_id`-based policies, which were inaccurate for this codebase's schema and auth model and were **never applied**.

**To activate (for non-service-role connections only):**
```sql
-- 1. Review Frontend/supabase/rls-policies.sql
-- 2. Apply it against your Supabase/Postgres database (psql or the SQL editor)
-- 3. Connect with the user JWT per request (e.g. PostgREST Authorization header),
--    NOT the service-role key, for the policies to take effect.
```

> **Note:** The application-layer RBAC in §3.1 remains the enforced control regardless of whether RLS is activated. Do not rely on RLS alone until the connection model uses per-user JWTs.

---

## 4. API Security

*   **Rate Limiting:** Protects against DDoS and brute-force attacks. Configured at the API gateway/middleware level:
    *   Authenticated users: 100 requests per minute.
    *   Unauthenticated users: 20 requests per minute.
*   **CORS Configuration:** Cross-Origin Resource Sharing is strictly configured to whitelist only the official LMOVS application domain, preventing unauthorized client applications from calling the API.
*   **Input Validation:** **Zod schemas** are used on *every* API endpoint to validate incoming request bodies, query parameters, and headers. This ensures only correctly formatted data is processed, mitigating malformed data attacks.
*   **SQL Injection Prevention:** Prisma ORM is used for all database interactions. Prisma inherently uses parameterized queries, effectively neutralizing SQL injection risks.
*   **XSS Prevention:** React (via Next.js) automatically escapes data rendered in the DOM. Additionally, strict Content Security Policy (CSP) headers are enforced to restrict the sources of executable scripts.
*   **CSRF Protection:** Utilizing `SameSite=Lax` or `SameSite=Strict` attributes for session cookies significantly reduces Cross-Site Request Forgery risks. For state-changing operations, CSRF tokens may be implemented if relying heavily on traditional form submissions rather than API calls with auth headers.
*   **File Upload Security:**
    *   **Type Validation:** Strictly enforce allowed MIME types (e.g., `image/jpeg`, `image/png`, `application/pdf`).
    *   **Size Limits:** Restrict images to 5MB and documents to 10MB.
    *   **Virus Scanning:** All uploaded files are scanned by an external anti-virus service (e.g., ClamAV integration) before being stored in Supabase Storage.
    *   **Safe Storage:** Files are stored in non-executable buckets.
*   **Request Body Limits:** Limit the maximum size of incoming JSON payloads (e.g., 1MB) to prevent Denial of Service via large payloads.
*   **HTTPS Enforcement:** All traffic must go through TLS 1.3. HTTP requests are automatically redirected to HTTPS. Strict Transport Security (HSTS) is enabled.
*   **Security Headers:** Configured via `next.config.js` or middleware:
    *   `X-Frame-Options: DENY` (prevents clickjacking)
    *   `X-Content-Type-Options: nosniff`
    *   `Referrer-Policy: strict-origin-when-cross-origin`
    *   `Permissions-Policy: geolocation=(), microphone=()` (restrict browser features)

---

## 5. Data Security

*   **Encryption at Rest:** All data stored in the PostgreSQL database and Supabase Storage buckets is encrypted at rest using AES-256 encryption managed by the infrastructure provider.
*   **Encryption in Transit:** All communication between the client, application servers, and the database occurs over secure TLS 1.3 connections.
*   **PII Handling (Personally Identifiable Information):**
    *   Sensitive PII like phone numbers, detailed residential addresses, and exact government IDs are obfuscated or masked in application logs.
    *   Access to PII is strictly limited by application-layer RBAC (§3.1), with RLS as defense-in-depth (§3.2).
*   **Data Retention Policies:** Data is retained according to government regulations. Deactivated accounts and obsolete data are soft-deleted and permanently purged after the mandated retention period.
*   **Backup Encryption:** Automated daily database backups are encrypted and stored in secure, geographically redundant storage.
*   **Database Connection Security:** Application servers connect to the database using connection pooling (e.g., PgBouncer) over SSL/TLS, ensuring efficient and secure database communication.

---

## 6. Certificate Security

Certificates are legal documents and require stringent security measures against forgery and tampering.

*   **QR Code Verification:** Every generated certificate includes a QR code. This code contains a secure URL with a unique, unguessable token (e.g., a UUID or signed JWT).
*   **Public Verification Endpoint:** Scanning the QR code directs the user to a public endpoint (`/verify/:token` or `/verify?cert_no=X`). This endpoint returns only essential validation status (Valid, Expired, Revoked) and basic instrument details, without exposing sensitive business information.
*   **Tampering Prevention (Hashing):** When a certificate is generated, a cryptographic hash (e.g., SHA-256) of the core certificate data (business details, instrument details, verification results, validity dates) is calculated and stored in the database. When the certificate is verified publicly, the system recalculates the hash and compares it against the stored value to detect any unauthorized modifications to the database record.
*   **Certificate Number Format:** Enforced standardized, predictable yet unique formatting: `STATE_CODE/YEAR/INSTRUMENT_TYPE/SERIAL` (e.g., `MH/2025/WS/000001`). This aids in manual verification and record-keeping.
*   **Digital Signatures:** Certificates are digitally signed (e.g., using a PKI infrastructure or generating a signed PDF) by the issuing authority (LMO/GATC) to provide non-repudiation.

---

## 7. Complete Error Handling Guide

A robust error handling strategy ensures security issues don't leak sensitive information and provides clear guidance to users.

| Scenario | HTTP Status & Error Code | User-Friendly Message | System Action (Log/Alert/Retry) |
| :--- | :--- | :--- | :--- |
| **Invalid login credentials** | `401 Unauthorized` | "Email or password is incorrect." | Log failed attempt. Increment brute-force counter. |
| **Account locked** | `423 Locked` | "Account temporarily locked. Try again in 30 minutes." | Log lockout event. Do not process login attempts for this user. |
| **Unauthorized access attempt** | `403 Forbidden` | "You don't have permission to access this resource." | Log unauthorized access attempt with user ID and requested path. |
| **Resource not found** | `404 Not Found` | "The requested record was not found." | Log 404 (monitor for potential scanning attacks). |
| **Validation errors** | `422 Unprocessable Entity` | Field-specific messages (e.g., "Invalid email format", "File too large"). | Return validation details to client. Log validation failure. |
| **File upload failures** | `413 Payload Too Large` / `415 Unsupported Media Type` | "File too large. Maximum size is X MB." / "File type not supported." | Reject request. Log upload failure attempt. |
| **Database connection failure** | `500 Internal Server Error` | "Service temporarily unavailable. Please try again later." | Log critical DB error. Trigger PagerDuty/Alert admin immediately. |
| **External service failure (Email/SMS)** | `500 Internal Server Error` | (Often hidden from user during flow, or generic error) | Log external service failure. Queue message for retry. Do not block the primary user transaction if possible. |
| **Payment gateway failure** | `502 Bad Gateway` | "Payment processing failed. Your account has not been charged." | Log payment failure details securely. Prompt user to retry. |
| **Duplicate application submission** | `409 Conflict` | "A verification application already exists for this instrument." | Reject duplicate creation. |
| **Certificate generation failure** | `500 Internal Server Error` | "Certificate generation is delayed. Please check back shortly." | Log generation failure. Alert admin. Queue for background retry. |
| **Session expired** | `401 Unauthorized` | "Session expired. Please log in again." | Client automatically redirects to login page. |
| **Rate limit exceeded** | `429 Too Many Requests` | "Too many requests. Please wait before trying again." | Block request. Log rate limit breach. |
| **Network timeout** | `504 Gateway Timeout` | "Request timed out. Please check your connection." | Log timeout. |
| **Concurrent modification conflict** | `409 Conflict` | "This record was modified by another user. Please refresh and try again." | Reject update based on optimistic concurrency control (e.g., version checking). |

---

## 8. Edge Cases to Handle Before Launch

> [!IMPORTANT]
> The following edge cases must be explicitly tested and handled in the application logic to prevent inconsistent states or security bypasses.

1.  **User submits verification application for an instrument that already has a pending application:**
    *   *Risk:* Duplicate processing, conflicting schedules, billing issues.
    *   *Handling:* Database constraint on active applications per instrument. UI checks and disables the 'Apply' button if status is pending. API returns `409 Conflict`.
2.  **LMO tries to verify an instrument that has been condemned/deactivated:**
    *   *Risk:* Issuing a valid certificate for a faulty/illegal instrument.
    *   *Handling:* API validation check before verification submission. If instrument status is 'Condemned', reject verification with `422`.
3.  **Certificate expires while a re-verification application is in progress:**
    *   *Risk:* Business operates illegally while waiting for LMO.
    *   *Handling:* System tracks 'Application Submitted Date'. If submitted before expiry, provide a temporary grace period status visible to public verification until LMO completes the task.
4.  **Business owner transfers/sells instrument to another business:**
    *   *Risk:* Data integrity, incorrect ownership records.
    *   *Handling:* Implement an 'Instrument Transfer' workflow requiring initiation by current owner and acceptance by new owner, updating ownership records securely. Old certificates become void.
5.  **LMO is transferred to another jurisdiction mid-verification:**
    *   *Risk:* Applications stuck in limbo.
    *   *Handling:* State Admin dashboard must flag 'Orphaned Applications'. Admin reassigns pending tasks to the new LMO in that jurisdiction.
6.  **GATC's accreditation expires — all pending assignments must be reassigned:**
    *   *Risk:* Unauthorized centre performing legal verifications.
    *   *Handling:* Daily cron job checks GATC validity. If expired, automatically freeze their account, revoke pending assignments, and notify State Admin for reassignment.
7.  **Same instrument registered twice by same or different business:**
    *   *Risk:* Fraud, database pollution.
    *   *Handling:* Enforce uniqueness on `(Manufacturer_Serial_Number + Instrument_Model + Manufacturer_Name)`. Flag potential duplicates for manual Admin review.
8.  **Verification fee structure changes while application is in progress:**
    *   *Risk:* Financial discrepancies, user disputes.
    *   *Handling:* Fee is locked in at the time of application submission. Store the `applied_fee_amount` in the application record rather than recalculating it later.
9.  **Power/network failure during field verification data entry:**
    *   *Risk:* Data loss, incomplete verification records.
    *   *Handling:* LMO offline mode (PWA features) or auto-save drafts to local storage, syncing automatically when connection is restored.
10. **Business owner deletes account but has active instruments with valid certificates:**
    *   *Risk:* Orphaned legal records.
    *   *Handling:* Prevent account deletion if active certificates exist. Require them to deactivate instruments first, or soft-delete the account while preserving the audit trail of the instruments.
11. **State boundary changes affecting jurisdiction:**
    *   *Risk:* LMOs unable to access their newly assigned areas.
    *   *Handling:* Flexible, scriptable migration paths for ZIP codes/districts mapping to states in the database.
12. **Bulk upload of instruments with some invalid entries:**
    *   *Risk:* Database corruption, partial failures.
    *   *Handling:* Transactional processing. Validate the entire batch; if any fail, reject the entire batch (or return a detailed error report allowing correction of specific rows) to maintain consistency.
13. **QR code on physical certificate becomes damaged/unreadable:**
    *   *Risk:* Inability to verify publicly.
    *   *Handling:* Always print the human-readable Certificate Number and the Verification URL below the QR code.
14. **Certificate number collision (extremely unlikely but must handle):**
    *   *Risk:* Overwriting legal documents.
    *   *Handling:* Database unique constraint on Certificate Number. If generation loop detects a collision, retry with a newly generated serial sequence.
15. **User tries to download certificate but PDF generation service is down:**
    *   *Risk:* Denial of service, user frustration.
    *   *Handling:* Fallback to a styled HTML view of the certificate with a 'Print' button while the background PDF service recovers. Alert monitoring systems.
16. **Multiple verification schedules for same time slot for same LMO:**
    *   *Risk:* Scheduling conflicts, missed appointments.
    *   *Handling:* API validation during scheduling to check LMO's calendar for overlaps and reject conflicting bookings.
17. **Business changes address to a different state:**
    *   *Risk:* Jurisdiction mismatch.
    *   *Handling:* Address change requiring state change triggers an automatic re-verification requirement and transfers the business record to the new State Admin's jurisdiction for approval.
18. **GATC exceeds daily verification capacity:**
    *   *Risk:* Quality degradation, SLA breaches.
    *   *Handling:* Set daily limits on assignment routing based on GATC profile settings. Prevent assignment if limit is reached.
19. **System time discrepancy affecting certificate validity dates:**
    *   *Risk:* Issuing expired or prematurely valid certificates.
    *   *Handling:* All date/time logic relies strictly on the Database Server Time (UTC), never relying on the client's local machine time.
20. **User registers with email, then tries to register again with phone (same person, different accounts):**
    *   *Risk:* Duplicate accounts, fragmented data.
    *   *Handling:* Implement robust identity resolution. Allow adding a phone number to an existing email-based profile rather than forcing new registration.
21. **Admin accidentally deactivates active LMO with pending assignments:**
    *   *Risk:* Workflow blockage.
    *   *Handling:* Show a warning prompt detailing pending assignments. Force the Admin to reassign those tasks before the deactivation can proceed.
22. **Photo upload during field verification in low-bandwidth area:**
    *   *Risk:* Verification failure due to timeouts.
    *   *Handling:* Client-side image compression before upload. Implement resumable uploads or background sync queues for the LMO app.
23. **Certificate revocation after issuance (instrument found defective later):**
    *   *Risk:* Invalid certificate remaining publicly valid.
    *   *Handling:* Specific 'Revoke' workflow for LMOs/Admins. Updates certificate status to 'Revoked', which immediately reflects on the public QR verification endpoint.
24. **Leap year / timezone edge cases for validity calculations:**
    *   *Risk:* Certificates valid for 364 or 366 days instead of exactly one year.
    *   *Handling:* Use robust date libraries (e.g., `date-fns` or native DB functions) that correctly handle leap years and ensure all timestamps are stored and calculated in UTC.
25. **Unicode/special characters in business names and addresses:**
    *   *Risk:* PDF rendering failures, search issues, injection attacks.
    *   *Handling:* Ensure UTF-8 encoding across the entire stack (Database, API, Frontend, PDF generator). Sanitize inputs to prevent control character injection while allowing valid regional characters.

---

## 9. Security Checklist for Launch

Before deploying LMOVS to production, the following security measures must be verified:

*   [ ] **Pre-launch Security Audit:** Internal code review focusing on authentication, authorization, and data validation logic.
*   [ ] **Penetration Testing (VAPT):** Engage an external, certified security firm to conduct Vulnerability Assessment and Penetration Testing.
*   [ ] **OWASP Top 10 Coverage:** Ensure mitigations are in place for all OWASP Top 10 vulnerabilities (Injection, Broken Auth, Sensitive Data Exposure, etc.).
*   [ ] **Dependency Scanning:** Automated checks (e.g., `npm audit`, Snyk) running in CI/CD pipeline to detect known vulnerabilities in third-party packages.
*   [ ] **Secrets Management:** Verify no hardcoded secrets exist in the codebase. All secrets must be injected via secure environment variables.
*   [ ] **Database Security:** Confirm application-layer RBAC scoping is correct on every API route (see §3.1). If per-user database connections are used, apply and test `Frontend/supabase/rls-policies.sql` and confirm the connection does NOT use the service-role key. Ensure secure connection configurations.
*   [ ] **Government Compliance:** Audit system against relevant national cybersecurity guidelines (e.g., CERT-In guidelines for India) for government web applications.
*   [ ] **Logging & Monitoring:** Ensure comprehensive audit logging is active and centralized error monitoring (e.g., Sentry) is configured.
*   [ ] **Backup & Recovery:** Verify automated backups are running and test the data restoration process.
*   [ ] **Incident Response Plan:** Establish a clear protocol for responding to reported security vulnerabilities or data breaches.
