# 21. Contribution Guidelines

Thank you for your interest in contributing to **InsureMed**!

This document establishes the standards, workflows, and conventions required for submitting bug fixes, new features, and documentation improvements.

---

## 1. Code of Conduct & Contribution Standards

All contributors are expected to uphold a professional, respectful, and collaborative environment.

### Core Principles
- **Accuracy to Code:** Code submissions must be accompanied by accurate documentation and tests.
- **Zero Secrets Policy:** Never commit secrets, passwords, private keys, or `.env` files.
- **Backwards Compatibility:** Database model additions should use default values to avoid breaking existing documents in MongoDB.

---

## 2. Git Branching Strategy

Follow structured branch naming conventions:

| Branch Prefix | Purpose | Example |
| :--- | :--- | :--- |
| `feature/` | Introducing a new functional capability | `feature/payment-gateway-stripe` |
| `fix/` | Resolving an existing bug | `fix/registration-button-hang` |
| `docs/` | Creating or updating documentation | `docs/update-api-reference` |
| `refactor/` | Code refactoring without changing behavior | `refactor/claim-service-cleanup` |
| `test/` | Adding or updating automated tests | `test/auth-lockout-tests` |
| `chore/` | Dependency upgrades or build tool updates | `chore/upgrade-tailwind-v4` |

---

## 3. Commit Message Standards

InsureMed follows the **Conventional Commits** specification:

```text
<type>(<scope>): <short description>

[optional body explaining context and reasoning]

[optional footer referencing issue numbers]
```

### Commit Types
- **`feat`:** A new feature (e.g., `feat(claims): add automatic claim approval below threshold`).
- **`fix`:** A bug fix (e.g., `fix(auth): prevent white screen deadlock on unauthenticated routes`).
- **`docs`:** Documentation changes only (e.g., `docs(setup): add Linux Mint Docker repository guide`).
- **`style`:** Code formatting changes that do not affect runtime behavior (e.g., `style(frontend): format JSX with Prettier`).
- **`refactor`:** Code changes that neither fix a bug nor add a feature (e.g., `refactor(backend): decouple ticketService from controllers`).
- **`test`:** Adding missing tests or correcting existing tests (e.g., `test(tickets): add IDOR ticket ownership unit tests`).
- **`chore`:** Maintenance tasks, dependency updates, or Docker configuration (e.g., `chore(docker): update Node 20 base image`).

---

## 4. Pull Request (PR) Workflow

### 1. Fork & Branch
1. Fork the InsureMed repository to your GitHub account.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/InsureMed.git
   cd InsureMed
   ```
3. Create a dedicated branch following the naming standards:
   ```bash
   git checkout -b feature/nominee-relationship-validation
   ```

### 2. Implement & Verify Changes
1. Apply your code modifications.
2. Verify frontend code quality:
   ```bash
   cd Clients
   npm run lint
   npm run build
   ```
3. Verify backend test suite:
   ```bash
   cd ../Server
   node --test tests/ticketOwnership.test.js
   ```

### 3. Update Documentation
If your pull request introduces new API endpoints, environment variables, or UI pages, you **must update the relevant markdown files** inside the `/docs` directory (e.g., `08-api-reference.md`, `04-environment-configuration.md`).

### 4. Commit & Open Pull Request
1. Stage your changes and commit with a Conventional Commit message:
   ```bash
   git commit -m "feat(applications): validate nominee relationship dropdown"
   ```
2. Push your branch to your GitHub fork:
   ```bash
   git push origin feature/nominee-relationship-validation
   ```
3. Open a Pull Request against the upstream `main` branch.

### Pull Request Checklist
Ensure your PR description verifies:
- [ ] Code compiles without warnings or errors.
- [ ] `npm run lint` passes in `Clients/`.
- [ ] `npm run build` succeeds in `Clients/`.
- [ ] Automated tests pass (`node --test`).
- [ ] Documentation in `/docs` updated to reflect changes.
- [ ] No secrets, `.env` files, or passwords committed.

---

## 5. Security Vulnerability Reporting

If you discover a security vulnerability in InsureMed (such as an authorization bypass, injection flaw, or secret exposure):
- **Do not open a public GitHub issue.**
- Email the security maintainers privately with reproduction steps and proof-of-concept payloads.
- Maintainers will acknowledge receipt within 48 hours and work with you to coordinate a responsible security patch before public disclosure.
