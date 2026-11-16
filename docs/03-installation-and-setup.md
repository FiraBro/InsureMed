# 03. Installation and Setup Guide

This guide walks through setting up and running **InsureMed** on a local development machine or server.

The recommended deployment method is **Docker Compose**, which runs the frontend, backend, Redis, and MongoDB Atlas Local in isolated containers with zero manual database configuration. A bare-metal instructions section is also provided for non-containerized development.

---

## 1. System Requirements & Prerequisites

### Minimum Hardware
- **CPU:** 2 cores (4 cores recommended for Atlas Vector Search)
- **RAM:** 4 GB minimum (8 GB recommended)
- **Disk:** 10 GB free disk space

### Operating System Compatibility
- **Linux:** Ubuntu 22.04 / 24.04 LTS, Linux Mint 21 / 22, Debian 12
- **macOS:** macOS Monterey 12+ (Apple Silicon or Intel)
- **Windows:** Windows 10/11 with WSL2 enabled

### Required Software
1. **Git:** Distributed version control
2. **Docker Engine:** Version 24.0 or newer
3. **Docker Compose:** Version 2.20 or newer (`docker compose` v2 syntax)

---

## 2. Installing Prerequisites on Ubuntu / Linux Mint

If Docker is not already installed on your machine, follow these instructions.

> [!WARNING]
> **Linux Mint Package Codename Notice:**  
> Linux Mint uses unique release codenames (e.g., `zena` for Mint 22.3). The official Docker apt repository only recognizes Ubuntu base codenames (e.g., `noble` for Ubuntu 24.04). Use `UBUNTU_CODENAME` rather than `$(lsb_release -cs)` when configuring the Docker apt repository.

Run the following commands to install official Docker Engine and Docker Compose:

```bash
# 1. Update existing packages and install utilities
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 2. Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Detect the underlying Ubuntu base codename
UBUNTU_BASE=$(. /etc/os-release && echo ${UBUNTU_CODENAME:-$VERSION_CODENAME})

# 4. Set up the stable Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  ${UBUNTU_BASE} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine, CLI, Containerd, and Compose Plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Enable non-root user execution (avoids 'permission denied' errors)
sudo usermod -aG docker $USER
```

> [!IMPORTANT]
> After adding your user to the `docker` group, apply the group changes without logging out by running:
> ```bash
> newgrp docker
> ```

Verify the installation:
```bash
docker --version
docker compose version
```

---

## 3. Cloning the Repository

Clone the project repository to your local workspace:

```bash
git clone <repository-url>
cd InsureMed
```

---

## 4. Environment Preparation

InsureMed requires three local environment files. None of these files contain real production secrets in version control; templates must be created locally.

### Step 4.1: Root Compose Environment (`.env`)
Create `.env` in the project root directory beside `docker-compose.yml`. This supplies the root credentials for the MongoDB Atlas Local container:

```bash
cat << 'EOF' > .env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=replace-with-a-strong-random-password
EOF

# Restrict permissions to the current user
chmod 600 .env
```

### Step 4.2: Backend Environment (`Server/.env`)
Copy the backend reference template and edit it with your chosen passwords:

```bash
cp Server/.env.example Server/.env
chmod 600 Server/.env
```

Open `Server/.env` in your text editor and ensure:
1. `MONGODB_URI` contains the exact password configured in the root `.env`:
   ```dotenv
   MONGODB_URI=mongodb://admin:replace-with-a-strong-random-password@mongodb_health:27017/health_insurance?authSource=admin
   ```
2. `JWT_SECRET` is set to a long, secure random string (minimum 32 characters).
3. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are defined with the credentials you want to use for the system administrator account.
4. Optional: If you wish to enable AI features, set your `GEMINI_API_KEY`.
5. Optional: If you wish to send emails, configure the `SMTP_*` parameters.

### Step 4.3: Frontend Environment (`Clients/.env`)
Create `Clients/.env` to point the frontend to the backend API:

```bash
cat << 'EOF' > Clients/.env
VITE_API_URL=http://localhost:3001/api/v1
EOF
```

---

## 5. Starting the Application with Docker Compose

Build and launch all four containers in detached mode:

```bash
docker compose up -d --build
```

Docker Compose will execute the following:
1. Pull `redis:7-alpine` and start the cache engine.
2. Pull `mongodb/mongodb-atlas-local:latest` and initialize the MongoDB engine with Atlas Search.
3. Build the backend image (`Server/Dockerfile`), install dependencies, and launch Express.
4. Build the frontend image (`Clients/Dockerfile`), install dependencies, and launch Vite.

### Verifying Service Health
Check the container status:

```bash
docker compose ps
```

Expected output:
```text
NAME                        IMAGE                                  COMMAND                  SERVICE          STATUS                    PORTS
health_insurance_api        insuremed-server                       "docker-entrypoint.s…"   server           running                   0.0.0.0:3001->3001/tcp
health_insurance_client     insuremed-client                       "docker-entrypoint.s…"   client           running                   0.0.0.0:3000->5173/tcp
health_insurance_redis      redis:7-alpine                         "docker-entrypoint.s…"   redis            running (healthy)         0.0.0.0:6379->6379/tcp
mongodb_health_insurance    mongodb/mongodb-atlas-local:latest     "docker-entrypoint.s…"   mongodb_health   running (healthy)         0.0.0.0:27019->27017/tcp
```

### Inspecting Container Logs
To follow live logs across all containers:
```bash
docker compose logs -f
```

To view logs for a specific service:
```bash
docker compose logs -f server
docker compose logs -f client
```

---

## 6. Creating the Initial Administrator Account

Once the database and server containers are running and healthy, seed the initial administrator account. The script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `Server/.env`:

```bash
docker compose exec server node seed/createAdmin.js
```

Expected output:
```text
DB connected
✅ Admin created: admin@insuremed.local
```

You can now use these credentials to log in to the administrative portal.

---

## 7. Accessing Application Interfaces

| Interface | URL | Description |
| :--- | :--- | :--- |
| **Customer Web Portal** | [http://localhost:3000](http://localhost:3000) | Public home page, plan comparison, self-service customer dashboard. |
| **Admin Portal** | [http://localhost:3000/admin](http://localhost:3000/admin) | Administrative back-office for underwriting, claims, and settings. |
| **REST API Server** | [http://localhost:3001](http://localhost:3001) | Health check and API root endpoint. |
| **Swagger API Docs** | [http://localhost:3001/api-docs](http://localhost:3001/api-docs) | Interactive OpenAPI 3.0 documentation and endpoint tester. |
| **MongoDB Atlas Local** | `localhost:27019` | Direct database connection for GUI tools (Compass, mongosh). |
| **Redis Cache** | `localhost:6379` | Direct Redis protocol connection for `redis-cli`. |

---

## 8. Stopping and Managing Services

### Stopping Without Data Loss (Recommended)
To pause or stop the application while **preserving all database records, policies, and volumes**:

```bash
docker compose stop
# or
docker compose down
```

### Restarting Services
To restart paused containers:

```bash
docker compose up -d
```

> [!CAUTION]
> **Destructive Data Command Warning:**  
> Never run `docker compose down -v` unless you explicitly intend to permanently erase all policies, users, claims, and database state. The `-v` flag removes the Docker named volumes (`mongodb_health_data`, etc.).

---

## 9. Alternative: Bare-Metal Setup (Without Docker)

If you prefer to run services directly on your host machine without Docker:

### Prerequisites
- Node.js 20.x or 22.x (`node -v`)
- npm 10.x (`npm -v`)
- MongoDB Community Server or Atlas running locally on port 27017
- Redis Server running locally on port 6379

### Setup Steps
1. **Configure Backend:**
   ```bash
   cd Server
   cp .env.example .env
   ```
   Update `Server/.env` hostnames from Docker names to localhost:
   ```dotenv
   MONGODB_URI=mongodb://localhost:27017/health_insurance
   REDIS_URL=redis://localhost:6379
   PORT=3001
   CLIENT_URL=http://localhost:3000
   ```
   Install and start the server:
   ```bash
   npm install
   npm run dev
   ```

2. **Configure Frontend:**
   Open a second terminal:
   ```bash
   cd Clients
   cat << 'EOF' > .env
   VITE_API_URL=http://localhost:3001/api/v1
   EOF
   npm install
   npm start
   ```
   The frontend will be accessible at [http://localhost:5173](http://localhost:5173).
