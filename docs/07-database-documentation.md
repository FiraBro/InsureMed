# 07. Database Documentation

## 1. Overview & Architecture

InsureMed uses **MongoDB Atlas Local 8.0** (`mongodb/mongodb-atlas-local:latest`) as its primary document database, mapped through **Mongoose 8.15.2**.

Unlike generic MongoDB deployments, this setup incorporates the containerized **`mongot`** service, which enables native **Atlas Search** and **Atlas Vector Search** capabilities directly in local development environments.

### Connection & Volumes
- **Connection URI Format:**
  ```text
  mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb_health:27017/health_insurance?authSource=admin
  ```
- **Storage Volumes:**
  - `mongodb_health_data` → `/data/db` (BSON data files)
  - `mongodb_health_config` → `/data/configdb` (Cluster configuration)
  - `mongodb_mongot_data` → `/data/mongot` (Vector & Lucene search indexes)

---

## 2. Entity-Relationship (ER) Diagram

The following Mermaid ER diagram illustrates the verified relationships across all 10 Mongoose models:

```mermaid
erDiagram
    User ||--o{ Policy : "holds"
    User ||--o{ Application : "submits"
    User ||--o{ Claim : "files"
    User ||--o{ Ticket : "creates"
    User ||--o{ Notification : "receives"
    User ||--o{ Ticket : "assigned to (agent/admin)"

    Plan ||--o{ Policy : "underwrites"
    Plan ||--o{ Application : "applied for"

    Policy ||--o{ Claim : "covers"
    Policy ||--o{ Ticket : "referenced by"
    Claim ||--o{ Ticket : "referenced by"

    User {
        ObjectId _id PK
        string fullName
        string email UK
        string password
        string role "admin | customer | agent"
        string membershipTier
        string status
        int loginAttempts
        date lockUntil
        boolean isVerified
    }

    Plan {
        ObjectId _id PK
        string name
        string slug UK
        number premium
        number coverageAmount
        number deductible
        string planType
        string status "published | draft"
        boolean isPopular
        int validityPeriod
    }

    Application {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId planId FK
        object personal
        object nominee
        object medical
        array documents
        string status "pending | approved | rejected"
        string rejectionReason
    }

    Policy {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId planId FK
        string policyNumber UK
        string status "active | expired | pending_renewal | renewed | cancelled"
        number premium
        date startDate
        date endDate
        object planSnapshot
        int renewalCount
    }

    Claim {
        ObjectId _id PK
        ObjectId user FK
        ObjectId policyId FK
        string policyNumber
        number amount
        string claimType
        string status "Pending | Approved | Rejected"
        string documentUrl
    }

    Ticket {
        ObjectId _id PK
        string ticketId UK
        ObjectId user FK
        ObjectId assignedTo FK
        ObjectId relatedPolicy FK
        ObjectId relatedClaim FK
        string category "CLAIM | PAYMENT | POLICY | ACCOUNT"
        string priority "LOW | MEDIUM | HIGH | EMERGENCY"
        string status "OPEN | IN_REVIEW | WAITING | RESOLVED | CLOSED"
        date slaDeadline
        boolean isEscalated
        array messages
    }

    Notification {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string message
        string category "claim | policy | payment | analytics"
        string priority "low | medium | high"
        boolean isRead
    }

    Setting {
        ObjectId _id PK
        string systemName
        string contactEmail
        string currency
        number globalTaxRate
        number renewalGracePeriod
        boolean maintenanceMode
        number autoApproveClaimsUnder
    }

    FAQ {
        ObjectId _id PK
        string question
        string answer
        string category "GENERAL | PAYMENT | CLAIM | POLICY"
        array embedding
        boolean isActive
    }

    DocumentChunk {
        ObjectId _id PK
        string documentName
        string category
        string planTier
        string content
        array embedding
    }
```

---

## 3. Detailed Model Specifications

### 1. User (`Server/models/user.js`)
The core identity and authentication record.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `fullName` | `String` | Required, Trimmed | Full legal name of the user. |
| `email` | `String` | Required, Unique, Lowercase | Primary login identifier. |
| `password` | `String` | Required, Min: 6, `select: false` | Bcrypt hashed password. Excluded from default queries. |
| `role` | `String` | Enum: `['admin', 'customer', 'agent']`, Default: `'customer'` | Authorization tier. |
| `phone` | `String` | Optional | Contact phone number. |
| `address` | `Object` | Nested: `{ street, city, state, zip, country }` | Mailing address. |
| `dateOfBirth` | `Date` | Optional | Date of birth for underwriting eligibility. |
| `gender` | `String` | Enum: `['male', 'female', 'other']` | Demographic record. |
| `membershipTier`| `String` | Default: `'Standard Member'` | Customer loyalty / tier level. |
| `status` | `String` | Default: `'active'` | Account status (`active`, `suspended`). |
| `isVerified` | `Boolean` | Default: `false` | Email verification status flag. |
| `loginAttempts` | `Number` | Default: `0` | Consecutive failed login counter for brute-force defense. |
| `lockUntil` | `Date` | Optional | Expiration timestamp of temporary login lock. |
| `resetPasswordToken` | `String` | Optional | SHA-256 hashed password reset token. |
| `resetPasswordExpire`| `Date` | Optional | Expiration date of reset token (10-minute lifetime). |

**Schema Methods:**
- `comparePassword(candidate)`: Compares plaintext candidate with hashed password via `bcrypt.compare`.
- `getResetToken()`: Generates random hex token, stores hashed value, and sets 10-minute expiration.
- `incrementLoginAttempts(maxAttempts = 5, lockTimeMs = 15m)`: Locks account when limit exceeded.
- `resetLoginAttempts()`: Clears login attempts and removes lock timestamp.

---

### 2. Plan (`Server/models/plan.js`)
Defines insurance products available for customer purchase.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | Required | Plan display title. |
| `slug` | `String` | Unique | URL-safe slug for SEO routing. |
| `premium` | `Number` | Required | Premium rate per payment frequency. |
| `coverageAmount`| `Number` | Required | Maximum insurance coverage ceiling. |
| `deductible` | `Number` | Default: `500` | Out-of-pocket deductible amount before coverage takes effect. |
| `currency` | `String` | Default: `'USD'` | Currency symbol/code. |
| `premiumFrequency`| `String`| Enum: `['monthly', 'quarterly', 'annually']` | Payment billing cycle. |
| `planType` | `String` | Enum: `['individual', 'family', 'senior', 'student', 'corporate', 'group', 'custom']` | Plan category. |
| `features` | `[String]` | Array of Strings | Highlighted benefits displayed on cards. |
| `exclusions` | `[String]` | Array of Strings | Explicit non-covered medical conditions or treatments. |
| `rating` | `Number` | Min: 0, Max: 5, Default: `4.5` | Customer review score. |
| `isPopular` | `Boolean` | Default: `false` | Highlight badge in catalog UI. |
| `status` | `String` | Enum: `['published', 'draft']`, Default: `'published'` | Visibility status. |
| `riskScore` | `Object` | Nested: `{ score: Number, recommendations: [String] }` | Underwriting risk evaluation. |

**Virtuals:**
- `annualPremium`: Automatically calculates annual premium (`premium * 12` for monthly, `premium * 4` for quarterly).

---

### 3. Policy (`Server/models/policy.js`)
An active legal contract underwriting an insured member under a specific plan.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `ObjectId` | Required, Ref: `'User'` | The policyholder. |
| `planId` | `ObjectId` | Required, Ref: `'Plan'` | The underwritten plan. |
| `policyNumber` | `String` | Required, Unique | Unique identifier (e.g., `POL-2026-9812`). |
| `status` | `String` | Enum: `['active', 'expired', 'pending_renewal', 'renewed', 'cancelled']` | Operational policy state. |
| `startDate` | `Date` | Required | Coverage effective date. |
| `endDate` | `Date` | Required | Policy expiration date. |
| `premium` | `Number` | Required | Premium price locked at issuance. |
| `planSnapshot` | `Object` | `{ name, coverageAmount, planType }` | Immutable snapshot of plan terms at purchase. |
| `renewalCount` | `Number` | Default: `0` | Number of times the policy has been renewed. |
| `cancellationReason`| `String`| Optional | Audit explanation if policy was cancelled. |

---

### 4. Application (`Server/models/application.js`)
Customer submission requesting enrollment into an insurance plan.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `ObjectId` | Required, Ref: `'User'` | The applicant. |
| `planId` | `ObjectId` | Required, Ref: `'Plan'` | Requested insurance plan. |
| `personal` | `Object` | `{ fullName, email, phone, dob, address }` | Snapshot of applicant personal data. |
| `nominee` | `Object` | `{ name, relationship }` | Designated policy beneficiary. |
| `medical` | `Object` | `{ history, otherDetails }` | Disclosed pre-existing medical conditions. |
| `documents` | `[Object]` | `[{ name, url, fileType, size, uploadedAt }]` | Attached identity/medical documents. |
| `payment` | `Object` | `{ frequency, method }` | Selected payment frequency and channel. |
| `status` | `String` | Enum: `['pending', 'approved', 'rejected']` | Adjudication status. |
| `rejectionReason`| `String`| Optional | Explanation provided by admin upon rejection. |

---

### 5. Claim (`Server/models/claim.js`)
Reimbursement request filed by a policyholder against an active policy.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Required, Ref: `'User'` | Claim filer. |
| `policyNumber` | `String` | Required | Associated policy number. |
| `policyId` | `ObjectId` | Optional, Ref: `'Policy'` | Direct reference to the policy document. |
| `reason` | `String` | Required | Diagnosis, incident description, or treatment details. |
| `claimType` | `String` | Required | Claim classification (e.g., Hospitalization, Pharmacy). |
| `amount` | `Number` | Required | Claimed monetary amount. |
| `documentUrl` | `String` | Optional | Path to uploaded receipt/invoice file in `/uploads`. |
| `status` | `String` | Enum: `['Pending', 'Approved', 'Rejected']` | Adjudication outcome. |
| `submittedAt` | `Date` | Default: `Date.now` | Filing timestamp. |
| `reviewedAt` | `Date` | Optional | Date administrative review occurred. |

---

### 6. Ticket (`Server/models/ticket.js`)
Customer service support thread with SLA tracking.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `ticketId` | `String` | Unique, Uppercase | Human-readable identifier (e.g., `TIC-582910`). Auto-generated in pre-save hook. |
| `user` | `ObjectId` | Required, Ref: `'User'` | Customer owner. |
| `category` | `String` | Enum: `['CLAIM', 'PAYMENT', 'POLICY', 'ACCOUNT']` | Inquiry subject classification. |
| `priority` | `String` | Enum: `['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']` | Severity level. |
| `status` | `String` | Enum: `['OPEN', 'IN_REVIEW', 'WAITING', 'RESOLVED', 'CLOSED']` | Lifecycle state. |
| `relatedPolicy`| `ObjectId` | Ref: `'Policy'` | Contextual link to a policy. |
| `relatedClaim` | `ObjectId` | Ref: `'Claim'` | Contextual link to a claim. |
| `slaDeadline` | `Date` | Required | SLA resolution target date. |
| `warningSent` | `Boolean` | Default: `false` | Flag set when 1-hour warning email is dispatched. |
| `isEscalated` | `Boolean` | Default: `false` | Flag indicating SLA deadline breach. |
| `assignedTo` | `ObjectId` | Ref: `'User'` | Staff member assigned to ticket. |
| `messages` | `[Object]` | `[{ sender, message, attachments, createdAt }]` | Threaded discussion messages. |

---

### 7. Notification (`Server/models/notification.js`)
System alert delivered to user notification feeds.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `ObjectId` | Required, Ref: `'User'` | Recipient user. |
| `title` | `String` | Required | Short alert headline. |
| `message` | `String` | Required | Detailed alert body. |
| `category` | `String` | Enum: `['claim', 'policy', 'payment', 'analytics']` | Event category. |
| `priority` | `String` | Enum: `['low', 'medium', 'high']` | Alert severity. |
| `isRead` | `Boolean` | Default: `false` | Read status. |
| `metadata` | `Object` | Default: `{}` | Context data (e.g., `{ policyNumber, claimId }`). |

---

### 8. Setting (`Server/models/setting.js`)
Singleton document configuring global platform parameters.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `systemName` | `String` | Default: `'InsuTrack Pro'` | Global application branding title. |
| `contactEmail` | `String` | Default: `'admin@insutrack.com'`| System administrative email address. |
| `currency` | `String` | Default: `'USD'` | Global base financial currency. |
| `globalTaxRate`| `Number` | Default: `15` | Percentage tax applied to premiums. |
| `renewalGracePeriod`| `Number`| Default: `30` | Days allowed after expiration to renew without penalty. |
| `maintenanceMode`| `Boolean`| Default: `false` | System-wide read-only maintenance toggle. |
| `autoApproveClaimsUnder`| `Number`| Default: `0` | Threshold below which claims auto-approve (0 = manual). |

---

### 9. FAQ (`Server/models/faq.js`)
Pre-compiled frequently asked questions used for instant help search.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `question` | `String` | Trimmed | The FAQ prompt text. |
| `answer` | `String` | Text | The verified answer. |
| `category` | `String` | Enum: `['GENERAL', 'PAYMENT', 'CLAIM', 'POLICY']` | Topic classification. |
| `embedding` | `[Number]` | Array of Floats | Vector embedding of question for semantic search. |
| `isActive` | `Boolean` | Default: `true` | Visibility toggle. |

---

### 10. DocumentChunk (`Server/models/DocumentChunk.js`)
Text chunks and 768-dimensional vector embeddings for RAG retrieval.

| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `documentName` | `String` | Required, Indexed | Source document title (e.g., `Individual_Health_2026.pdf`). |
| `category` | `String` | Required, Lowercase, Indexed | Document domain (e.g., `coverage`, `exclusions`). |
| `planTier` | `String` | Required, Indexed | Target plan tier (`Bronze`, `Silver`, `Gold`, `support`, `All`). |
| `content` | `String` | Required | Raw 800-character text segment. |
| `embedding` | `[Number]` | Required, `select: false` | 768-dimensional float vector produced by `gemini-embedding-001`. |

---

## 4. Database Seeding & Initialization

### Administrator Creation (`Server/seed/createAdmin.js`)
Creates the root administrator account:
```bash
docker compose exec server node seed/createAdmin.js
```
The script loads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `Server/.env`, hashes the password via Mongoose pre-save hooks, and assigns `role: "admin"`.

### FAQ Seeding (`Server/seed.js`)
Populates common health insurance FAQs and generates vector embeddings:
```bash
docker compose exec server node seed.js
```
*Note: Requires a valid `GEMINI_API_KEY` configured in `Server/.env`.*

---

## 5. Database Backup and Restoration

### Creating a Database Dump
To create a complete BSON backup of the `health_insurance` database from the running container:

```bash
docker compose exec mongodb_health mongodump \
  --username admin \
  --password <MONGO_ROOT_PASSWORD> \
  --authenticationDatabase admin \
  --db health_insurance \
  --out /data/backup
```

To copy the backup directory from the container to the host:
```bash
docker cp mongodb_health_insurance:/data/backup ./local_mongodb_backup
```

### Restoring a Database Dump
To restore a backup into the database:

```bash
docker cp ./local_mongodb_backup mongodb_health_insurance:/data/backup

docker compose exec mongodb_health mongorestore \
  --username admin \
  --password <MONGO_ROOT_PASSWORD> \
  --authenticationDatabase admin \
  --db health_insurance \
  /data/backup/health_insurance
```
