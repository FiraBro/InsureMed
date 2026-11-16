# 08. API Reference

All API endpoints are prefixed with `/api/v1` unless noted otherwise.

Interactive documentation and real-time request testing are accessible through Swagger UI at **`http://localhost:3001/api-docs`**.

---

## 1. Authentication & User Profile (`/api/v1/auth`)

### Register User
- **Method:** `POST /api/v1/auth/register`
- **Auth:** Public (Rate-limited via Redis: 5 requests per 15 min)
- **Purpose:** Creates a new customer account with profile, contact, and address data.
- **Request Body:**
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "passwordConfirm": "Password123!",
    "phone": "+1234567890",
    "gender": "female",
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zip": "62701",
      "country": "USA"
    }
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "673752e82e79601d3a51f011",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "membershipTier": "Standard Member",
        "status": "active"
      }
    }
  }
  ```
- **Errors:** `400 Bad Request` (Passwords do not match, Email already registered).

---

### Login User
- **Method:** `POST /api/v1/auth/login`
- **Auth:** Public (Rate-limited)
- **Purpose:** Authenticates credentials and returns a JWT token while setting a secure session cookie.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "data": {
      "user": {
        "_id": "673752e82e79601d3a51f011",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer"
      }
    }
  }
  ```
- **Errors:** `401 Unauthorized` (Incorrect email or password), `429 Too Many Requests` (Account temporarily locked due to 5 failed attempts).

---

### Logout User
- **Method:** `POST /api/v1/auth/logout`
- **Auth:** Public
- **Purpose:** Clears the HTTP-only session cookie.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Logged out successfully"
  }
  ```

---

### Get Current User Profile
- **Method:** `GET /api/v1/auth/me`
- **Auth:** Authenticated (`protect`)
- **Purpose:** Retrieves the current authenticated user's record from the JWT session.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "673752e82e79601d3a51f011",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "address": { "city": "Springfield", "country": "USA" }
      }
    }
  }
  ```

---

### Update Current User Profile
- **Method:** `PATCH /api/v1/auth/me`
- **Auth:** Authenticated (`protect`)
- **Purpose:** Modifies contact info, phone, and address details.
- **Request Body:**
  ```json
  {
    "phone": "+1987654321",
    "address": { "city": "Chicago", "state": "IL" }
  }
  ```
- **Success Response (200 OK):** Updated user object.

---

### Forgot Password
- **Method:** `POST /api/v1/auth/forgot-password`
- **Auth:** Public (Rate-limited)
- **Request Body:** `{ "email": "jane@example.com" }`
- **Success Response (200 OK):** `{ "status": "success", "message": "Token sent to email" }`

---

### Reset Password
- **Method:** `PUT /api/v1/auth/reset-password/:token`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "password": "NewSecurePassword123!",
    "passwordConfirm": "NewSecurePassword123!"
  }
  ```
- **Success Response (200 OK):** Returns new JWT session token.

---

## 2. Insurance Plans (`/api/v1/plans`)

### List Published Plans (Public)
- **Method:** `GET /api/v1/plans`
- **Auth:** Public
- **Query Parameters:**
  - `planType`: Filter by type (`individual`, `family`, `senior`, `student`, `corporate`).
  - `category`: Filter by category.
  - `minPremium`, `maxPremium`: Price bounds.
  - `sort`: Sorting field (e.g., `-rating`, `premium`).
  - `page`, `limit`: Pagination parameters.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "results": 3,
    "data": [
      {
        "_id": "67375101a09d123456789abc",
        "name": "Comprehensive Family Care",
        "slug": "comprehensive-family-care",
        "premium": 150,
        "coverageAmount": 500000,
        "deductible": 500,
        "premiumFrequency": "monthly",
        "annualPremium": 1800,
        "planType": "family",
        "rating": 4.8,
        "isPopular": true
      }
    ]
  }
  ```

---

### Get Single Plan by ID
- **Method:** `GET /api/v1/plans/id/:id`
- **Auth:** Public
- **Success Response (200 OK):** Returns complete plan object including features and exclusions.

---

### Create Insurance Plan (Admin Only)
- **Method:** `POST /api/v1/plans`
- **Auth:** Authenticated, Admin (`protect`, `restrictTo('admin')`)
- **Request Body:**
  ```json
  {
    "name": "Senior Golden Shield",
    "premium": 220,
    "coverageAmount": 300000,
    "deductible": 250,
    "premiumFrequency": "monthly",
    "planType": "senior",
    "minAge": 60,
    "maxAge": 85,
    "features": ["Prescription coverage", "Home health aide visits"],
    "exclusions": ["Experimental cosmetic surgery"]
  }
  ```
- **Success Response (201 Created):** Returns created plan object.

---

### Preview Risk Score (Admin Only)
- **Method:** `POST /api/v1/plans/risk-score`
- **Auth:** Authenticated, Admin
- **Purpose:** Calculates underwriting risk score (0-100) based on proposed plan terms.
- **Request Body:**
  ```json
  {
    "premium": 100,
    "coverageAmount": 500000,
    "deductible": 100,
    "planType": "senior",
    "minAge": 65,
    "maxAge": 90
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "riskScore": {
      "score": 78,
      "recommendations": [
        "Increase deductible for senior bracket to balance actuarial exposure.",
        "Adjust premium upwards given high coverage-to-deductible ratio."
      ]
    }
  }
  ```

---

### Update Plan (Admin Only)
- **Method:** `PATCH /api/v1/plans/:id`
- **Auth:** Authenticated, Admin
- **Success Response (200 OK):** Returns updated plan object.

---

### Soft-Delete Plan (Admin Only)
- **Method:** `DELETE /api/v1/plans/:id`
- **Auth:** Authenticated, Admin
- **Success Response (204 No Content)**

---

## 3. Applications (`/api/v1/applications`)

### Submit Policy Application
- **Method:** `POST /api/v1/applications/apply`
- **Auth:** Authenticated (`protect`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `planId`: Target Plan ObjectId.
  - `personal`: JSON string with `{ fullName, email, phone, dob, address }`.
  - `nominee`: JSON string with `{ name, relationship }`.
  - `medical`: JSON string with `{ history, otherDetails }`.
  - `payment`: JSON string with `{ frequency, method }`.
  - `documents`: Uploaded identity and medical proof files.
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Application submitted successfully",
    "data": {
      "_id": "673760ab2398401de3981240",
      "status": "pending",
      "documents": [
        {
          "name": "id_card.pdf",
          "url": "/uploads/id_card-1731792000.pdf"
        }
      ]
    }
  }
  ```

---

### Get My Applications
- **Method:** `GET /api/v1/applications/my-applications`
- **Auth:** Authenticated (`protect`)
- **Success Response (200 OK):** Array of user applications populated with plan data.

---

### List All Applications (Admin Only)
- **Method:** `GET /api/v1/applications`
- **Auth:** Authenticated, Admin
- **Success Response (200 OK):** Array of all pending, approved, and rejected applications across all users.

---

### Approve Application (Admin Only)
- **Method:** `PATCH /api/v1/applications/approve/:id`
- **Auth:** Authenticated, Admin
- **Purpose:** Approves application, generates a unique policy number, and instantiates an active `Policy` document.
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Application approved and policy activated",
    "data": {
      "application": { "_id": "...", "status": "approved" },
      "policy": {
        "policyNumber": "POL-2026-8912",
        "status": "active",
        "startDate": "2026-11-16T00:00:00.000Z",
        "endDate": "2027-11-16T00:00:00.000Z"
      }
    }
  }
  ```

---

### Reject Application (Admin Only)
- **Method:** `PATCH /api/v1/applications/reject/:id`
- **Auth:** Authenticated, Admin
- **Request Body:** `{ "rejectionReason": "Income proof missing verification seal." }`
- **Success Response (200 OK):** Returns application with status `rejected`.

---

## 4. Policies (`/api/v1/policies`)

### Get Logged-In User Policies
- **Method:** `GET /api/v1/policies/my`
- **Auth:** Authenticated (`protect`)
- **Success Response (200 OK):** Array of user policies with active terms and snapshot details.

---

### Request Policy Renewal
- **Method:** `POST /api/v1/policies/:id/renew`
- **Auth:** Authenticated (`protect`)
- **Request Body:** `{ "paymentMethod": "bank_transfer", "transactionRef": "TXN-90218" }`
- **Success Response (200 OK):** Updates policy status to `pending_renewal`.

---

### Approve Policy Renewal (Admin Only)
- **Method:** `POST /api/v1/policies/:id/renew/approve`
- **Auth:** Authenticated, Admin
- **Purpose:** Approves renewal, extends `endDate` by 365 days, increments `renewalCount`, and sets status to `active`.
- **Success Response (200 OK):** Returns renewed policy.

---

### Cancel Policy (Admin Only)
- **Method:** `PUT /api/v1/policies/:id/cancel`
- **Auth:** Authenticated, Admin
- **Request Body:** `{ "cancellationReason": "Customer requested cancellation." }`
- **Success Response (200 OK):** Returns cancelled policy with timestamp.

---

## 5. Claims Management (`/api/v1/claims`)

### Create Claim
- **Method:** `POST /api/v1/claims/create`
- **Auth:** Authenticated (`protect`)
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `policyNumber`: Valid user policy number.
  - `claimType`: Category (e.g., `'Hospitalization'`, `'Pharmacy'`).
  - `amount`: Number (e.g., `1250.00`).
  - `reason`: Treatment description.
  - `document`: Uploaded receipt/invoice image or PDF.
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Claim filed successfully",
    "data": {
      "_id": "67377192ab0123847a982101",
      "policyNumber": "POL-2026-8912",
      "amount": 1250,
      "status": "Pending",
      "documentUrl": "/uploads/claim-receipt-1731795000.pdf"
    }
  }
  ```

---

### Get My Claims
- **Method:** `GET /api/v1/claims/me`
- **Auth:** Authenticated (`protect`)
- **Success Response (200 OK):** Returns array of user's filed claims.

---

### Update Claim Status (Admin Only)
- **Method:** `PUT /api/v1/claims/:id/status`
- **Auth:** Authenticated, Admin
- **Request Body:**
  ```json
  {
    "status": "Approved"
  }
  ```
  *(Status must be `"Approved"` or `"Rejected"`)*
- **Success Response (200 OK):** Returns updated claim with `reviewedAt` timestamp.

---

## 6. Support Tickets & FAQs (`/api/v1/support/tickets`)

### Create Support Ticket
- **Method:** `POST /api/v1/support/tickets`
- **Auth:** Authenticated (`protect`)
- **Request Body:**
  ```json
  {
    "subject": "Dispute on Claim Deductible Calculation",
    "category": "CLAIM",
    "priority": "HIGH",
    "description": "My claim was charged a $500 deductible when my plan terms specify $250.",
    "relatedClaim": "67377192ab0123847a982101"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "ticketId": "TIC-492104",
      "status": "OPEN",
      "priority": "HIGH",
      "slaDeadline": "2026-11-17T11:00:00.000Z"
    }
  }
  ```

---

### Get My Tickets
- **Method:** `GET /api/v1/support/tickets/my-tickets`
- **Auth:** Authenticated (`protect`)
- **Success Response (200 OK):** Paginated tickets owned by caller.

---

### Add Reply to Ticket
- **Method:** `POST /api/v1/support/tickets/:id/messages`
- **Auth:** Authenticated (`protect`)
- **Request Body:** `{ "message": "Here is the itemized invoice from the hospital." }`
- **Success Response (200 OK):** Returns updated ticket message thread.

---

### Assign Ticket (Admin Only)
- **Method:** `PATCH /api/v1/support/tickets/:id/assign`
- **Auth:** Authenticated, Admin
- **Request Body:** `{ "assignedTo": "673752e82e79601d3a51f011" }`
- **Success Response (200 OK):** Assigns staff member.

---

### Fetch FAQs
- **Method:** `GET /api/v1/support/tickets/faqs`
- **Auth:** Authenticated
- **Success Response (200 OK):** List of published FAQs.

---

## 7. AI Conversational Assistant (`/api/v1/chat` and `/api/chat`)

### Post Policy Chat Query
- **Method:** `POST /api/v1/chat` (Also available at `POST /api/chat`)
- **Auth:** Public / Authenticated
- **Purpose:** Answers insurance questions using Retrieval-Augmented Generation (RAG) over ingested policy documents.
- **Request Body:**
  ```json
  {
    "message": "Does my Silver tier plan cover diagnostic MRI scans?",
    "userPlanTier": "Silver",
    "conversationHistory": [
      { "role": "user", "content": "Hello" },
      { "role": "model", "content": "Hello! How can I assist you with your policy today?" }
    ]
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "answer": "Yes, under the Silver tier, diagnostic MRI scans are covered with a $75 specialist copay after your annual deductible is satisfied.",
    "sources": [
      {
        "documentName": "Silver_Plan_Schedule_2026.pdf",
        "category": "diagnostic_imaging",
        "planTier": "Silver"
      }
    ]
  }
  ```
- **Fallback Response (When not covered in documents):**
  ```json
  {
    "answer": "I could not find this in your policy documents. Please contact member support.",
    "sources": []
  }
  ```
- **Errors:** `503 Service Unavailable` if `GEMINI_API_KEY` is not configured or MongoDB vector index is unavailable.

---

## 8. Dashboard & Administrative Operations

### Customer Dashboard Overview
- **Method:** `GET /api/v1/dashboard`
- **Auth:** Authenticated (`protect`)
- **Success Response (200 OK):** Returns active policy counts, pending claims count, and unread notification alerts.

---

### Admin Financial Analytics
- **Method:** `GET /api/v1/admin/analytics/financials`
- **Auth:** Authenticated, Admin (`protect`, `restrictTo('admin')`)
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "totalRevenue": 458900,
      "totalClaimsPaid": 124300,
      "activePoliciesCount": 1420,
      "claimApprovalRate": "88.4%"
    }
  }
  ```

---

### Global Search (Admin Only)
- **Method:** `GET /api/v1/admin/global/search?q=POL-2026`
- **Auth:** Authenticated, Admin
- **Success Response (200 OK):** Aggregated search across Users, Policies, Claims, and Tickets.

---

### Get System Settings
- **Method:** `GET /api/v1/admin/settings`
- **Auth:** Public
- **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "systemName": "InsuTrack Pro",
      "currency": "USD",
      "globalTaxRate": 15,
      "renewalGracePeriod": 30,
      "maintenanceMode": false
    }
  }
  ```

---

### Update System Settings (Admin Only)
- **Method:** `PATCH /api/v1/admin/settings`
- **Auth:** Authenticated, Admin
- **Request Body:** `{ "maintenanceMode": false, "renewalGracePeriod": 45 }`
- **Success Response (200 OK):** Returns modified settings.
