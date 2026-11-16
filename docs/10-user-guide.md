# 10. User Guide (Customer Portal)

Welcome to the **InsureMed Customer Self-Service Portal**.

This guide provides step-by-step instructions for policyholders to register, compare insurance plans, apply for coverage, track policies, submit reimbursement claims, open support tickets, and consult the AI policy assistant.

---

## 1. Account Registration & Login

### Step-by-Step Registration
1. Navigate to the portal homepage at [http://localhost:3000](http://localhost:3000) and click **Get Started** or visit [http://localhost:3000/auth](http://localhost:3000/auth).
2. The registration form guides you through three sequential steps:
   - **Step 1: Account Details:** Enter your full legal name, valid email address, and a secure password (minimum 6 characters). Confirm your password.
   - **Step 2: Personal Info:** Provide your primary contact phone number, select your gender (`Male`, `Female`, `Other`), and enter your date of birth.
   - **Step 3: Address:** Enter your street address, city, state/province, ZIP/postal code, and country.
3. Check the **Terms of Service** agreement box and click **Create Account**.
4. Upon successful registration, you are redirected to sign in or automatically authenticated into your customer dashboard.

### Logging In
1. Visit `/auth` and select the **Sign In** tab.
2. Enter your registered email address and password.
3. Click **Sign In**.
   - *Note:* If you fail 5 consecutive login attempts, the system locks your account for 15 minutes to defend against unauthorized access.

---

## 2. Customer Dashboard Overview

Once authenticated, your default landing page is the **Customer Dashboard** (`/dashboard`):

- **Overview Cards:** Display real-time totals for:
  - **Active Policies:** Number of active coverage contracts in effect.
  - **Pending Applications:** Insurance applications awaiting administrative review.
  - **Submitted Claims:** Total claims filed and current processing status.
  - **Active Support Tickets:** Open inquiries requiring attention.
- **Quick Actions:** One-click shortcuts to browse insurance plans, submit a new claim, or contact customer support.

---

## 3. Browsing & Comparing Insurance Plans

To explore available insurance products, select **Plans** from the sidebar navigation (`/dashboard/plans`):

1. **Filtering Plans:**
   - **Plan Category:** Filter by `Health Insurance`, `Family Health`, or `Senior Care`.
   - **Plan Type:** Choose specific tiers such as `Individual`, `Family`, `Senior`, or `Corporate`.
   - **Price Range:** Set minimum and maximum premium sliders.
   - **Sorting:** Sort by highest customer rating, lowest premium, or most popular.
2. **Reviewing Plan Details:**
   - Click on any plan card to open the **Plan Detail View** (`/dashboard/plans/:id`).
   - Review the **Annualized Premium**, **Coverage Ceiling**, **Deductible**, **Network Hospital Size**, and **Waiting Periods**.
   - Review the detailed lists of **Key Features** and explicit **Exclusions** (treatments not covered).

---

## 4. Applying for an Insurance Policy

When you find a plan that meets your requirements, click **Apply Now** from the plan details page:

1. **Personal Information Verification:** Confirm that your pre-filled name, email, phone, and residential address are accurate.
2. **Beneficiary / Nominee Details:**
   - Enter your designated nominee's full legal name.
   - Specify their relationship to you (e.g., `Spouse`, `Child`, `Parent`).
3. **Medical History Disclosure:**
   - Detail any pre-existing medical conditions, chronic illnesses, or recent surgeries.
   - Accurate medical disclosure ensures swift claim approvals later.
4. **Document Uploads:**
   - Upload clear scans of required identity verification documents (Government ID / Passport) and income/medical proofs.
   - Supported formats: `.pdf`, `.jpg`, `.jpeg`, `.png`.
5. **Payment Cycle Preference:**
   - Select your billing frequency: `Monthly`, `Quarterly`, or `Annually`.
   - Select your payment channel (e.g., `Online Payment` or `Bank Transfer`).
6. **Submit Application:**
   - Check the agreement declaration and click **Submit Policy Application**.
   - Your application transitions to `Pending Review`. You can track its status under **My Applications** (`/dashboard/my-applications`).

---

## 5. Managing Active Policies

Navigate to **My Policies** (`/dashboard/my-policies`) to view all insurance contracts issued in your name:

- **Policy Card Information:**
  - **Unique Policy Number:** (e.g., `POL-2026-8912`) — quote this number when seeking hospital care or filing claims.
  - **Status Badge:** Indicates whether your policy is `active`, `pending_renewal`, or `expired`.
  - **Effective Coverage Dates:** Clear display of start date and expiration date.
  - **Coverage Limits & Deductible:** Your annual maximum coverage amount and remaining deductible.
- **Renewing a Policy:**
  - Prior to policy expiration, click **Request Renewal**.
  - Enter your payment confirmation or transaction reference.
  - The policy transitions to `pending_renewal` until approved by an administrator, maintaining continuous coverage without lapse.

---

## 6. Filing and Tracking Claims

If you incurred out-of-pocket medical expenses covered under your policy, file a reimbursement claim:

### Submitting a Claim (`/dashboard/claims/new`)
1. Click **Submit New Claim**.
2. **Select Associated Policy:** Choose the active policy covering the treatment.
3. **Claim Type:** Select the category of medical service (e.g., `Hospitalization`, `Outpatient Specialist`, `Pharmacy / Medication`).
4. **Claim Amount:** Enter the exact monetary reimbursement requested.
5. **Treatment Summary / Reason:** Describe the medical event, hospital visited, or diagnosis.
6. **Attach Digital Invoices:**
   - Upload clear, legible photos or PDF scans of the hospital bill, discharge summary, or pharmacy receipts.
7. Click **Submit Claim**.

### Tracking Claim Status (`/dashboard/show/claims`)
- Review submitted claims and track their lifecycle:
  - `Pending`: Received and placed in the administrative underwriting queue.
  - `Approved`: Claim validated; reimbursement authorized for payout.
  - `Rejected`: Claim rejected. Click on the claim to view the administrator's feedback.

---

## 7. Support Ticketing & Messaging

If you encounter technical issues, policy questions, or billing disputes:

1. Navigate to **Support** (`/dashboard/support`).
2. **Open a Ticket:**
   - Click **Create Support Ticket**.
   - Select the **Category**: `CLAIM`, `PAYMENT`, `POLICY`, or `ACCOUNT`.
   - Select the **Priority Level**: `LOW`, `MEDIUM`, `HIGH`, or `EMERGENCY`.
   - Provide a descriptive subject and detailed explanation of your issue.
3. **SLA Guarantee:**
   - The system automatically calculates and displays your **SLA Deadline** based on priority.
4. **Threaded Conversation:**
   - Click into any ticket (`/dashboard/support/tickets/:id`) to exchange threaded messages and file attachments with support representatives.

---

## 8. AI Policy Assistant (Conversational Chat)

Need instant answers regarding your policy terms without waiting for a support agent?

1. Open the floating **AI Assistant** chat widget located in the bottom-right corner of your screen.
2. Type natural-language questions about your plan coverage:
   - *"Does my policy cover emergency room visits out of state?"*
   - *"What is my annual deductible for prescription drugs?"*
   - *"Are routine dental cleanings included in my family plan?"*
3. **Verified Answers with Citations:**
   - The assistant searches the exact text of your plan's legal documents using semantic vector search.
   - Every answer cites the source document name and section.
   - If a specific treatment is not covered in your policy documents, the assistant will inform you directly and advise contacting member support.

---

## 9. Notification Center & Profile Management

- **Notification Center (`/dashboard/notifications`):**
  - Click the bell icon in the top header to view real-time alerts regarding claim status updates, policy renewals, and support replies.
  - Click **Mark All as Read** to clear badge counters.
- **Profile Settings (`/dashboard/profile`):**
  - Update your primary contact phone number, residential address, or password.
