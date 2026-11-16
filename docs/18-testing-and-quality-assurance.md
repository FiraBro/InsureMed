# 18. Testing and Quality Assurance

This document details the automated test suite, frontend verification checks, manual testing procedures, and quality assurance workflows available in **InsureMed**.

---

## 1. Automated Test Suite

InsureMed features automated unit and integration tests for core business authorization logic, implemented using Node.js's native test runner (`node:test`) and assertion library (`node:assert/strict`).

### Verified Test Suite: Ticket Ownership & Access Control (`Server/tests/ticketOwnership.test.js`)
This test suite verifies strict multi-tenant data isolation and role boundaries within the customer support module:

| Test Case | Description | Verified Security Rule |
| :--- | :--- | :--- |
| **`User A receives only User A tickets`** | Verifies that when User A queries their tickets, only tickets belonging to User A are returned. | Prevents horizontal privilege escalation in ticket listings. |
| **`User B receives only User B tickets`** | Validates query filtering for User B. | Data separation between disparate customer accounts. |
| **`User A cannot retrieve User B ticket by ID`** | Asserts that User A attempting to fetch User B's ticket ID receives a `404 Ticket not found`, while staff retain administrative read access. | Protects ticket detail endpoints against IDOR (Insecure Direct Object Reference). |
| **`Search & pagination applied after owner filter`** | Verifies that keyword search and pagination limits do not leak tickets outside the authenticated owner's scope. | Ensures aggregate queries remain constrained by owner context. |
| **`Ticket creation ignores spoofed owner`** | Asserts that if a client request body submits `user: "victim-id"`, the backend ignores the payload and binds `req.user.id`. | Prevents identity spoofing during ticket submission. |
| **`Admin queue includes tickets from all users`** | Validates that administrative queries correctly aggregate tickets across all platform users. | Confirms support staff visibility across customer tickets. |
| **`Customer cannot reply to another customer's ticket`** | Asserts that unauthorized users cannot append threaded messages to tickets they do not own. | Thread integrity and reply authorization. |

---

## 2. Running Automated Tests

### Inside Docker Compose (Recommended)
To execute tests within the running backend container:

```bash
docker compose exec server node --test tests/ticketOwnership.test.js
```

Expected output:
```text
✔ User A receives only User A tickets (3.42ms)
✔ User B receives only User B tickets (1.12ms)
✔ User A cannot retrieve User B ticket by ID, while staff retain access (2.15ms)
✔ search and pagination are applied after the authenticated owner filter (1.08ms)
✔ ticket creation ignores a frontend owner and assigns the authenticated user (1.31ms)
✔ admin ticket queue continues to include tickets from all users (1.45ms)
✔ a customer cannot reply to another customer's ticket (0.98ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### On Host Machine (Bare-Metal)
If running Node 20+ locally on your host:

```bash
cd Server
node --test tests/ticketOwnership.test.js
```

---

## 3. Frontend Quality Checks & Linting

The frontend incorporates static code analysis and production build verification:

### 1. ESLint Code Analysis
Run ESLint to inspect React 19 code quality, hook dependencies, and syntax rules:

```bash
cd Clients
npm run lint
```

### 2. Production Build Verification
Execute Vite's production compiler to verify that all JSX, Tailwind directives, and imports bundle cleanly without type or syntax errors:

```bash
cd Clients
npm run build
```

Expected output:
```text
vite v6.3.5 building for production...
transforming...
✓ 1420 modules transformed.
rendering chunks...
computing chunk sizes...
dist/index.html                   0.82 kB │ gzip:  0.44 kB
dist/assets/index-DkL291.css     48.12 kB │ gzip:  9.81 kB
dist/assets/index-BcK182.js     412.30 kB │ gzip: 124.60 kB
✓ built in 1.45s
```

---

## 4. API Testing via Swagger UI

The backend includes an interactive OpenAPI 3.0 specification served via Swagger UI at **`http://localhost:3001/api-docs`**.

### Testing Workflow:
1. Open [http://localhost:3001/api-docs](http://localhost:3001/api-docs) in your web browser.
2. Expand the **Auth** section and execute `POST /auth/login`.
3. Copy the returned JWT token.
4. Click the green **Authorize** button at the top-right of the page and paste the token as `Bearer <token>`.
5. Test protected endpoints (e.g., `POST /plans/risk-score`, `GET /claims/me`, `POST /applications/apply`) directly in your browser.

---

## 5. Manual Testing Checklist

| Step | Area | Test Procedure | Expected Result |
| :---: | :--- | :--- | :--- |
| **1** | **Registration** | Complete 3-step registration form at `/auth`. | Account created, no infinite button loading, auto-redirect to dashboard. |
| **2** | **Brute-Force Lock** | Intentionally fail login 5 consecutive times. | Account is locked for 15 minutes; subsequent attempts fail with 401 error. |
| **3** | **Plan Browsing** | Filter plans by `Family` category and toggle monthly/annual pricing. | Catalog filters accurately; annual premium virtual displays correctly. |
| **4** | **Application Filing**| Submit an application with uploaded PDF at `/dashboard/apply/:id`. | Application created with status `pending`; documents accessible under `/uploads`. |
| **5** | **Underwriting** | Log in as admin, navigate to `/admin/applications`, click **Approve**. | Application marked `approved`; new active `Policy` generated with unique number. |
| **6** | **Claim Submission**| From customer dashboard, file a claim referencing active policy with receipt. | Claim created with status `Pending`. |
| **7** | **Adjudication** | As admin, review claim under `/admin/all-claims` and click **Approve**. | Claim transitions to `Approved`; reviewed timestamp and admin ID recorded. |
| **8** | **AI Policy Chat** | Open AI chat widget and query: *"What is my deductible?"* | Grounded factual answer returned with source citation (if Gemini key configured). |
| **9** | **SLA Cron** | File emergency ticket; wait for cron cycle. | Overdue ticket escalates to `EMERGENCY` priority and triggers notification. |

---

## 6. Test Coverage Analysis & Gap Identification

While the current test suite thoroughly validates ticket ownership and authorization logic, the following automated tests are recommended for future test expansion:

1. **Authentication Integration Tests:** Automated tests covering brute-force lockout timers, token expiration, and password reset flows using Supertest.
2. **Claims Adjudication State Machine Tests:** Automated unit tests asserting that claims cannot be approved after rejection or filed against expired policies.
3. **RAG Vector Search Mocks:** Unit tests validating `$vectorSearch` pipeline fallback responses when no matching chunks meet cosine similarity thresholds.
4. **Frontend Component Tests:** Unit testing React forms and Zustand stores using Vitest and React Testing Library.
