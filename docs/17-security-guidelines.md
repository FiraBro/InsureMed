# 17. Security Guidelines

This document outlines the security controls, authentication safeguards, data protection mechanisms, and architectural recommendations implemented in **InsureMed**.

---

## 1. Summary of Security Controls

| Domain | Implemented Protection | Verification Reference |
| :--- | :--- | :--- |
| **Password Storage** | Salted Bcrypt hashing (10 salt rounds). Strips `passwordConfirm` prior to persistence. Excluded from query results by default (`select: false`). | `Server/models/user.js` |
| **Session Security** | Digitally signed JSON Web Tokens (JWT). Dual-support for HTTP-Only cookies and Authorization Bearer headers. Invalidates tokens if password is changed after issuance. | `Server/middlewares/protect.js` |
| **Brute-Force Defense** | Automatic account lockout: 5 consecutive failed login attempts trigger an immediate 15-minute account freeze (`lockUntil`). | `Server/models/user.js` |
| **Rate Limiting** | Redis-backed distributed rate limiters (`rate-limit-redis`). Restricts auth endpoints to 5 requests per 15-minute window per IP. | `Server/middlewares/rateLimit.js` |
| **Role Authorization** | Granular RBAC (`restrictTo`) separating `customer`, `admin`, and `agent` permissions. Strict ownership checks on claims and tickets. | `Server/middlewares/protect.js` |
| **Input Validation** | Declarative request payload validation and sanitization using `express-validator`. Rejects malformed requests with field-level errors. | `Server/validators/` |
| **Secret Management** | Root `.gitignore` prevents tracking `.env` files. Compose enforces required passwords via interpolation validation (`${MONGO_ROOT_PASSWORD:?}`). | `.gitignore`, `docker-compose.yml` |
| **Data Protection** | Database credentials protected via SCRAM-SHA-256. Database containers reside on an isolated internal Docker bridge network. | `docker-compose.yml` |

---

## 2. Secrets Management & Version Control Protection

### Local Environment Files
The repository contains **zero plaintext production secrets**. All local configurations are isolated inside untracked files:
- Root orchestration credentials: `.env`
- Backend API secrets: `Server/.env`
- Frontend client settings: `Clients/.env`

### Git Ignore Enforcement
The root `.gitignore` file explicitly blacklists environment files from ever being staged or committed to Git:

```gitignore
.env
*.env
.env.*
!.env.example
```

> [!CAUTION]
> Before executing `git commit` or `git push`, always inspect `git status` to ensure that no `.env` or credential files appear in the untracked or staged lists.

### File Permissions
On Linux and macOS developer workstations, restrict local file permissions so that only the owning user can read environment secrets:

```bash
chmod 600 .env Server/.env Clients/.env
```

---

## 3. Authentication & Password Security

### Password Policy
- **Minimum Length:** Enforced at 6 characters minimum (recommend 12+ for production).
- **Confirmation Check:** Registration and password update endpoints require identical `password` and `passwordConfirm` fields.
- **Salted Hashing:** Uses `bcrypt.genSalt(10)` and `bcrypt.hash()` in Mongoose pre-save hooks. Raw passwords never touch database storage.
- **Query Projection Isolation:** The `password` field is configured with `select: false`. Standard database queries (`User.findById`, `User.find`) omit password hashes from memory unless explicitly requested via `.select("+password")`.

### Session Token Security (JWT)
- **Signature Algorithm:** HMAC-SHA256 using `process.env.JWT_SECRET`.
- **Minimum Key Length:** `JWT_SECRET` must be a high-entropy string of at least 32 random characters.
- **Password Modification Invalidation:** The `User` model records `passwordChangedAt`. If a user updates their password after a JWT is generated, `protect.js` detects the discrepancy (`changedPasswordAfter(decoded.iat)`) and revokes the session immediately, requiring re-authentication across all devices.

---

## 4. Rate Limiting & Denial-of-Service (DoS) Mitigation

InsureMed deploys distributed rate limiters using Redis as the shared memory store (`Server/middlewares/rateLimit.js`):

```javascript
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

// Applied to sensitive authentication endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: {
    status: "fail",
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

By leveraging Redis rather than in-memory process caches, rate limiting remains uniform even when scaling to multiple backend API container replicas.

---

## 5. Input Validation & Data Sanitization

All client input undergoes strict validation prior to reaching business services:

- **Library:** `express-validator`
- **Validation Pipeline:**
  1. Route chains validator rules (e.g., `registerValidator`, `createClaimValidator`).
  2. Middleware `validate` (`Server/middlewares/validateMiddleware.js`) inspects `validationResult(req)`.
  3. If errors are present, request execution halts immediately, returning a `400 Bad Request` with field-level explanations.
- **Multer File Validation:**
  - File upload middleware (`Server/middlewares/upload.js`) inspects file extensions and MIME types.
  - Uploaded files are assigned randomized unique filenames (e.g., `document-1731792000-8912.pdf`) to prevent path traversal attacks.

---

## 6. Network & Database Security

- **Network Isolation:** In Docker Compose, the database (`mongodb_health`) and cache (`redis`) communicate with the API backend over the internal bridge network (`insuremed_default`).
- **Authentication Database:** MongoDB connection strings enforce `authSource=admin` using SCRAM-SHA-256 challenge-response authentication.
- **CORS Configuration:**
  - In development, CORS accepts incoming origins to facilitate local testing.
  - For production deployment, CORS must be explicitly locked to the verified production frontend domain (`process.env.CLIENT_URL`).

---

## 7. Production Hardening Recommendations

While InsureMed implements strong application-level security, production deployments should execute the following infrastructure enhancements:

| Area | Current Development State | Recommended Production Standard |
| :--- | :--- | :--- |
| **Transport Layer (TLS)** | Unencrypted HTTP on ports 3000 & 3001. | Enforce HTTPS/TLS 1.3 across all endpoints using automated Let's Encrypt certificates on a reverse proxy (Nginx / Cloudflare). |
| **Cookie Flags** | Cookies issued with `SameSite=Lax`. | Set `Secure: true` in production cookies so they are transmitted solely over HTTPS connections. |
| **CORS Policy** | Reflects caller origin for development flexibility. | Whitelist exact domain: `origin: "https://insuremed.example.com"`. |
| **Database Exposure** | Port 27019 exposed to host for development GUI tools. | Remove host port mapping `27019:27017` in production Compose files; allow access exclusively via internal container network. |
| **Container User** | Containers execute under default image users. | Configure explicit unprivileged non-root user (`USER node`) in Dockerfiles. |
| **Automated Backups** | Manual `mongodump` commands. | Automated daily snapshots using MongoDB Atlas Cloud or scheduled off-site S3 backup scripts. |
