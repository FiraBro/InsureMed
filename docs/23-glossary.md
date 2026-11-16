# 23. Glossary

This glossary provides definitions for key insurance domain terminology and technical software engineering concepts used throughout **InsureMed**.

---

## 1. Insurance Domain Terminology

### Insurance Plan
A standardized product offered by an insurance underwriter detailing covered healthcare benefits, premium rates, deductibles, network sizes, and terms of service (e.g., *Comprehensive Family Care*).

### Policy
A legally binding contract issued to an approved customer under a specific plan. A policy is identified by a unique `policyNumber` and defines the effective coverage window (`startDate` to `endDate`).

### Policyholder / Insured Member
The individual registered on the platform who owns an active insurance policy and receives medical coverage benefits.

### Applicant
A registered user who has submitted a digital enrollment application that is currently pending underwriting adjudication.

### Beneficiary / Nominee
The individual designated by the policyholder to receive policy proceeds or benefits in the event of incapacitation or death.

### Premium
The recurring monetary payment made by the policyholder to maintain insurance coverage. In InsureMed, premiums can be paid monthly, quarterly, or annually.

### Deductible
The predetermined dollar amount that a policyholder must pay out-of-pocket for covered healthcare services before the insurance company begins paying benefits.

### Coverage Ceiling / Maximum Benefit
The maximum total monetary amount an insurance policy will disburse for covered medical treatments within a given policy term (e.g., `$500,000`).

### Copayment (Copay)
A fixed, flat dollar fee paid by the insured member at the point of receiving a specific healthcare service (e.g., `$25 for a general physician visit` or `$75 for an MRI scan`).

### Coinsurance
The percentage of covered healthcare costs that the member pays after meeting their deductible (e.g., the insurer pays 80%, and the member pays 20%).

### Claim
A formal request submitted by a policyholder to the insurance company seeking monetary reimbursement for out-of-pocket medical expenses incurred at a healthcare facility.

### Adjudication
The administrative process of evaluating a submitted claim against policy terms, deductibles, and submitted medical invoices to decide whether to approve, adjust, or reject the claim.

### Pre-Existing Condition
A medical illness, injury, or health condition that the applicant was diagnosed with or received treatment for prior to the effective start date of the insurance policy.

### Waiting Period
The designated time window following policy activation during which specified treatments or pre-existing conditions are not yet eligible for claim reimbursements (e.g., `30 days`).

### Grace Period
The defined period (e.g., `30 days`) following a policy's `endDate` during which the policyholder can submit a renewal payment without losing continuous coverage or requiring new medical underwriting.

### Exclusion
Specific healthcare services, procedures, or medical circumstances explicitly not covered by the insurance policy (e.g., *cosmetic surgery* or *experimental therapies*).

---

## 2. Technical & Software Architecture Terminology

### API (Application Programming Interface)
A set of defined rules, HTTP endpoints, and data formats that allow the React frontend to communicate with the Express backend server.

### REST (Representational State Transfer)
An architectural style for network applications relying on stateless, client-server communication using standard HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

### Single Page Application (SPA)
A web application (such as the InsureMed React frontend) that loads a single HTML page and dynamically updates the Document Object Model (DOM) as the user interacts, eliminating page reloads.

### JWT (JSON Web Token)
A compact, URL-safe cryptographic token used to transmit claims between parties. InsureMed uses HMAC-SHA256 signed JWTs containing user IDs and roles for stateless session authentication.

### Bcrypt
A password-hashing function designed to defend against brute-force attacks by incorporating salting and an adjustable computational work factor (cost). InsureMed uses 10 salt rounds.

### RBAC (Role-Based Access Control)
A security paradigm that restricts system access based on assigned user roles (`customer`, `admin`, `agent`).

### IDOR (Insecure Direct Object Reference)
A security vulnerability where an application exposes references to internal objects (such as ticket IDs or claim IDs) without verifying that the requesting user owns that object. InsureMed mitigates IDOR via strict ownership checks in services and tests.

### Middleware
Software functions in the Express pipeline that execute sequentially during the request-response cycle, with access to `req`, `res`, and `next()` (e.g., `protect`, `rateLimit`, `upload`).

### Mongoose / ODM
An Object Data Modeling (ODM) library for MongoDB and Node.js that provides schema validation, type casting, query building, and business logic middleware.

### MongoDB Atlas Local
A specialized local container image (`mongodb/mongodb-atlas-local`) combining MongoDB 8.0 with the proprietary `mongot` search engine, enabling Atlas Search and Vector Search inside Docker.

### Vector Search
A technique for finding semantically similar information within a database by comparing mathematical vector representations rather than exact keyword matches.

### Embedding
A dense numerical vector (an array of floating-point numbers, e.g., 768 dimensions) that represents the semantic meaning of text. Text with similar meanings have high cosine similarity.

### RAG (Retrieval-Augmented Generation)
An AI architecture that enhances large language model responses by retrieving relevant, verified document chunks from a vector database and injecting them into the model's prompt as grounded context.

### Cosine Similarity
A mathematical metric that measures the cosine of the angle between two multi-dimensional vectors, evaluating how closely related two texts are regardless of their length.

### Prompt Guardrail
Explicit instructional constraints embedded into an AI system prompt to prevent prompt injection attacks, ensure adherence to factual context, and eliminate hallucinations.

### Redis
An open-source, in-memory data store used in InsureMed as a high-speed shared cache and distributed rate limiting backend.

### Rate Limiting
A defensive mechanism that controls the frequency of requests an individual IP address or user can send to the API within a specified time window.

### SLA (Service Level Agreement)
A formal commitment specifying the maximum allowable time within which a customer support ticket must be investigated and resolved based on its priority level.

### Cron Job
A time-based job scheduler that executes designated tasks at scheduled intervals (e.g., checking for overdue tickets every 5 minutes using `node-cron`).

### Docker Container
A lightweight, standalone, executable package of software that includes everything needed to run an application: code, runtime, system tools, and libraries.

### Docker Compose
A tool for defining and running multi-container Docker applications using a declarative YAML configuration file (`docker-compose.yml`).

### Named Volume vs. Bind Mount
- **Named Volume:** A storage location managed directly by Docker (`mongodb_health_data`), isolated from host directory structures, ideal for persistent databases.
- **Bind Mount:** A direct host file system link (`./Server:/app`) allowing live code edits on the host to immediately reflect inside the container.

### Hot Module Replacement (HMR)
A build tool feature (provided by Vite) that replaces, adds, or removes code modules while an application is running without triggering a full page reload, preserving component state.
