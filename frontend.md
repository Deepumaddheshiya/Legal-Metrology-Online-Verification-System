# Frontend Specification Document: Legal Metrology Online Verification System (LMOVS)

This document outlines the comprehensive frontend specification for the Legal Metrology Online Verification System (LMOVS) web application, a government platform for the Ministry of Consumer Affairs, India.

---

## 1. Design System

The application must project a professional, trustworthy, and clean aesthetic, appropriate for a government platform. It avoids flashy or trendy elements in favor of clarity and accessibility.

### Color Palette

**Primary Colors:**
- **Primary Blue:** `#1E3A8A` (Headers, primary buttons, active nav items)
- **Primary Blue Light:** `#3B82F6` (Links, hover states)
- **Primary Blue Lighter:** `#DBEAFE` (Selected/active backgrounds, info banners)

**Secondary Colors:**
- **Secondary Green:** `#059669` (Success states, verified badges, pass indicators)
- **Secondary Green Light:** `#D1FAE5` (Success backgrounds)

**Accent Colors:**
- **Warning Amber:** `#D97706` (Warnings, pending states, due-soon alerts)
- **Warning Amber Light:** `#FEF3C7` (Warning backgrounds)
- **Danger Red:** `#DC2626` (Errors, failed verification, expired certificates, destructive actions)
- **Danger Red Light:** `#FEE2E2` (Error backgrounds)

**Neutral Colors:**
- **Gray 900:** `#111827` (Primary text)
- **Gray 700:** `#374151` (Secondary text)
- **Gray 500:** `#6B7280` (Placeholder text, muted text)
- **Gray 300:** `#D1D5DB` (Borders, dividers)
- **Gray 100:** `#F3F4F6` (Page backgrounds, card backgrounds)
- **White:** `#FFFFFF` (Card surfaces, input backgrounds)

**Status Colors:**
- **Draft:** Gray `#6B7280`
- **Submitted:** Blue `#3B82F6`
- **Assigned:** Indigo `#6366F1`
- **Scheduled:** Purple `#8B5CF6`
- **In Progress:** Amber `#D97706`
- **Completed/Pass:** Green `#059669`
- **Failed:** Red `#DC2626`
- **Expired:** Red `#DC2626`
- **Active:** Green `#059669`

### Typography

- **Font Family:** `Inter` (Fallback: `system-ui, -apple-system, sans-serif`)
- **Scale:**
  - Display / Page Title: 30px (1.875rem), weight 700
  - H1 / Section Title: 24px (1.5rem), weight 700
  - H2 / Card Title: 20px (1.25rem), weight 600
  - H3 / Subsection: 18px (1.125rem), weight 600
  - Body Large: 16px (1rem), weight 400
  - Body (Default): 14px (0.875rem), weight 400
  - Body Small / Caption: 12px (0.75rem), weight 400
  - Label: 14px (0.875rem), weight 500
- **Line Height:** 1.5 for body, 1.25 for headings
- **Letter Spacing:** Normal for body, -0.025em for headings

### Spacing & Layout

- **Base Unit:** 4px
- **Scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80px
- **Page Max-Width:** 1280px (Centered)
- **Sidebar Width:** 280px (Collapsible to 64px)
- **Content Padding:** 24px (Desktop), 16px (Mobile)
- **Card Padding:** 24px
- **Grid:** 12-column, 24px gutter
- **Border Radius:** 8px (Cards/Modals), 6px (Buttons/Inputs), 4px (Badges)

### Component Styles

**Buttons:**
- **Primary:** Background `#1E3A8A`, Text `#FFFFFF`, Hover `#1E40AF`, Height 40px, Padding 16px (px), Radius 6px, Weight 500
- **Secondary:** Background `#FFFFFF`, Border `#D1D5DB`, Text `#374151`, Hover Background `#F3F4F6`
- **Danger:** Background `#DC2626`, Text `#FFFFFF`, Hover `#B91C1C`
- **Ghost:** Transparent, Text `#3B82F6`, Hover Background `#DBEAFE`
- **Disabled:** 50% opacity, `cursor-not-allowed`
- **Loading:** Spinner icon, interaction disabled
- **Sizes:** sm (32px), md (40px), lg (48px)

**Input Fields:**
- **Height:** 40px, Padding: 12px px
- **Border:** 1px solid `#D1D5DB`, Radius 6px
- **Text:** 14px
- **Focus:** Border `#3B82F6`, Ring 2px `#DBEAFE`
- **Error:** Border `#DC2626`, Ring 2px `#FEE2E2`
- **Disabled:** Background `#F3F4F6`, Text `#6B7280`
- **Label:** Above input, Weight 500, 14px, Margin-bottom 4px (Required: red asterisk `*`)

**Cards:**
- **Background:** `#FFFFFF`
- **Border:** 1px solid `#E5E7EB`, Radius 8px
- **Shadow:** Subtle `0 1px 3px rgba(0,0,0,0.1)`
- **Padding:** 24px
- **Hover:** Shadow `0 4px 6px rgba(0,0,0,0.1)`, Border `#3B82F6`

**Modals / Dialogs:**
- **Overlay:** Black 50% opacity
- **Container:** `#FFFFFF`, Radius 12px, Padding 24px, Max-width 560px
- **Header:** H2 title, Top-right X close button
- **Actions:** Right-aligned (Primary on right)

**Tables:**
- **Header:** Background `#F9FAFB`, Weight 600, Text `#374151`, Uppercase 12px, Sticky on scroll
- **Rows:** Border-bottom `#E5E7EB`, Hover Background `#F9FAFB`
- **Cells:** Padding 12px 16px

**Badges / Status Chips:**
- **Shape:** Pill (Radius 9999px)
- **Padding:** 4px 12px
- **Text:** 12px, Weight 500
- **Colors:** Derived from Status Colors with matching light backgrounds

**Sidebar Navigation:**
- **Background:** `#1E3A8A`
- **Text:** `#FFFFFF` (70% opacity inactive, 100% active)
- **Active State:** Background `rgba(255,255,255,0.15)`, Left border 3px `#FFFFFF`
- **Icons:** 20px (Lucide React)

**Top Header Bar:**
- **Height:** 64px, Background `#FFFFFF`, Border-bottom `#E5E7EB`
- **Content:** Breadcrumbs, Notifications bell, User avatar dropdown

**Toast Notifications:**
- **Position:** Top-right
- **Dimensions:** Width 360px
- **Behavior:** Auto-dismiss in 5s, Close button present
- **Types:** Success (Green), Error (Red), Warning (Amber), Info (Blue)

**Empty States:**
- Centered icon/illustration, Heading, Description, CTA button

**Loading States:**
- Skeleton screens for data (No spinners)
- Button spinners for actions
- Full page loader exclusively for auth redirects

### Responsive Breakpoints
- **Mobile (sm):** < 640px
- **Tablet (md):** 640px - 1024px
- **Desktop (lg):** > 1024px
- **Large Desktop (xl):** > 1280px

*Behavior:* Sidebar collapses to hamburger menu on mobile/tablet. Tables convert to card lists on mobile. Forms stack in a single column on mobile.

---

## 2. Page Layouts

- **Auth Pages (Login/Register):** Centered card interface, devoid of sidebar.
- **Dashboard Pages:** Sidebar (left) + Top Header Bar + Main Content Area.
- **Form Pages:** Sidebar + Top Header Bar + Centered form card (Max-width 720px).
- **Detail Pages:** Sidebar + Top Header Bar + Two-column layout (Main details left, meta info right sidebar).
- **Public Pages (Certificate Verify):** Minimal top navigation, centered content, prominent government branding.

---

## 3. API & Integration Specification

### A. Supabase Auth
- **Purpose:** User authentication, session management.
- **Headers:** `Authorization: Bearer <access_token>`, `apikey: <SUPABASE_ANON_KEY>`
- **Endpoints:**
  - `POST /auth/v1/signup`: `{email, password, phone}` → `{user, session}`
  - `POST /auth/v1/token?grant_type=password`: `{email, password}` → `{access_token, refresh_token, user}`
  - `POST /auth/v1/otp`: `{phone}` → `{message_id}`
  - `POST /auth/v1/token?grant_type=otp`: `{phone, token}` → `{access_token, user}`
  - `POST /auth/v1/logout`: Send access token in header → `204 No Content`
  - `POST /auth/v1/recover`: `{email}` → `{}`
  - `GET /auth/v1/user`: Send access token → `{user}`
  - `PUT /auth/v1/user`: `{data: {full_name, phone}}` → `{user}`
- **Errors:** 400 (Invalid request), 401 (Invalid credentials), 422 (User already exists), 429 (Rate limited)

### B. Supabase Storage
- **Purpose:** Media and document storage.
- **Buckets:**
  - `instrument-photos`: Public read, authenticated write
  - `verification-photos`: Private, RLS-protected
  - `documents`: Private, RLS-protected
  - `certificates`: Generated PDFs, Private, RLS-controlled read
- **Limits:** Images (5MB), Documents (10MB), PDFs (15MB)
- **Allowed types:** Images (jpg, jpeg, png, webp). Documents (pdf, jpg, png). Certificates (pdf)
- **Endpoints:**
  - `POST /storage/v1/object/{bucket}/{path}`: Multipart form → `{Key, Id}`
  - `GET /storage/v1/object/public/{bucket}/{path}`: → File binary
  - `POST /storage/v1/object/sign/{bucket}/{path}`: `{expiresIn: 3600}` → `{signedURL}`
  - `DELETE /storage/v1/object/{bucket}/{path}`: → `{message}`

### C. Resend (Email Service)
- **Purpose:** Transactional emails.
- **Base URL:** `https://api.resend.com`
- **Headers:** `Authorization: Bearer <RESEND_API_KEY>`, `Content-Type: application/json`
- **Endpoints:**
  - `POST /emails`: `{from, to, subject, html, attachments}` → `{id}`
- **Templates:** Welcome, Verification, Status updates, Scheduled notices, Certificate issuance, Reminders.
- **Limits:** 100 emails/day (free tier)

### D. Firebase Phone Auth & SMS Service
- **Purpose:** Phone number verification, SMS OTP delivery, and transactional alert notifications.
- **Architecture & Tier:** Firebase Client SDK (`firebase/auth`) paired with Firebase Admin SDK (`firebase-admin`) for server-side token validation. Includes 10,000 free monthly SMS verifications with zero Indian telecom DLT registration delay.
- **Client Integration (`src/lib/firebase.ts`):**
  - **reCAPTCHA Verifier:** Invisible or modal `RecaptchaVerifier` attached to container `#recaptcha-container` for bot prevention and rate protection.
  - **Phone Sign-in:** `signInWithPhoneNumber(auth, phoneNumber, appVerifier)` returns `ConfirmationResult`.
  - **OTP Confirmation:** `confirmationResult.confirm(verificationCode)` resolves to `UserCredential` and returns Firebase ID Token (`user.getIdToken()`).
- **Server-Side Token Bridge & SMS Utility (`src/lib/firebase-admin.ts`, `src/lib/sms.ts`):**
  - `POST /api/auth/verify-phone`: Verifies Firebase ID Token using `admin.auth().verifyIdToken(token)` and updates `is_verified` / `phone` in PostgreSQL via Prisma.
  - `POST /api/auth/send-otp` / `POST /api/auth/verify-otp`: Unified API handlers.
  - **Mock Development Mode:** When `ENABLE_MOCK_SMS=true` (or using Firebase Auth test phone numbers), OTPs are logged directly to the development console without consuming SMS quotas.
  - **Transactional Alerts:** Expiry reminders, schedule notices, and status updates leverage `src/lib/sms.ts` (Firebase / C-DAC Mobile Seva Gateway).
- **Error Handling:** `auth/invalid-phone-number` (Invalid format, requires `+91`), `auth/quota-exceeded` (Daily quota hit), `auth/invalid-verification-code` (Wrong 6-digit OTP), `auth/code-expired` (OTP expired, prompt resend).

### E. QR Code Generation (qrcode)
- **Purpose:** Embed QR codes in certificates for verification.
- **Implementation:** Server-side via `qrcode` npm package.
- **Input:** `https://lmovs.gov.in/verify/{certificate_number}?token={verification_token}`
- **Config:** Error correction 'M', Margin 2, Width 200px, Dark color `#1E3A8A`.
- **Output/Storage:** PNG buffered to Supabase `certificates` bucket.

### F. PDF Generation (@react-pdf/renderer)
- **Purpose:** Render official A4 verification certificates.
- **Implementation:** Server-side generation.
- **Contents:** Ashoka emblem header, Title, Certificate Number, Dates, Business/Instrument details, Verification results, Signatures, QR code, Legal disclaimers.

### G. Recharts (Dashboard Charts)
- **Purpose:** Visual data analytics.
- **Types:** Bar (Monthly applications), Line (Trends), Pie/Donut (Status ratios), Area (Expiry forecasts).
- **Data format:** `[{name: 'Label', value: number}, ...]`

---

## 4. Accessibility Requirements
- **Standard:** WCAG 2.1 AA compliance.
- **Navigation:** Full keyboard accessibility for interactive elements.
- **Screen Readers:** Comprehensive ARIA label implementation.
- **Visual:** Minimum 4.5:1 color contrast ratio. Clear, visible focus indicators.
- **Media:** Descriptive `alt` text for all images.
- **Feedback:** Real-time form error announcements.

## 5. Performance Requirements
- **LCP (Largest Contentful Paint):** < 2.5 seconds
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTI (Time to Interactive):** < 3.5 seconds
- **Optimization:** Use `next/image` with WebP format.
- **Delivery:** Code splitting per route, lazy loading for below-the-fold content.
