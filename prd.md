# Product Requirements Document (PRD)

## Legal Metrology Online Verification System (LMOVS)

---

### 1. Product Overview

**App Name:** Legal Metrology Online Verification System (LMOVS)

**One-Line Description:** A unified, digital platform for the online verification, certification, and lifecycle management of weighing and measuring instruments across India.

**Detailed Problem Statement:**
Under the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011, every weighing and measuring instrument used in commercial transactions or for protection must be periodically verified and stamped. Currently, this critical compliance process is heavily reliant on manual, paper-based systems, physical records, and isolated local databases across different jurisdictions. This fragmented approach leads to significant delays in verification, a lack of transparency for business owners, challenges in tracking compliance for regulators, and difficulties for the general public in ensuring they are not being shortchanged. 

**Vision and Mission:**
- **Vision:** To create a transparent, efficient, and fully digitized ecosystem for legal metrology compliance in India that protects consumers and simplifies regulatory adherence for businesses.
- **Mission:** To transition the verification and stamping of weighing and measuring instruments from a manual, paper-based process to a seamless, centrally monitored online system accessible to all stakeholders.

**Target Users (Stakeholders / User Personas):**
1. **Super Admin (DoCA):** The central government administrator from the Department of Consumer Affairs. This persona oversees the entire national system, manages state-level administrators, and relies on high-level analytics to monitor national compliance and system health.
2. **State Admin:** The head of a State’s Legal Metrology department. They manage the LMOs and GATCs within their specific state and utilize state-level dashboards to monitor verification backlogs, compliance rates, and officer performance.
3. **Legal Metrology Officer (LMO):** Field officers responsible for conducting physical verification inspections. They need a system to view assigned tasks, record observations during inspections, and issue digital certificates.
4. **Government Approved Test Centre (GATC):** Third-party testing facilities approved by the government to conduct verifications. Their workflow is identical to that of an LMO, focusing on receiving assignments, conducting tests, and issuing certificates.
5. **Business Owner / Instrument User:** Shopkeepers, factory owners, and traders who own and operate weighing or measuring instruments. They need a portal to register their instruments, apply for verification, pay fees, track application status, download digital certificates, and receive renewal reminders.
6. **Public User:** Any citizen wishing to verify the authenticity of an instrument's certification. They need a simple, mobile-accessible way (like scanning a QR code) to check if the instrument being used for their transaction is legally compliant.

---

### 2. Problem Statement

**Current Pain Points:**
- **Manual Processes & Paper Records:** The reliance on physical forms and ledgers makes data entry prone to errors, incredibly slow, and vulnerable to loss or damage.
- **No Central Database:** Information is siloed within individual local or state offices. There is no single source of truth for the central government to assess national compliance.
- **No Digital Certificates:** Physical certificates can be easily lost, damaged, or forged, making it difficult for business owners to prove compliance and for inspectors to verify it.
- **Lack of Alerts:** Business owners often miss re-verification deadlines because there is no automated system to remind them, leading to unintentional non-compliance.
- **Lack of Transparency:** Business owners have no visibility into the status of their verification applications once submitted.
- **Jurisdictional Silos:** Inconsistencies in enforcement and tracking across different states create a fragmented regulatory landscape.

**Impact on Stakeholders:**
- **Business Owners:** Face tedious administrative overhead, uncertainty regarding compliance status, and potential penalties for missing unnotified deadlines.
- **LMOs/GATCs:** Spend excessive time on paperwork rather than actual inspections. Difficulty tracking historical data for specific instruments.
- **Administrators (State & Central):** Lack actionable data to enforce compliance, optimize resource allocation, or identify systemic issues.
- **Public:** Cannot easily verify if the scales or meters used in their daily transactions are accurate and legally certified.

**Why a Digital Solution is Needed Now:**
As India digitizes its public infrastructure, regulatory compliance must follow suit. A digital solution will drastically reduce administrative bottlenecks, ensure timely compliance through automated reminders, increase trust among consumers via accessible verification mechanisms, and provide the government with real-time data for better policy enforcement.

---

### 3. Core Features (Must-Have vs Nice-to-Have)

#### Must-Have Features (MVP - Minimum Viable Product)

| Feature | Description | Target User |
| :--- | :--- | :--- |
| **User Registration & Authentication** | Secure signup and login with role-based access control, utilizing Email and Mobile OTP for verification. | All Users |
| **Instrument Registration** | Ability for business owners to add their instruments. Must capture: Type, Make, Model, Serial Number, Capacity, and Location. | Business Owner |
| **Online Application Submission** | Submission portal for new verifications and re-verifications. | Business Owner |
| **Review & Approval Workflow** | System for assigning, reviewing, and approving/rejecting applications. | LMO, GATC |
| **Verification Scheduling** | Calendar management tool to schedule inspection visits based on pending applications. | LMO, GATC |
| **Digital Verification Form** | Digital form to record inspection observations, test results, and final pass/fail determination. | LMO, GATC |
| **Digital Certificate Generation** | Automatic generation of a secure, printable certificate featuring a unique QR code upon approval. | System / All Users |
| **Certificate Repository** | Secure storage allowing users to view, download, print, and share their certificates at any time. | Business Owner |
| **QR Code Public Verification** | Public interface enabling citizens to scan a certificate's QR code to verify its authenticity and current status. | Public User |
| **Role-Based Dashboards** | Customized views showing relevant metrics (e.g., pending applications, expired certificates, upcoming renewals). | Admin, LMO, GATC, Business Owner |
| **Validity Tracking & Alerts** | Automated tracking of certificate expiry dates and automated Email/SMS alerts sent prior to the re-verification due date. | System / Business Owner |
| **Document & Photo Upload** | Functionality to upload necessary supporting documents and photos of the instrument during registration or verification. | Business Owner, LMO, GATC |
| **Search and Filter** | Robust search functionality to find specific instruments, applications, or certificates based on various parameters. | Admin, LMO, GATC, Business Owner |
| **Export Reports** | Ability to export lists and analytics into CSV or PDF formats for offline review. | Admin, LMO, GATC |
| **Notification System** | Comprehensive notification engine delivering alerts via in-app messages, email, and SMS. | All Registered Users |

#### Nice-to-Have Features (Post-MVP)

| Feature | Description | Target User |
| :--- | :--- | :--- |
| **Mobile-Optimized Field Mode** | A responsive or dedicated app mode designed specifically for ease of use by LMOs on mobile devices during field inspections. | LMO |
| **GPS/Geolocation Capture** | Automatically recording the GPS coordinates of the location where the field verification takes place. | LMO, GATC, System |
| **Advanced Analytics Dashboards** | Deep-dive analytics showing state-wise compliance trends, instrument-type failure rates, etc. | Super Admin, State Admin |
| **Bulk Instrument Registration** | Allowing business owners with many instruments to upload them all at once via a CSV file. | Business Owner |
| **Payment Gateway Integration** | Integrating with government payment systems (e.g., Bharatkosh) to allow online payment of verification fees directly within the portal. | Business Owner |
| **API Integration** | Providing APIs for seamless integration with other third-party government or enterprise systems. | System Administrators |
| **Multi-Language Support** | Offering the user interface in Hindi, English, and various regional languages to improve accessibility. | All Users |
| **Audit Trail & Activity Logging** | Detailed logging of all actions taken within the system for security and auditing purposes. | Admin |
| **Grievance/Complaint Submission** | A module for users or the public to submit complaints regarding faulty instruments or LMO conduct. | Public, Business Owner |
| **Aadhaar/DigiLocker Integration** | Utilizing national identity systems for streamlined and verified user registration. | Business Owner |

---

### 4. User Flows

#### Flow 1: Business Owner Registration Flow
1. User navigates to LMOVS portal and clicks "Register as Business".
2. Enters basic details (Name, Email, Mobile Number).
3. Verifies identity via Mobile and Email OTP.
4. Sets up a secure password and logs in.
5. Completes business profile (Business Name, Address, GSTIN, Type of Business).
6. Navigates to "My Instruments" and clicks "Add Instrument".
7. Fills in instrument details (Type, Make, Model, Serial Number, Capacity) and uploads required initial documentation.
8. Saves instrument profile.

#### Flow 2: Verification Application Flow
1. Business Owner logs into the dashboard.
2. Selects an unregistered or soon-to-expire instrument and clicks "Apply for Verification".
3. Reviews instrument details and updates location if necessary.
4. Uploads any specific documents required for the application.
5. (Post-MVP) Proceeds to payment gateway to pay requisite fees.
6. Submits the application.
7. Receives a confirmation SMS/Email with an Application Tracking ID.
8. Can view the real-time status (Pending, Assigned, Verified, Rejected) on their dashboard.

#### Flow 3: LMO/GATC Verification Flow
1. LMO logs into the system and views the "Pending Assignments" dashboard.
2. Reviews application details and schedules a visit, updating the status to "Scheduled". (System notifies Business Owner).
3. Conducts the physical inspection at the premises.
4. Opens the "Digital Verification Form" on their device for the specific application.
5. Records observations, enters test results, and uploads photos of the instrument and the stamped seal.
6. Marks the instrument as "Pass" or "Fail".
7. Submits the form.
8. If "Pass", the system automatically generates a digital certificate with a QR code and notifies the Business Owner.

#### Flow 4: Certificate Verification Flow (Public)
1. Public User sees a certified instrument at a shop with a printed QR code.
2. Scans the QR code using any standard smartphone camera or QR scanner app.
3. Is redirected to a secure public page on the LMOVS portal.
4. Views the instrument details, the business it belongs to, its current verification status, and the validity period.
5. (Alternative): User goes to the LMOVS website, clicks "Verify Certificate", enters the certificate number manually, and views the same details.

#### Flow 5: Re-verification Alert Flow
1. System daily chron job checks for certificates expiring in 30, 15, and 7 days.
2. System triggers an automated Email and SMS to the respective Business Owner.
3. Message contains a direct link: "Your instrument [Serial No] certification expires on [Date]. Click here to apply for re-verification."
4. Business Owner clicks the link, logs in, and is taken directly to the Verification Application Flow (Flow 2) with details pre-filled.

#### Flow 6: Admin Monitoring Flow
1. Admin (State or Super) logs in.
2. Lands on the main analytics dashboard.
3. Views high-level metrics: Total Instruments, Pending Applications, Overdue Re-verifications.
4. Filters data by district, LMO, or instrument type to identify bottlenecks.
5. Generates and downloads a monthly compliance report in PDF format.
6. Manages user access (e.g., adding a newly appointed LMO to the system).

---

### 5. MVP Definition

**Included in Phase 1 (MVP):**
The MVP focuses entirely on digitizing the core operational workflow to eliminate paper reliance. It includes:
- User Roles and Authentication (Admin, LMO, GATC, Business Owner).
- Instrument Registration and Application Submission.
- Digital Verification Forms for LMOs/GATCs.
- Automated Digital Certificate Generation with QR Codes.
- Public QR Code scanning for authenticity verification.
- Basic Dashboards for all roles.
- Email/SMS Alert system for renewals.
- Basic Search, Filter, and Export functionalities.

**Deferred to Phase 2 (Post-MVP):**
- Integrated Payment Gateway (manual fee collection verified offline in MVP).
- GPS location capture during inspection.
- Advanced Analytics and deep-dive charts.
- Bulk CSV uploads.
- Aadhaar/DigiLocker integrations.
- Multi-language UI.

**MVP Timeline Estimate:**
- Requirements & Design: 3 Weeks
- Development (Frontend, Backend, DB): 8 Weeks
- Testing & UAT: 3 Weeks
- Deployment & Training: 2 Weeks
- **Total Estimated Timeline:** 16 Weeks (4 Months)

**MVP Success Criteria:**
- 100% of new verifications in the pilot state/district processed through the system within the first month post-launch.
- Zero major security vulnerabilities identified during penetration testing.
- Generation of at least 1,000 digital certificates within the first 30 days.

---

### 6. Success Metrics (KPIs)

To measure the effectiveness and adoption of LMOVS, the following KPIs will be tracked:

1. **Adoption Metrics:**
   - Number of registered businesses on the platform.
   - Total number of instruments registered in the database.
   - Percentage of total known instruments in a jurisdiction now managed via the portal.
   
2. **Operational Efficiency:**
   - Number of verification applications submitted online per month.
   - **Average Turnaround Time:** Average time taken from application submission to certificate issuance.
   - Reduction in manual paperwork (estimated hours saved per LMO per week).

3. **Compliance & Enforcement:**
   - Percentage of registered instruments maintaining a valid, unexpired verification.
   - **Alert Effectiveness:** Re-verification compliance rate triggered by automated alerts (percentage of alerts that result in an application within 7 days).

4. **User Engagement & Satisfaction:**
   - Dashboard adoption rate by LMOs/GATCs (Daily Active Users).
   - Number of public QR code scans performed monthly.
   - User Satisfaction Score (NPS) collected via periodic in-app surveys for business owners.

---

### 7. Assumptions and Constraints

**Assumptions:**
- Internet connectivity is available at most business premises and LMO offices, though field connectivity may be intermittent.
- Business owners have access to basic smartphones or computers capable of web browsing.
- State departments will mandate the use of this system, deprecating legacy manual processes.

**Constraints:**
- **Hosting:** The application must be hosted on secure government infrastructure, specifically the National Informatics Centre (NIC) cloud environment.
- **Data Privacy:** Must adhere strictly to government data localization and privacy regulations; sensitive business data must be encrypted at rest and in transit.
- **Regulatory Compliance:** The digital workflows must perfectly mirror the legal requirements stipulated in the Legal Metrology Act, 2009.
- **Device Support:** The web app must be fully responsive, functioning smoothly on modern desktop browsers (Chrome, Edge, Firefox) and mobile browsers (iOS Safari, Android Chrome).

---

### 8. Glossary

- **DoCA:** Department of Consumer Affairs.
- **LMO (Legal Metrology Officer):** A government official appointed under the Act to inspect, verify, and stamp weights and measures.
- **GATC (Government Approved Test Centre):** A private entity authorized by the government to undertake verification and stamping of specific weights and measures.
- **Verification:** The process of testing a weight or measure to ensure it conforms to the standards established by the Act and Rules.
- **Stamping:** The act of affixing a physical or digital mark/seal on a verified instrument to indicate its compliance.
- **Re-verification:** The periodic, mandatory verification required before the expiry of the current certification validity.
- **Legal Metrology Act, 2009:** The primary Indian legislation establishing standards of weights and measures, regulating trade and commerce in weights, measures, and other goods which are sold or distributed by weight, measure or number.
- **MVP:** Minimum Viable Product; the initial version of the software with just enough features to be usable by early customers who can then provide feedback for future product development.
