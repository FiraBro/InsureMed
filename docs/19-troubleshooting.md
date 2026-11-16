# 19. Troubleshooting Guide

This guide compiles solutions for actual and anticipated technical issues encountered during the development, containerization, and operation of **InsureMed**.

---

## 1. Quick Diagnostic Checklist

Before diving into specific issues, run these safe diagnostic commands to assess system health:

```bash
# 1. Check container running states and health checks
docker compose ps

# 2. Inspect backend logs for uncaught exceptions
docker compose logs --tail=100 server

# 3. Inspect database readiness
docker compose logs --tail=50 mongodb_health

# 4. Inspect Redis cache status
docker compose logs --tail=50 redis

# 5. Test backend API responsiveness
curl -i http://localhost:3001/
```

> [!CAUTION]
> **Avoid Destructive Reset Commands:**  
> Never run `docker compose down -v` to fix a runtime bug. The `-v` flag deletes the named volumes storing your policies, users, claims, and vector indexes. Always troubleshoot the running containers first.

---

## 2. Docker & Environment Issues

### Issue 1: "Permission denied while trying to connect to the Docker daemon socket"
- **Symptom:** Running `docker` or `docker compose` returns:
  ```text
  permission denied while trying to connect to the docker API at unix:///var/run/docker.sock
  ```
- **Root Cause:** The active Linux user account is not a member of the `docker` system group, or the session has not reloaded group privileges.
- **Resolution:**
  1. Add your user to the `docker` group:
     ```bash
     sudo usermod -aG docker $USER
     ```
  2. Reload group privileges in your current terminal session without logging out:
     ```bash
     newgrp docker
     ```

---

### Issue 2: Docker Build Fails with `EBADENGINE`
- **Symptom:** `docker compose up --build` fails during backend build with:
  ```text
  npm error code EBADENGINE
  npm error Unsupported engine for npm@12.2.2: wanted: {"node":"^22.13.0"} (current: {"node":"v20.20.2"})
  ```
- **Root Cause:** `Server/Dockerfile` contained `RUN npm install -g npm@latest`, which attempted to install npm 12+ (which requires Node 22) onto a Node 20 base image.
- **Resolution:** Open `Server/Dockerfile` and remove the line `RUN npm install -g npm@latest`. Use Node 20's bundled npm client:
  ```dockerfile
  FROM node:20-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 3001
  CMD ["npm", "run", "dev"]
  ```

---

### Issue 3: Port Conflicts (Port Already in Use)
- **Symptom:** Container startup fails with:
  ```text
  Bind for 0.0.0.0:3001 failed: port is already allocated
  ```
- **Root Cause:** A local host process (e.g., an existing Express instance, local MongoDB, or local Redis) is already listening on port `3000`, `3001`, `6379`, or `27019`.
- **Resolution:**
  1. Identify the process occupying the port:
     ```bash
     sudo lsof -i :3001
     ```
  2. Stop the conflicting host process:
     ```bash
     kill -9 <PID>
     ```
  3. Or change the host port mapping in `docker-compose.yml` (e.g., `"3002:3001"`).

---

## 3. Backend & API Issues

### Issue 4: Backend Hangs Indefinitely on Requests (Undefined `NODE_ENV`)
- **Symptom:** Calling an API endpoint causes the HTTP client to hang indefinitely until a gateway timeout occurs, with no response body.
- **Root Cause:** In `Server/middlewares/errorHandler.js`, error routing strictly checked `if (process.env.NODE_ENV === "development")` and `else if (process.env.NODE_ENV === "production")`. When `NODE_ENV` was undefined in `.env`, neither branch executed, and `res.status().json()` was never called.
- **Resolution:**
  1. Add `NODE_ENV=development` to `Server/.env`.
  2. Ensure `Server/middlewares/errorHandler.js` includes a default fallback:
     ```javascript
     if (process.env.NODE_ENV === "development") {
       sendErrorDev(err, res);
     } else if (process.env.NODE_ENV === "production") {
       sendErrorProd(err, res);
     } else {
       sendErrorDev(err, res); // Default safe fallback
     }
     ```

---

### Issue 5: Registration Form Stuck on "Processing..." (SMTP Timeout)
- **Symptom:** Clicking "Create Account" leaves the button disabled in an infinite "Processing..." state for over 2 minutes.
- **Root Cause:**
  1. `Server/utils/sendEmail.js` attempted to connect to an unconfigured SMTP host, triggering a 2-minute socket connection timeout.
  2. The frontend `Clients/src/services/authService.js` threw an unhandled promise rejection that bypassed `setIsLoading(false)` in `AuthForm.jsx`.
- **Resolution:**
  1. `Server/utils/sendEmail.js` now features an instant bypass when `SMTP_HOST` is empty:
     ```javascript
     if (!process.env.SMTP_HOST) {
       console.log(`[Email Bypass] Email skipped (SMTP_HOST not set).`);
       return { bypassed: true };
     }
     ```
  2. `Clients/src/pages/auth/form/AuthForm.jsx` wraps submission in `try/finally`:
     ```javascript
     try {
       setIsLoading(true);
       await register(formData);
     } finally {
       setIsLoading(false); // Guarantees button unlocks
     }
     ```

---

## 4. Frontend & Browser Issues

### Issue 6: Blank White Screen on `/auth` Page
- **Symptom:** Visiting `http://localhost:3000/auth` displays a completely blank white page.
- **Root Cause:**
  1. `Clients/src/hooks/useAdmin.js` unconditionally fired `GET /api/v1/admin/analytics/financials` upon app boot, even for unauthenticated visitors.
  2. The unauthenticated request failed with a 401 error.
  3. `Clients/src/App.jsx` contained `if (isLoading) return null;`, causing the entire application tree to render nothing while waiting for auth resolution.
- **Resolution:**
  1. In `Clients/src/hooks/useAdmin.js`, gate the query so it only executes when `user?.role === "admin"`:
     ```javascript
     enabled: !!user && user.role === "admin",
     ```
  2. In `Clients/src/App.jsx`, replace `return null;` with a proper fullscreen loading spinner.

---

### Issue 7: Network Error / CORS Rejections
- **Symptom:** Browser console logs:
  ```text
  Access to XMLHttpRequest has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
  ```
- **Root Cause:** The frontend cannot reach `http://localhost:3001/api/v1` because the backend API container is down, or `VITE_API_URL` is configured incorrectly.
- **Resolution:**
  1. Check backend status: `docker compose ps server`.
  2. Confirm `Clients/.env` has:
     ```dotenv
     VITE_API_URL=http://localhost:3001/api/v1
     ```
  3. Restart frontend: `docker compose restart client`.

---

## 5. Database & AI Issues

### Issue 8: Backend Cannot Connect to MongoDB
- **Symptom:** Server logs print:
  ```text
  ❌ MongoDB connection error: MongooseServerSelectionError: connect ECONNREFUSED
  ```
- **Root Cause:** Hostname mismatch. Inside Docker Compose, containers must connect to the service name `mongodb_health`, not `localhost`.
- **Resolution:**
  - In `Server/.env`, verify `MONGODB_URI`:
    ```dotenv
    MONGODB_URI=mongodb://admin:<password>@mongodb_health:27017/health_insurance?authSource=admin
    ```
  - *(Only use `localhost:27019` when running the backend bare-metal directly on the host machine).*

---

### Issue 9: AI Assistant Returns 503 "GEMINI_API_KEY is not configured"
- **Symptom:** The AI chat widget returns:
  ```json
  { "error": "GEMINI_API_KEY is not configured." }
  ```
- **Root Cause:** The `GEMINI_API_KEY` variable in `Server/.env` is either missing or empty.
- **Resolution:**
  1. Generate a free API key at [Google AI Studio](https://aistudio.google.com/).
  2. Add it to `Server/.env`:
     ```dotenv
     GEMINI_API_KEY=AIzaSy...
     ```
  3. Restart the backend container:
     ```bash
     docker compose restart server
     ```
