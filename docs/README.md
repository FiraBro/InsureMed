# InsureMed Documentation

Welcome to the official technical and operational documentation for **InsureMed** (Online Health Insurance Management System).

InsureMed is a full-stack, enterprise-grade health insurance management platform built with modern web technologies. It provides end-to-end management for health insurance plans, digital policy applications, claim filing and adjudication, support ticketing with SLA escalation, and an AI-powered policy inquiry assistant using Retrieval-Augmented Generation (RAG).

---

## Documentation Purpose & Audience

This documentation is designed to serve multiple technical and operational roles:

- **New Developers:** Rapid onboarding, local environment setup, architecture overview, and coding conventions.
- **Frontend Engineers:** Deep dive into React 19, Vite, Tailwind CSS v4, Zustand stores, React Router v7, and UI components.
- **Backend Engineers:** Comprehensive guide to Express 5, REST API design, middleware pipelines, service layers, and background cron jobs.
- **Database Administrators & Data Engineers:** MongoDB Atlas Local schema designs, Mongoose models, indexes, Atlas Vector Search embeddings, and persistence.
- **DevOps & System Administrators:** Docker Compose multi-container deployment, container health checks, networking, volume management, and production hardening.
- **Project Evaluators & Academic Reviewers:** System architecture, verified capabilities, roadmap, security practices, and domain workflows.
- **End Users & Administrators:** Practical, step-by-step guides for customer self-service and administrative management.

> [!NOTE]
> **Branding Discrepancy Note:**  
> The project repository and primary documentation use the name **InsureMed**. In parts of the existing client interface (such as the navigation logo), the platform is labeled as **OHIMS** (*Online Health Insurance Management System*), while backend configuration defaults reference **InsuTrack Pro**. These variations refer to the same unified codebase and will be aligned in future releases.

---

## Complete Documentation Index

| File | Title | Description | Target Audience |
| :--- | :--- | :--- | :--- |
| [01-project-overview.md](01-project-overview.md) | **Project Overview** | Problem statement, objectives, user personas, core features, and technology stack. | All |
| [02-system-architecture.md](02-system-architecture.md) | **System Architecture** | High-level architecture, container topology, request lifecycle, and Mermaid diagrams. | Engineers, Architects |
| [03-installation-and-setup.md](03-installation-and-setup.md) | **Installation & Setup** | Step-by-step setup for Linux/Ubuntu with Docker Compose and bare-metal environments. | Developers, DevOps |
| [04-environment-configuration.md](04-environment-configuration.md) | **Environment Configuration** | Reference table of all environment variables with sanitized templates. | Developers, DevOps |
| [05-frontend-documentation.md](05-frontend-documentation.md) | **Frontend Documentation** | React 19, Vite, Tailwind CSS v4, Zustand stores, React Router v7, and components. | Frontend Engineers |
| [06-backend-documentation.md](06-backend-documentation.md) | **Backend Documentation** | Express 5 architecture, controllers, services, middleware, error handling, and cron jobs. | Backend Engineers |
| [07-database-documentation.md](07-database-documentation.md) | **Database Documentation** | MongoDB Atlas Local, all 10 Mongoose models, indexes, and Mermaid ER diagram. | DBAs, Backend |
| [08-api-reference.md](08-api-reference.md) | **API Reference** | Complete REST API endpoint reference with methods, payloads, responses, and errors. | Backend, Frontend |
| [09-authentication-and-authorization.md](09-authentication-and-authorization.md) | **Authentication & Authorization** | Bcrypt hashing, JWT tokens, cookies, role-based access control, and account security. | Security, Backend |
| [10-user-guide.md](10-user-guide.md) | **User Guide** | Customer portal manual: browsing plans, applying, filing claims, and support. | End Users, Support |
| [11-administrator-guide.md](11-administrator-guide.md) | **Administrator Guide** | Admin operations: plan creation, application review, claim adjudication, and settings. | Administrators, Staff |
| [12-insurance-workflows.md](12-insurance-workflows.md) | **Insurance Workflows** | Business workflows: plan lifecycles, application processing, policies, and renewals. | Product, All |
| [13-claims-management.md](13-claims-management.md) | **Claims Management** | Claim submission, document verification, approval/rejection workflows, and rules. | Claims Adjusters, Admins |
| [14-support-and-notifications.md](14-support-and-notifications.md) | **Support & Notifications** | Ticketing system, priority levels, SLA escalation cron job, and email notifications. | Support, Backend |
| [15-ai-and-vector-search.md](15-ai-and-vector-search.md) | **AI & Vector Search** | Google Gemini 2.5 Flash, 768-dim embeddings, MongoDB `$vectorSearch`, and RAG pipeline. | AI Engineers, Backend |
| [16-docker-and-deployment.md](16-docker-and-deployment.md) | **Docker & Deployment** | Multi-container Compose stack, Dockerfiles, volumes, health checks, and production guidelines. | DevOps, SysAdmins |
| [17-security-guidelines.md](17-security-guidelines.md) | **Security Guidelines** | Password security, JWT policies, rate limiting, CORS, input sanitization, and recommendations. | Security, DevOps |
| [18-testing-and-quality-assurance.md](18-testing-and-quality-assurance.md) | **Testing & QA** | Automated test suite (`node:test`), frontend verification, health checks, and manual QA checklists. | QA, Developers |
| [19-troubleshooting.md](19-troubleshooting.md) | **Troubleshooting Guide** | Solutions for verified project issues: Docker permissions, EBADENGINE, hangs, and white screens. | All Developers |
| [20-development-guidelines.md](20-development-guidelines.md) | **Development Guidelines** | Local workflows, code conventions, step-by-step guides for adding pages, models, and endpoints. | Developers |
| [21-contribution-guidelines.md](21-contribution-guidelines.md) | **Contribution Guidelines** | Git branching, commit conventions, pull request process, and security disclosure. | Contributors |
| [22-project-roadmap.md](22-project-roadmap.md) | **Project Roadmap** | Verified existing features vs. planned future enhancements and milestones. | Product, Evaluators |
| [23-glossary.md](23-glossary.md) | **Glossary** | Definitions of insurance domain terminology and software engineering concepts. | All |

---

## Recommended Reading Order

### For New Developers (Onboarding)
1. [01-project-overview.md](01-project-overview.md) — Understand what the platform does.
2. [02-system-architecture.md](02-system-architecture.md) — Understand the architecture and data flows.
3. [03-installation-and-setup.md](03-installation-and-setup.md) — Spin up the Docker Compose stack.
4. [04-environment-configuration.md](04-environment-configuration.md) — Configure your environment files.
5. [20-development-guidelines.md](20-development-guidelines.md) — Learn project conventions and workflows.
6. [19-troubleshooting.md](19-troubleshooting.md) — Keep handy for solving setup issues.

### For Frontend Developers
1. [05-frontend-documentation.md](05-frontend-documentation.md) — Architecture, routing, state stores, and styling.
2. [08-api-reference.md](08-api-reference.md) — Full API endpoints, parameters, and responses.
3. [09-authentication-and-authorization.md](09-authentication-and-authorization.md) — How login, tokens, and roles function.
4. [10-user-guide.md](10-user-guide.md) & [11-administrator-guide.md](11-administrator-guide.md) — UI workflows.

### For Backend & Database Developers
1. [06-backend-documentation.md](06-backend-documentation.md) — Express 5 setup, middleware, and controllers.
2. [07-database-documentation.md](07-database-documentation.md) — Mongoose models and schema relationships.
3. [08-api-reference.md](08-api-reference.md) — Exact route specifications.
4. [15-ai-and-vector-search.md](15-ai-and-vector-search.md) — Gemini AI and Atlas Vector Search RAG pipeline.
5. [14-support-and-notifications.md](14-support-and-notifications.md) — SLA cron jobs and email alerts.

### For DevOps & Deployment Engineers
1. [03-installation-and-setup.md](03-installation-and-setup.md) — Basic installation commands.
2. [16-docker-and-deployment.md](16-docker-and-deployment.md) — Compose orchestration, volumes, and production setup.
3. [04-environment-configuration.md](04-environment-configuration.md) — Secrets management.
4. [17-security-guidelines.md](17-security-guidelines.md) — Hardening checklist.

### For Academic Reviewers & Evaluators
1. [01-project-overview.md](01-project-overview.md) — Problem statement, goals, and solution.
2. [02-system-architecture.md](02-system-architecture.md) — Architectural diagrams and design patterns.
3. [12-insurance-workflows.md](12-insurance-workflows.md) — Business domain modeling.
4. [15-ai-and-vector-search.md](15-ai-and-vector-search.md) — AI/RAG innovation.
5. [22-project-roadmap.md](22-project-roadmap.md) — Current state vs. future capabilities.

---

## Quickstart Summary

To get InsureMed up and running using Docker Compose:

```bash
# 1. Clone repository
git clone <repository-url>
cd InsureMed

# 2. Create local root environment file
cat <<EOF > .env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your-secure-mongo-password
EOF

# 3. Create backend environment file
cp Server/.env.example Server/.env
# Edit Server/.env to ensure MONGODB_URI has matching credentials

# 4. Create frontend environment file
echo "VITE_API_URL=http://localhost:3001/api/v1" > Clients/.env

# 5. Build and launch containers
docker compose up -d --build

# 6. Verify running services
docker compose ps
```

- **Frontend Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API Root:** [http://localhost:3001](http://localhost:3001)
- **Interactive Swagger Documentation:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

For detailed installation steps and system requirements, consult [03-installation-and-setup.md](03-installation-and-setup.md).
