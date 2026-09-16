# Internal Operations Service Hub

## v0.3 — Integrated Product Slice

The Internal Operations Service Hub is a company-internal application for requesting and tracking operational support from departments such as IT, HR, and Finance.

Version 0.3 delivers one complete Service Request flow using:

- React frontend
- NestJS backend
- SQLite database persistence
- Authorization rules
- Request lifecycle validation
- Automated unit, integration, and end-to-end tests

---

## Implemented Service Request Flow

The current integrated slice uses the seeded service request:

- Request ID: `REQ-1001`
- Requester: `employee-001`
- Department: `IT`
- Category: `Laptop Support`
- Description: `Laptop cannot connect to the office Wi-Fi.`
- Initial status: `SUBMITTED`

An authorized IT staff member can start work on the request:

```text
SUBMITTED -> IN_PROGRESS
```

An employee cannot perform this staff-only action.

Invalid lifecycle transitions are rejected without changing the persisted request.

---

## Architecture

The application uses the following request path:

```text
React Frontend
      |
      v
NestJS Controller
      |
      v
RequestsService
      |
      v
RequestsRepository
      |
      v
SQLite Database
```

### Frontend

The frontend is implemented with React and Vite.

### Backend

The backend is implemented with NestJS.

### Persistence

Service requests are persisted in a real SQLite relational database using `better-sqlite3`.

The development database is created automatically at:

```text
backend/data/operations-hub.db
```

No separate database server is required.

---

## Requirements

Install:

- Node.js
- npm
- Git

---

## Installation

Clone the repository:

```powershell
git clone https://github.com/georgiotrad/internal-operations-service-hub.git
```

Enter the project:

```powershell
cd internal-operations-service-hub
```

Install dependencies:

```powershell
npm install
```

---

## Run the Application

From the repository root:

```powershell
npm run dev
```

The backend normally runs at:

```text
http://localhost:3000
```

The frontend normally runs at:

```text
http://localhost:5173
```

If port `5173` is already occupied, Vite may automatically use another available port such as `5174`.

---

## Exercise the User Flow

Open the frontend in your browser.

Use the local development identity selector to test the authorization behavior.

### Authorized IT Staff Flow

Select the IT Staff identity.

Open request:

```text
REQ-1001
```

Select:

```text
Start work
```

Expected transition:

```text
SUBMITTED -> IN_PROGRESS
```

The updated status is persisted in SQLite.

### Unauthorized Employee Flow

Select the Employee identity.

Attempt the same staff status update.

Expected result:

```text
403 Forbidden
```

The request remains unchanged.

---

## API Contract

### Get a Service Request

Endpoint:

```text
GET /api/requests/:id
```

Required local-development headers:

```text
x-user-id
x-role
```

Supported roles:

```text
EMPLOYEE
IT_STAFF
```

Example request:

```text
GET /api/requests/REQ-1001
```

Example successful response:

```json
{
  "id": "REQ-1001",
  "requesterId": "employee-001",
  "department": "IT",
  "category": "Laptop Support",
  "description": "Laptop cannot connect to the office Wi-Fi.",
  "status": "SUBMITTED",
  "updatedAt": "2026-09-09T08:00:00.000Z"
}
```

Possible responses:

- `200` — request returned successfully
- `400` — development identity is missing or invalid
- `403` — user is not authorized to view the request
- `404` — request does not exist
- `500` — persistence layer is unavailable

---

## Update Request Status

Endpoint:

```text
PATCH /api/requests/:id/status
```

Required headers:

```text
x-user-id
x-role
```

Example request body:

```json
{
  "status": "IN_PROGRESS"
}
```

Example successful response:

```json
{
  "id": "REQ-1001",
  "requesterId": "employee-001",
  "department": "IT",
  "category": "Laptop Support",
  "description": "Laptop cannot connect to the office Wi-Fi.",
  "status": "IN_PROGRESS",
  "updatedAt": "<generated ISO timestamp>"
}
```

Possible responses:

- `200` — status changed successfully
- `400` — target status is missing or lifecycle transition is invalid
- `403` — user is not authorized to change the status
- `404` — request does not exist
- `500` — persistence operation failed

---

## Authorization Rule

Only authorized IT staff can change the status of an IT service request.

### Allowed

```text
Role: IT_STAFF
Department: IT
```

An IT staff member can perform:

```text
SUBMITTED -> IN_PROGRESS
```

### Denied

```text
Role: EMPLOYEE
```

An employee attempting the same operation receives:

```text
403 Forbidden
```

The denied operation does not modify the persisted request.

---

## Request Lifecycle

Currently supported transitions are:

```text
SUBMITTED -> IN_PROGRESS
IN_PROGRESS -> COMPLETED
```

Other transitions are rejected.

For example:

```text
SUBMITTED -> COMPLETED
```

returns:

```text
400 Bad Request
```

The request remains in its previous state.

---

## Expected Failure Handling

SQLite operations are protected by controlled error handling.

If the request store becomes unavailable, the backend returns a controlled server error rather than exposing an uncontrolled database failure.

For example, an unavailable database during a read operation results in:

```text
500 Internal Server Error
```

with the message:

```text
The request store is unavailable.
```

The automated E2E coverage deliberately exercises this failure case.

---

## Automated Tests

Run all backend tests from the repository root:

```powershell
npm test --workspace backend
```

The automated test suite covers:

- service-level business rules
- authorized IT staff actions
- denied employee actions
- lifecycle transition validation
- real SQLite persistence
- backend-to-database integration
- HTTP end-to-end behavior
- expected database failure handling
- regression protection

### Service Tests

```text
backend/src/requests/requests.service.spec.ts
```

Tests the core business and authorization rules.

### Repository Integration Tests

```text
backend/src/requests/requests.repository.spec.ts
```

Tests the backend repository against a real SQLite database.

### End-to-End Tests

```text
backend/src/requests/requests.e2e.spec.ts
```

Exercises the real HTTP flow through:

```text
HTTP -> Controller -> Service -> Repository -> SQLite
```

---

## Build

Build the backend:

```powershell
npm run build --workspace backend
```

Build the frontend:

```powershell
npm run build --workspace frontend
```

Both builds should complete successfully before submission.

---

## Verification Script

Start the backend:

```powershell
npm run dev:backend
```

Then, from another terminal, run:

```powershell
node scripts/verify.mjs
```

The verification script checks:

```text
PASS: requester can view seeded request
PASS: employee cannot perform staff status update
PASS: unauthorized attempt does not change persisted state
PASS: IT staff can start work
PASS: valid transition is persisted in SQLite
PASS: invalid lifecycle transition is rejected
PASS: invalid transition leaves persisted state unchanged
```

A successful run ends with:

```text
Verification complete.
```

---

## Regression Protection

Behavior implemented before Week 3 remains protected.

Regression coverage verifies that:

- the seeded requester can still view the request;
- an employee cannot perform a staff status update;
- unauthorized attempts do not modify persisted state;
- IT staff can start work;
- valid transitions are persisted;
- invalid transitions are rejected;
- rejected transitions leave the persisted state unchanged.

---

## Week 3 Delivery Documentation

Detailed implementation and evidence are documented in:

```text
docs/week3-full-stack-delivery.md
```

The document describes:

- the delivered full-stack slice;
- architecture;
- SQLite persistence;
- API request and response contract;
- authorization;
- invalid request handling;
- expected failure handling;
- automated testing;
- E2E coverage;
- regression protection;
- manual verification.

---

## Development Authentication

The current:

```text
x-user-id
x-role
```

headers and frontend identity selector are local-development mechanisms.

They are used to demonstrate authorization behavior for this integrated product slice.

They are not intended to represent production authentication.

---

## Week 3 Scope

Version 0.3 intentionally focuses on one narrow, complete, working product slice.

It includes:

```text
React frontend
        +
NestJS backend
        +
SQLite persistence
        +
Authorization
        +
Validation
        +
Automated tests
```

The Week 3 implementation intentionally does not add unrelated infrastructure such as:

- external integrations
- runtime AI
- RAG
- MCP
- CI/CD
- deployment infrastructure
- production monitoring

The goal of v0.3 is a repeatable, persistent, authorized, and testable full-stack Service Request flow.