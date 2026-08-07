# CRM Connect Backend API

A secure, modular REST API for a CRM application, built with **Node.js**, **Express.js**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

CRM Connect covers customer and task workflows while putting extra emphasis on backend engineering concerns that matter beyond CRUD: **hybrid RBAC/resource authorization, JWT session security, refresh-token rotation and reuse detection, audit events, validation, testing, API documentation, Docker, and deployment**.

> This repository is a personal backend engineering project designed to practice building, securing, testing, documenting, and deploying a real-world API. The current authorization model assumes a **single organization**; multi-tenant boundaries are intentionally left as a future architectural extension.

## Table of Contents

- [Highlights](#highlights)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Authentication and Session Security](#authentication-and-session-security)
- [RBAC and Authorization](#rbac-and-authorization)
- [Security Architecture](#security-architecture)
- [Technology Stack](#technology-stack)
- [Database Model](#database-model)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [API Modules](#api-modules)
- [Getting Started](#getting-started)
- [Docker](#docker)
- [Testing](#testing)
- [Deployment](#deployment)
- [Production and Scaling Considerations](#production-and-scaling-considerations)
- [Documentation](#documentation)
- [Future Improvements](#future-improvements)
- [License](#license)

## Highlights

- Modular **route -> controller -> service -> repository** design for core business modules.
- Hybrid authorization combining **RBAC permissions** with resource-level ownership and relationship policies.
- Three roles: **ADMIN**, **MANAGER**, and **EMPLOYEE**.
- Short-lived JWT access tokens plus **rotating refresh sessions**.
- Refresh-token hashes stored server-side instead of raw refresh tokens.
- Token-family tracking and **refresh-token reuse detection** with family revocation.
- Immediate access-token invalidation after sensitive account changes through `tokenVersion`.
- Device/session management with individual and global session revocation.
- Security audit trail for authentication, authorization, session, role, and account-status events.
- Zod request validation and centralized HTTP error handling.
- Helmet, configurable CORS, request size limits, and rate limiting on sensitive authentication flows.
- OpenAPI 3.0.3 specification with Swagger UI.
- Jest and Supertest test suites, including authorization and OpenAPI checks.
- Docker/Docker Compose development support and Render deployment configuration.
- Liveness and database-backed readiness health checks.

## Features

### Authentication and account security

- User registration and login.
- JWT access tokens.
- Refresh-token rotation.
- Session listing and revocation.
- Logout.
- Password recovery with OTP.
- Password reset.
- Password change.
- Refresh-token reuse detection.
- Account status enforcement.

### Customer management

- Create and retrieve customers.
- Update and delete customers.
- Search, filter, and paginate customer data.
- Ownership-aware access for employees.
- Broader customer access for managers and admins.

### Task management

- Create tasks for accessible customers.
- Assign tasks according to role permissions.
- List related or organization-wide tasks according to authorization scope.
- Update task details and task status.
- Delete tasks according to creator/role policy.

### Notes

- Add notes to accessible customers.
- Server-side author assignment prevents clients from spoofing note ownership.

### Users and administration

- Manager/Admin user directory access.
- Admin-only role changes.
- Admin-only account-status changes.
- Protection against removing or disabling the final active administrator.
- Admin overview metrics.
- Admin-only security event queries.

### Profile

- Read and update the authenticated profile.
- Change password.
- Store avatar data/reference through the profile API.
- Save an Expo push token for notification integration.

## System Architecture

The application separates HTTP concerns, authorization, business rules, and persistence so that security-sensitive decisions are not left to the client.

```text
Client / Mobile App
        |
        v
+-----------------------+
|      Express API      |
|-----------------------|
| Request Context       |
| Helmet / CORS         |
| Authentication        |
| Permission Middleware |
| Zod Validation        |
+-----------+-----------+
            |
            v
+-----------------------+
| Routes / Controllers  |
+-----------+-----------+
            |
            v
+-----------------------+
| Services              |
|-----------------------|
| Business Rules        |
| Resource Policies     |
| Session Management    |
| Security Auditing     |
+-----------+-----------+
            |
            v
+-----------------------+
| Repositories / Prisma |
+-----------+-----------+
            |
            v
+-----------------------+
|      PostgreSQL       |
+-----------------------+
```

Core modules such as customers and tasks use explicit repositories. Cross-cutting session and security-audit logic lives in dedicated services, while authorization rules are centralized under `src/modules/authorization`.

## Authentication and Session Security

A successful login creates an access token and a server-tracked refresh session.

```text
Credentials
    |
    v
Verify user + password
    |
    v
Check ACTIVE account
    |
    +--------------------+
    |                    |
    v                    v
Access token       Refresh token
(short lived)      + RefreshSession
                         |
                         v
                   token hash stored
                   in PostgreSQL
```

When an access token expires, the refresh token is verified against its session and rotated:

```text
Refresh token
    |
    v
Verify signature + session
    |
    v
Atomically consume session
    |
    v
Create child session
    |
    v
Issue new access + refresh tokens
```

Each refresh session belongs to a `familyId`. The raw refresh token is not stored in the database; a SHA-256 hash is stored instead. If a revoked, replaced, mismatched, or concurrently consumed refresh token is reused, the backend treats it as a possible compromise, revokes active sessions in that token family, and records a `REFRESH_REUSE_DETECTED` event.

The default token lifetime is configurable through environment variables. The example configuration uses a **15-minute access token** and a **7-day refresh token**.

Sensitive role, status, and password changes also invalidate existing authentication state. The backend reads the current user from PostgreSQL during authentication and checks `tokenVersion` rather than trusting a stale role embedded in a token.

## RBAC and Authorization

CRM Connect uses a hybrid model:

1. **RBAC** determines the coarse capabilities granted to a role.
2. **Resource policies** restrict which records the actor can access.
3. **Business rules** enforce state-dependent invariants.

```text
Authenticated User
       |
       v
Current DB Role / Status / tokenVersion
       |
       v
Role Permissions
       |
       v
Resource Scope
(owner / creator / assignee)
       |
       v
Business Rule
       |
       v
Authorized Operation
```

### Permission overview

| Capability | Employee | Manager | Admin |
| --- | --- | --- | --- |
| Read customers | Own | Any | Any |
| Create customers | Yes | Yes | Yes |
| Update/delete customers | Own | Any | Any |
| Read tasks | Assigned or created | Any | Any |
| Create tasks | Accessible customer | Any accessible customer | Any customer |
| Assign tasks | Self only | Any active user | Any active user |
| Edit task details | Created task | Any | Any |
| Update task status | Assigned task | Any | Any |
| Delete tasks | Created task | Any | Any |
| Add customer notes | Own customer | Any customer | Any customer |
| List users | No | Yes | Yes |
| Change user role/status | No | No | Yes |
| Read security events | No | No | Yes |
| Read admin overview | No | No | Yes |

Important authorization invariants include:

- Public registration always creates an `EMPLOYEE`.
- Clients cannot choose role, status, customer owner, task creator, or note author fields.
- Scoped resource lookups can return `404` instead of exposing the existence of another user's record.
- Only active users can authenticate, refresh sessions, or receive task assignments.
- Role/status changes revoke refresh sessions and invalidate existing access tokens.
- The final active admin cannot be demoted or disabled.
- Permission denials and administrative security changes are auditable.

The executable permission catalog is `src/modules/authorization/permissions.ts`. For the full design and operational rules, see [`docs/RBAC_ARCHITECTURE.md`](docs/RBAC_ARCHITECTURE.md) and [`docs/RBAC_OPERATIONS.md`](docs/RBAC_OPERATIONS.md).

## Security Architecture

Security controls currently implemented in the application include:

- Password hashing with bcrypt.
- Separate secrets for access and refresh JWTs.
- Short-lived access tokens.
- Hashed server-side refresh sessions.
- Refresh-token rotation and family-based reuse detection.
- Session revocation by device/session or across all sessions.
- Account status and `tokenVersion` validation on authenticated requests.
- Permission middleware and resource-scoped queries.
- Security event auditing.
- Rate limiting on authentication and OTP endpoints.
- Helmet HTTP security headers.
- Configurable CORS allowlist.
- `X-Powered-By` disabled.
- JSON and URL-encoded request bodies limited to 1 MB.
- Strict Zod schemas for request validation.
- Centralized not-found and error handling.
- Request context/metadata for observability and security events.

Security events include login successes/failures, token rotation, refresh reuse detection, logout, session revocation, password reset, access denial, role changes, and account-status changes.

For controls still required around a real production environment, see [`docs/PRODUCTION_SECURITY.md`](docs/PRODUCTION_SECURITY.md).

## Technology Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js 20 |
| Language | TypeScript |
| HTTP framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Authentication | JSON Web Token (JWT), bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Email | Nodemailer |
| Push integration | Expo Server SDK |
| API documentation | OpenAPI 3.0.3, Swagger UI |
| Testing | Jest, Supertest, ts-jest |
| Development | Nodemon, ts-node |
| Containers | Docker, Docker Compose |
| Deployment configuration | Render |

## Database Model

The Prisma schema currently contains six main models:

```text
User
 |\
 | +----< Customer ----< Note
 |          |
 |          +---------< Task
 |
 +------< RefreshSession
 |
 +------< SecurityEvent
```

### Main entities

- **User** - identity, role, account status, token version, profile fields, password-reset state, and push token.
- **Customer** - CRM customer owned by a user with a sales-pipeline status.
- **Task** - customer-related work with creator and assignee relationships.
- **Note** - customer note linked to its authenticated author.
- **RefreshSession** - hashed refresh-token session, token family, device metadata, expiry, and revocation state.
- **SecurityEvent** - append-oriented security/audit information for sensitive actions.

### Current enums

- `UserRole`: `ADMIN`, `MANAGER`, `EMPLOYEE`
- `UserStatus`: `ACTIVE`, `SUSPENDED`, `DISABLED`
- `CustomerStatus`: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`
- `TaskStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

Indexes are defined for common authorization and query paths such as user role/status, customer ownership/status, task assignee/status/deadline, refresh-session families, and security-event lookups.

## Project Structure

```text
crm-backend/
├── docs/
│   ├── openapi.yaml
│   ├── PRODUCTION_SECURITY.md
│   ├── RBAC_ARCHITECTURE.md
│   ├── RBAC_OPERATIONS.md
│   └── RENDER_DEPLOYMENT.md
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed-admin.ts
├── src/
│   ├── __tests__/
│   ├── config/
│   │   ├── env.ts
│   │   └── prisma.ts
│   ├── controllers/
│   ├── docs/
│   │   └── openapi.ts
│   ├── errors/
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── requestContext.middleware.ts
│   │   └── validate.middleware.ts
│   ├── modules/
│   │   ├── admin/
│   │   ├── authorization/
│   │   ├── customers/
│   │   ├── notes/
│   │   ├── security-events/
│   │   ├── tasks/
│   │   └── users/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   │   ├── securityAudit.service.ts
│   │   └── session.service.ts
│   ├── shared/http/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── index.ts
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
├── prisma.config.ts
├── render.yaml
└── tsconfig.json
```

## API Documentation

The source-controlled OpenAPI 3.0.3 specification is located at:

```text
docs/openapi.yaml
```

When the application is running:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api/openapi.json`
- Readiness check: `http://localhost:3000/health/ready`
- Liveness check: `http://localhost:3000/health/live`

Route or schema changes should update the OpenAPI specification and its test in the same change.

## API Modules

All business endpoints are mounted under `/api`.

### Authentication - `/api/auth`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/register` | Register an employee account |
| POST | `/login` | Authenticate and create a session |
| POST | `/refresh` | Rotate a refresh session and issue new tokens |
| POST | `/logout` | Revoke the supplied refresh session |
| POST | `/forgot-password` | Request password-reset OTP |
| POST | `/reset-password` | Reset password with OTP |
| GET | `/sessions` | List authenticated user's sessions |
| DELETE | `/sessions` | Revoke all authenticated user's sessions |
| DELETE | `/sessions/:sessionId` | Revoke one session |

### Profile - `/api/profile`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | Read current profile |
| PUT | `/` | Update profile |
| PUT | `/change-password` | Change password |
| PUT | `/push-token` | Save Expo push token |

### Customers - `/api/customers`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | List/search/filter customers in authorized scope |
| GET | `/:id` | Read one authorized customer |
| POST | `/` | Create customer |
| PATCH | `/:id` | Update customer |
| DELETE | `/:id` | Delete customer |

### Tasks - `/api/tasks`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | List tasks in authorized scope |
| POST | `/` | Create task |
| PATCH | `/:id` | Update task details |
| PATCH | `/:id/status` | Update task status |
| DELETE | `/:id` | Delete task |

### Notes - `/api/notes`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/` | Add a note to an authorized customer |

### Users - `/api/users`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | List users - Manager/Admin |
| PATCH | `/:id/role` | Change role - Admin only |
| PATCH | `/:id/status` | Change account status - Admin only |

### Security events - `/api/security-events`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/` | Query security audit events - Admin only |

### Admin - `/api/admin`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/overview` | Read admin dashboard overview - Admin only |

For request/response schemas and query parameters, use Swagger UI or `docs/openapi.yaml` as the API contract.

## Getting Started

### Prerequisites

Install:

- Node.js **20.x**
- npm
- PostgreSQL, or Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd crm-backend
```

### 2. Install dependencies

```bash
npm ci
```

Use `npm install` instead if you intentionally need to update the lockfile.

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

At minimum, configure database connectivity and strong JWT secrets:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/crm_connect?schema=public"
DIRECT_URL="postgresql://postgres:your-password@localhost:5432/crm_connect?schema=public"
JWT_ACCESS_SECRET="replace-with-at-least-32-random-characters"
JWT_REFRESH_SECRET="replace-with-a-different-32-character-secret"
ACCESS_TOKEN_MINUTES=15
REFRESH_TOKEN_DAYS=7
CORS_ORIGINS="http://localhost:8081,http://localhost:19006"
TRUST_PROXY=0
LOG_LEVEL=info
```

`DIRECT_URL` is referenced by `prisma/schema.prisma`. For a normal local PostgreSQL instance it can use the same connection string as `DATABASE_URL`. With a managed database/pooler, use the provider's direct database connection when required for Prisma migrations.

Optional email and admin-seed variables:

```env
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
ADMIN_NAME="CRM Administrator"
```

Never commit real credentials or production secrets.

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Apply database migrations

For local development:

```bash
npm run migrate:dev
```

For an existing production migration set:

```bash
npm run migrate:deploy
```

### 6. Seed an administrator

After setting `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optionally `ADMIN_NAME`:

```bash
npm run seed:admin
```

### 7. Start development mode

```bash
npm run dev
```

The API defaults to:

```text
http://localhost:3000
```

Open Swagger UI at:

```text
http://localhost:3000/api-docs
```

## Docker

The repository contains a `Dockerfile` and `docker-compose.yml` for containerized development/testing.

Start the stack:

```bash
docker compose up --build
```

Stop it:

```bash
docker compose down
```

Remove the local PostgreSQL volume as well:

```bash
docker compose down -v
```

> Review and replace all example credentials/secrets in `docker-compose.yml` before using a similar configuration outside a disposable local environment. Production secrets should come from a managed secret/environment configuration, not source control.

## Testing

### Run the test suite

```bash
npm test
```

The repository includes tests around areas such as:

- Customer behavior.
- User/admin services.
- Permission and authorization middleware.
- Authorization policies.
- OpenAPI consistency.

### Coverage

```bash
npm run test:coverage
```

### Type checking

```bash
npm run typecheck
```

### Production build

```bash
npm run build
```

A useful pre-push verification sequence is:

```bash
npm run typecheck
npm test
npm run build
```

## Deployment

The repository includes `render.yaml` and a production Dockerfile for deployment to Render. The intended deployment flow is:

```text
Git repository
      |
      v
Render Docker build
      |
      +----> Prisma migrate deploy
      |
      v
Node.js API
      |
      v
Managed PostgreSQL
```

Production configuration should provide at least:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`
- `TRUST_PROXY=1` when appropriate behind Render's proxy
- Email credentials when password-reset email is enabled

Render uses `/health/ready` as the configured health check. The readiness endpoint verifies database connectivity with a simple query before returning ready status.

See [`docs/RENDER_DEPLOYMENT.md`](docs/RENDER_DEPLOYMENT.md) for deployment-specific instructions.

## Production and Scaling Considerations

The repository implements application-level security and deployment foundations, but running a high-traffic production CRM requires infrastructure beyond this codebase.

### Already represented in the project

- Stateless access-token verification with database-backed authorization freshness.
- Indexed PostgreSQL access paths for common ownership and status queries.
- Readiness/liveness endpoints.
- Docker packaging.
- Configurable proxy/CORS behavior.
- Security audit events.
- Rate limiting for sensitive endpoints.
- Server-side session revocation.

### Additional controls for production scale

For multiple API instances or significantly higher traffic, consider:

- A shared rate-limit store such as Redis instead of per-process memory.
- Load balancing and horizontal API scaling.
- Managed PostgreSQL connection pooling and explicit pool sizing.
- Database metrics, slow-query analysis, and query/index tuning based on real workloads.
- Read replicas only for workloads that can tolerate replication lag.
- Centralized structured logs, metrics, tracing, dashboards, and alerting.
- A queue for expensive or retryable background work such as email/push delivery.
- Managed secret rotation and stronger key-management procedures.
- TLS, least-privilege database credentials, backups, restore testing, and retention policies.
- WAF/DDoS controls at the edge.
- Dependency/container scanning and a CI/CD security pipeline.
- Load and stress testing before making concurrency or throughput claims.

This README intentionally does **not** claim that the current single-instance project can serve a specific number of concurrent users without measured load-test evidence.

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/openapi.yaml`](docs/openapi.yaml) | Source-controlled OpenAPI 3.0.3 contract |
| [`docs/RBAC_ARCHITECTURE.md`](docs/RBAC_ARCHITECTURE.md) | Authorization model, permission matrix, policies, and invariants |
| [`docs/RBAC_OPERATIONS.md`](docs/RBAC_OPERATIONS.md) | Operational RBAC guidance |
| [`docs/PRODUCTION_SECURITY.md`](docs/PRODUCTION_SECURITY.md) | Refresh-token compromise handling and remaining production controls |
| [`docs/RENDER_DEPLOYMENT.md`](docs/RENDER_DEPLOYMENT.md) | Render deployment guidance |

## Future Improvements

The next architectural improvements would depend on product scale and deployment requirements. Reasonable extensions include:

- Introduce `Organization` and `Membership` models for true multi-tenant CRM isolation.
- Add a shared Redis-backed rate limiter for horizontally scaled instances.
- Move email and push delivery to background jobs/queues.
- Add structured metrics and distributed tracing.
- Expand integration and end-to-end test coverage.
- Add automated dependency/container scanning in CI.
- Add repeatable load-test scenarios and publish measured performance results.
- Add database backup/restore drills and operational runbooks.

## License

This project is currently configured with the **ISC** license in `package.json`.
