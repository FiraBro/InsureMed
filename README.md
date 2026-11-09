# Online Insurance Management System (OIMS)

A modern, full-featured digital insurance platform that seamlessly connects customers with administrators, simplifying policy management, claims processing, and multi-line insurance operations.

## Overview

**OIMS** is a comprehensive platform designed to streamline insurance processes across multiple sectors, including Life, Auto, Property, and Travel. Customers can apply for various coverage plans, manage digital document vaults, and track claims, while admins can oversee policies, verify applications, and process settlements efficiently. Whether for individual protection or corporate risk management, OIMS provides a secure, intuitive, and scalable solution.

## Key Features

### For Customers

- **Personalized Dashboard:** Track all your active policies, pending claims, and coverage limits in one place.
- **Multi-Line Policy Application:** Apply for various insurance products and upload required documentation instantly.
- **Application Tracking:** Get real-time updates on the status of your policy underwriting and approvals.
- **Digital Claims Submission:** Submit incident reports and monitor claim settlements with integrated document uploads.
- **Notifications & Alerts:** Receive timely reminders for premium payments and policy renewals.

### For Admins

- **Admin Command Center:** Comprehensive view of total policyholders, active premiums, pending claims, and platform analytics.
- **Product Management:** Create, update, and manage diverse insurance plans with full CRUD functionality.
- **Underwriting & Verification:** Review, approve, or reject customer applications with centralized document access.
- **Claims Processing:** Verify incident reports, request additional evidence, and finalize financial settlements.
- **User Governance:** Manage customer accounts and provide administrative support.

### Platform-Wide

- **Secure Authentication:** JWT-based login with Role-Based Access Control (RBAC).
- **Responsive Design:** A seamless experience across desktop, tablet, and mobile devices.
- **Scalable Infrastructure:** Built to handle high volumes of users, policies, and heavy document processing.
- **Cloud Document Vault:** Store sensitive insurance files securely using Cloudinary.

## Tech Stack

- **Frontend:** React.js / Tailwind CSS / Framer Motion
- **Backend:** Node.js (Express)
- **Database:** MongoDB
- **Authentication:** JWT / Role-Based Access
- **File Uploads:** Multer / Cloudinary
- **Deployment:** Docker

## API Documentation

This project includes full API documentation using **Swagger (OpenAPI 3.0)**.

### 🔹 OpenAPI Specification

The complete API contract is available here:

You can view it online without running the project:

1. Open https://editor.swagger.io/
2. Copy the contents of `openapi.yaml`
3. Paste it into the editor to explore all endpoints interactively

### 🔹 Swagger UI (Local)

If you run the project locally, interactive API documentation is available at:
http://localhost:3001/api-docs

## Infrastructure

**Containerization:** Docker & Docker Compose for consistent environment orchestration.

## Quick Start with Docker

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### 1. Clone the Repository

````bash
git clone [https://github.com/FiraBro/OIMS.git](https://github.com/FiraBro/OIMS.git)
cd OIMS
```

### 2. Environment Configuration

```env
PORT=3001
MONGO_URI=mongodb://admin:admin123@mongodb_health:27017/health_insurance?authSource=admin

JWT_SECRET=your_jwt_secret_key

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_USER=your_email
SMTP_PASS=your_email_password
````

### 3. Start the Applications

```bash
docker-compose up -d
```
