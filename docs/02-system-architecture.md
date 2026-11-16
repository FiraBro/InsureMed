# 02. System Architecture

## Architecture Overview

InsureMed is architected as a decoupled, multi-container client-server system. It leverages a modern Single Page Application (SPA) frontend, an asynchronous REST API backend, an in-memory Redis cache for rate limiting, and a containerized MongoDB Atlas Local instance featuring integrated Vector Search.

The application services communicate across an isolated internal Docker bridge network (`insuremed_default`), with targeted host port bindings for user and developer access.

---

## 1. High-Level System Architecture

The following diagram illustrates the physical and network topology of the InsureMed container stack:

```mermaid
graph TD
    ClientBrowser["User Web Browser<br>(Host Port 3000 / 3001)"]

    subgraph HostSystem["Docker Compose Environment (Network: insuremed_default)"]
        subgraph ClientContainer["Frontend Container: health_insurance_client"]
            ViteServer["Vite 6.3 Dev Server (Port 5173)"]
            ReactSPA["React 19 SPA<br>(Tailwind v4, Zustand, TanStack Query)"]
        end

        subgraph ServerContainer["Backend Container: health_insurance_api"]
            ExpressApp["Express 5.1 REST API (Port 3001)"]
            AuthEngine["Auth Module (JWT & Bcrypt)"]
            CronEngine["Node-Cron (SLA Escalation Engine)"]
            RAGModule["RAG Controller & Ingestion Service"]
        end

        subgraph RedisContainer["Cache Container: health_insurance_redis"]
            RedisEngine["Redis 7 Alpine (Port 6379)<br>Rate Limiter Store"]
        end

        subgraph MongoContainer["Database Container: mongodb_health_insurance"]
            MongoServer["MongoDB Atlas Local 8.0 (Port 27017)"]
            Mongot["Atlas Search & Vector Engine (mongot)"]
            MongoStorage[("Persistent Named Volumes<br>/data/db, /data/configdb, /data/mongot")]
        end
    end

    subgraph ExternalServices["External Cloud APIs"]
        GeminiAPI["Google Gemini AI Platform<br>(gemini-2.5-flash & gemini-embedding-001)"]
        SMTPServer["SMTP Mail Server<br>(Optional Mail Delivery)"]
    end

    ClientBrowser -->|HTTP 3000| ViteServer
    ViteServer --> ReactSPA
    ReactSPA -->|HTTP 3001 REST /api/v1| ExpressApp

    ExpressApp -->|ioredis protocol (Port 6379)| RedisEngine
    ExpressApp -->|Mongoose SCRAM-SHA-256 (Port 27017)| MongoServer
    MongoServer --- Mongot
    MongoServer --- MongoStorage

    ExpressApp -->|HTTPS / REST| GeminiAPI
    ExpressApp -->|SMTP / TLS| SMTPServer
```

---

## 2. Frontend / Backend Communication

Communication between the frontend client and backend API operates over standard HTTP/REST protocols:

- **Base URL Configuration:** The frontend determines the API address through Vite's environment variable `import.meta.env.VITE_API_URL` (configured as `http://localhost:3001/api/v1` in `Clients/.env`).
- **Axios Interceptor Layer:** A centralized Axios instance (`Clients/src/lib/axios.js` and `services/`) handles request dispatching, automatic JSON header serialization, and error response extraction.
- **Cross-Origin Resource Sharing (CORS):** The Express backend configures `cors` with `credentials: true`. In development mode, the origin reflects incoming caller origins dynamically.
- **Credential Propagation:** The frontend transmits authentication state using two complementary mechanisms:
  1. **HTTP-Only Cookies:** Tokens stored in `jwt` or `token` cookies are automatically sent by the browser on cross-origin requests when `withCredentials = true`.
  2. **Authorization Headers:** When stored in memory or client storage, requests pass the token via `Authorization: Bearer <token>`.

---

## 3. Database Architecture & Vector Search

InsureMed utilizes **MongoDB Atlas Local** (`mongodb/mongodb-atlas-local:latest`) as its primary data store. Unlike standard Community MongoDB editions, Atlas Local incorporates the proprietary **`mongot`** background engine, enabling full Atlas Search and Vector Search capabilities locally inside Docker.

### Key Data Layer Characteristics
- **Connection Management:** Backend connects via Mongoose 8 (`Server/server.js`) using SCRAM-SHA-256 authentication against the `admin` authentication database:
  ```text
  mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb_health:27017/health_insurance?authSource=admin
  ```
- **Atlas Vector Search (`$vectorSearch`):** Vector embeddings generated for policy documents and FAQs are stored directly alongside document metadata in the `DocumentChunk` collection as 768-dimensional numerical arrays. The query engine uses the `$vectorSearch` aggregation pipeline stage to find nearest neighbors using cosine similarity.
- **Storage Persistence:** Three distinct Docker named volumes ensure complete local data durability:
  - `mongodb_health_data`: Persists the core database BSON records (`/data/db`).
  - `mongodb_health_config`: Persists MongoDB cluster metadata (`/data/configdb`).
  - `mongodb_mongot_data`: Persists Atlas Search Lucene/vector indexes (`/data/mongot`).

---

## 4. Redis Caching & Rate Limiting

Redis 7 (`redis:7-alpine`) acts as the distributed state and rate-limiting store:

- **Rate Limiting Middleware:** `Server/middlewares/rateLimit.js` couples `express-rate-limit` with `rate-limit-redis`.
- **Limiter Tiers:**
  - **Auth Limiter:** Restricts high-sensitivity endpoints (`/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/forgot-password`) to prevent credential stuffing.
  - **API Limiter:** General protection throttling abusive traffic patterns.
- **Fail-Safe Mechanism:** Redis connection errors are logged, preventing Redis outages from completely blocking API throughput in degraded states.

---

## 5. AI & Retrieval-Augmented Generation (RAG) Architecture

The platform embeds conversational policy intelligence using a RAG architecture:

```mermaid
sequenceDiagram
    autonumber
    actor User as Policyholder (Browser)
    participant Client as React Client (Chat UI)
    participant API as Express API (/api/v1/chat)
    participant RAG as RAG Service (rag.service.js)
    participant Gemini as Google Gemini API
    participant Mongo as MongoDB Atlas ($vectorSearch)

    User->>Client: Enters query ("What is my ER copay?")
    Client->>API: POST /api/v1/chat { message, userPlanTier }
    API->>RAG: retrieveRelevantChunks(message, planTier, 4)
    RAG->>Gemini: embedQuery(message) using gemini-embedding-001
    Gemini-->>RAG: Returns 768-dim query vector
    RAG->>Mongo: DocumentChunk.aggregate([$vectorSearch])
    Mongo-->>RAG: Returns top 4 matching policy text chunks
    RAG-->>API: Array of verified policy contexts
    API->>Gemini: generateContent([SystemPrompt + Context + History + Query])
    Gemini-->>API: Grounded factual response
    API-->>Client: Returns JSON { answer, sources }
    Client-->>User: Displays assistant reply with citations
```

### RAG Components
1. **Document Ingestion (`Server/services/rag.service.js`):** Text files (policy schedules, benefit grids) are chunked into 800-character blocks with 100-character overlaps and vectorized via `gemini-embedding-001`.
2. **Atlas Vector Query:** Matches the user query vector against indexed chunks filtered by the user's active `planTier` or public support tiers.
3. **Prompt Grounding:** Assembles retrieved chunks inside `<policy_documents>` tags and instructs Gemini 2.5 Flash to decline answering if the answer is not explicitly contained within the documents.

---

## 6. Request Lifecycle

Every client HTTP request follows a deterministic pipeline through Express middleware:

```mermaid
flowchart TD
    Req["Incoming HTTP Request"] --> CORS["CORS Middleware (Credentials & Origin Check)"]
    CORS --> Parser["Body Parser (express.json) & Cookie Parser"]
    Parser --> Static["Static Uploads Handler (/uploads)"]
    Static --> RateLimit["Redis Rate Limiter (express-rate-limit)"]
    RateLimit --> AuthCheck{"Route Protected?"}
    
    AuthCheck -- Yes --> Protect["protect.js (JWT Verification & User Lookup)"]
    Protect --> RoleCheck{"Role Authorized?"}
    RoleCheck -- Yes --> Restrict["restrictTo.js (Role Authorization Check)"]
    RoleCheck -- No --> Denied403["403 Forbidden Response"]
    AuthCheck -- No --> Validate["express-validator Rules"]
    Restrict --> Validate

    Validate --> ValPass{"Validation Passed?"}
    ValPass -- Yes --> Controller["Controller Layer"]
    ValPass -- No --> Err400["400 Bad Request (Validation Errors)"]

    Controller --> Service["Service Business Logic"]
    Service --> DB["Database / Redis Operations"]
    DB --> Service
    Service --> Controller
    Controller --> Success["200 / 201 JSON Success Response"]

    Controller -.->|Uncaught Error| ErrorHandler["globalErrorHandler (errorHandler.js)"]
    Service -.->|AppError| ErrorHandler
    ErrorHandler --> ErrResp["Structured Error JSON Response"]
```

---

## 7. Background Job Architecture

The system executes background tasks using `node-cron` inside the API container process:

- **SLA Ticket Escalation Job (`Server/cron/escalation.js`):** Runs every 5 minutes (`*/5 * * * *`).
  - **Warning Check:** Queries tickets with status `OPEN` or `IN_REVIEW` where the SLA deadline falls within the next 60 minutes (`slaDeadline < now + 1 hour`). Dispatches an email warning to the assigned agent.
  - **Escalation Check:** Queries overdue tickets (`slaDeadline < now`). Sets `isEscalated = true`, upgrades priority to `EMERGENCY`, and sends an urgent notification to administration.

---

## 8. Docker Service Topology & Port Mapping

| Service Name | Container Name | Base Image | Internal Port | Host Port | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `client` | `health_insurance_client` | `node:20-alpine` | `5173` | `3000` | Vite dev server hosting React 19 SPA |
| `server` | `health_insurance_api` | `node:20-alpine` | `3001` | `3001` | Express 5 REST API & Cron Worker |
| `redis` | `health_insurance_redis` | `redis:7-alpine` | `6379` | `6379` | Distributed cache and rate limit store |
| `mongodb_health` | `mongodb_health_insurance` | `mongodb/mongodb-atlas-local:latest` | `27017` | `27019` | MongoDB engine with Atlas Vector Search |

### Service Dependencies & Startup Sequencing
The stack utilizes Docker Compose conditional health dependencies to guarantee orderly startup:
1. `redis` starts first and executes `redis-cli ping` health checks.
2. `mongodb_health` starts concurrently, initializing the mongod daemon and Atlas Search engine.
3. `server` waits for both `redis` and `mongodb_health` to report **healthy** before running `npm run dev`.
4. `client` waits for `server` to be operational before running `npm start`.
