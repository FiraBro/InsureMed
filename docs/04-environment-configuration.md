# 04. Environment Configuration

InsureMed separates configuration from code by relying on environment variables across three distinct tiers:
1. **Root Docker Compose Environment:** Manages container orchestration and database root credentials.
2. **Backend API Environment:** Controls database connections, security keys, mail servers, and AI integration.
3. **Frontend Client Environment:** Configures client-side API routing.

This document serves as the definitive reference for every environment variable supported by the platform.

---

## 1. Environment Variable Reference Matrix

| Variable Name | Service | Required? | Default / Example Value | Description & Security Impact |
| :--- | :--- | :--- | :--- | :--- |
| `MONGO_ROOT_USER` | `docker-compose.yml`, MongoDB | **Required** | `admin` | Root username for MongoDB container initialization. |
| `MONGO_ROOT_PASSWORD` | `docker-compose.yml`, MongoDB | **Required** | `<strong-random-password>` | Root password for MongoDB. **Critical Security Key:** Must never be committed to Git. Enforced via `${MONGO_ROOT_PASSWORD:?}` syntax in Compose. |
| `PORT` | `server` (Backend) | Optional | `3001` | TCP port on which the Express HTTP server listens. |
| `NODE_ENV` | `server` (Backend) | **Required** | `development` / `production` | Dictates error verbosity and stack trace exposure in API responses. In `production`, internal stack traces are suppressed. |
| `MONGODB_URI` | `server` (Backend) | **Required** | `mongodb://admin:<pass>@mongodb_health:27017/health_insurance?authSource=admin` | Full MongoDB connection string. Must target `mongodb_health` inside Docker Compose, or `localhost:27019` when running bare-metal. |
| `REDIS_URL` | `server` (Backend) | **Required** | `redis://redis:6379` | Connection URI for the Redis cache instance. Target `redis:6379` inside Docker, or `redis://localhost:6379` bare-metal. |
| `JWT_SECRET` | `server` (Backend) | **Required** | `<32-char-random-string>` | Cryptographic secret used to sign and verify JSON Web Tokens. **Critical:** Must be at least 32 characters long. Compromise allows token forgery. |
| `CLIENT_URL` | `server` (Backend) | **Required** | `http://localhost:3000` | Frontend origin URL. Used to construct verification links in automated emails and configure CORS headers. |
| `ADMIN_EMAIL` | `server` (Seed Script) | Optional | `admin@insuremed.local` | Email address used when executing `seed/createAdmin.js` to create the initial administrative user. |
| `ADMIN_PASSWORD` | `server` (Seed Script) | Optional | `<strong-admin-password>` | Password used when executing `seed/createAdmin.js`. Must be at least 6 characters. |
| `GEMINI_API_KEY` | `server` (Backend) | Optional | `AIzaSy...` | API key from Google AI Studio. Required for AI policy chat (`/api/v1/chat`), FAQ embeddings (`seed.js`), and document ingestion (`rag.service.js`). |
| `GEMINI_GENERATION_MODEL` | `server` (Backend) | Optional | `gemini-2.5-flash` | The Gemini model name for conversational text generation. Defaults to `gemini-2.5-flash`. |
| `GEMINI_EMBEDDING_MODEL` | `server` (Backend) | Optional | `gemini-embedding-001` | The Gemini model used to generate document and query vector embeddings. Defaults to `gemini-embedding-001`. |
| `GEMINI_EMBEDDING_DIMENSIONS`| `server` (Backend) | Optional | `768` | Numerical dimensionality of generated vector embeddings. **Must match 768** to align with the MongoDB Atlas vector index. |
| `ATLAS_VECTOR_INDEX` | `server` (Backend) | Optional | `vector_index` | The name of the Atlas Search vector index defined in MongoDB. Defaults to `vector_index`. |
| `SMTP_HOST` | `server` (Backend) | Optional | `smtp.example.com` | Hostname of the outbound SMTP mail server. If left unconfigured, the application bypasses mail delivery without hanging. |
| `SMTP_PORT` | `server` (Backend) | Optional | `587` | Port for outbound SMTP connections (typically 587 for TLS or 465 for SSL). |
| `SMTP_USER` | `server` (Backend) | Optional | `username@example.com` | Username for SMTP server authentication. |
| `SMTP_PASS` | `server` (Backend) | Optional | `<smtp-secret-password>` | Password or app password for SMTP server authentication. |
| `SMTP_FROM` | `server` (Backend) | Optional | `noreply@insuremed.local` | The sender email address displayed on automated transactional emails. |
| `VITE_API_URL` | `client` (Frontend) | **Required** | `http://localhost:3001/api/v1` | Base REST API URL consumed by Axios in the client web application. |

---

## 2. Sanitized Configuration Templates

Below are exact, sanitized templates that can be used to set up local environments.

### A. Root Docker Compose File: `.env`
Place this file in the project root alongside `docker-compose.yml`:

```dotenv
# ==========================================
# InsureMed Root Docker Compose Configuration
# ==========================================
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=replace-with-a-strong-random-password
```

### B. Backend API File: `Server/.env`
Place this file in `/home/nasir/InsureMed/Server/.env`:

```dotenv
# ==========================================
# InsureMed Backend Environment Configuration
# ==========================================
PORT=3001
NODE_ENV=development

# Database & Cache Connections
# Note: When using Docker Compose, use container hostnames: mongodb_health and redis
MONGODB_URI=mongodb://admin:replace-with-a-strong-random-password@mongodb_health:27017/health_insurance?authSource=admin
REDIS_URL=redis://redis:6379

# Security & Client URL
JWT_SECRET=replace-with-a-random-secret-key-at-least-32-characters-long
CLIENT_URL=http://localhost:3000

# Administrator Setup (used by seed/createAdmin.js)
ADMIN_EMAIL=admin@insuremed.local
ADMIN_PASSWORD=replace-with-a-strong-admin-password

# Google Gemini AI & Vector Search Configuration
# (Required for AI Chat, FAQ search, and RAG document ingestion)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_GENERATION_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
GEMINI_EMBEDDING_DIMENSIONS=768
ATLAS_VECTOR_INDEX=vector_index

# Outbound Email Configuration (SMTP)
# (Optional for local testing; when unconfigured, emails are bypassed safely)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@insuremed.local
```

### C. Frontend Client File: `Clients/.env`
Place this file in `/home/nasir/InsureMed/Clients/.env`:

```dotenv
# ==========================================
# InsureMed Frontend Environment Configuration
# ==========================================
VITE_API_URL=http://localhost:3001/api/v1
```

---

## 3. Configuration Security Best Practices

### Git Secret Protection
The root `.gitignore` file enforces that local `.env` files are never tracked by version control:

```gitignore
.env
*.env
.env.*
!.env.example
```

> [!CAUTION]
> Always verify that `git status` shows no `.env` files staged before creating commits or pushing to remote repositories.

### File Permissions
On Linux and macOS hosts, restrict read permissions of private `.env` files to the owning developer:

```bash
chmod 600 .env Server/.env Clients/.env
```

### Unconfigured Service Graceful Degradation
InsureMed is designed to remain fully functional for core operations even when external third-party credentials are not configured:
- **Missing `GEMINI_API_KEY`:** Core plan browsing, application filing, claim processing, and user authentication operate normally. Only AI chat endpoints (`/api/v1/chat`) return a `503 Service Unavailable` error explaining that AI keys are unconfigured.
- **Missing `SMTP_HOST`:** The email utility (`Server/utils/sendEmail.js`) detects the missing host immediately and logs a bypass notice rather than hanging for network timeouts. User registration, password resets, and SLA escalations proceed without delay.
