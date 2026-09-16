# Week 3 — Full-Stack Delivery

## Version

v0.3 — Integrated Product Slice

## Product

Internal Operations Service Hub

The Internal Operations Service Hub is a company-internal application for requesting and tracking operational support from departments such as IT, HR, and Finance.

For Week 3, the implementation focuses on one narrow end-to-end Service Request flow rather than expanding the overall product scope.

---

## 1. Delivered User Flow

The implemented flow allows an authorized IT staff member to start work on an IT service request.

The seeded request is:

- Request ID: `REQ-1001`
- Requester: `employee-001`
- Department: `IT`
- Category: `Laptop Support`
- Initial status: `SUBMITTED`

The main successful flow is:

1. A user opens request `REQ-1001`.
2. The React frontend requests the request details from the NestJS backend.
3. The backend retrieves the request from SQLite.
4. An authorized IT staff member selects **Start work**.
5. The frontend sends a status update request.
6. The backend checks authorization.
7. The backend validates the lifecycle transition.
8. The request changes from `SUBMITTED` to `IN_PROGRESS`.
9. The new status is persisted in SQLite.
10. The updated request is returned to the frontend.

---

## 2. Architecture

The Week 3 slice uses:

- React frontend
- NestJS backend
- SQLite database using `better-sqlite3`
- Jest automated tests
- Supertest for HTTP end-to-end testing

The main request path is:

`React UI -> NestJS Controller -> RequestsService -> RequestsRepository -> SQLite`

The database is stored locally and is created automatically when the backend starts.

---

## 3. Persistence

Week 3 replaces the earlier JSON-file persistence with a real SQLite relational database.

The main database file is:

`backend/data/operations-hub.db`

The database contains the `service_requests` table.

The repository automatically:

1. creates the data directory when necessary;
2. opens the SQLite database;
3. creates the schema if it does not exist;
4. seeds `REQ-1001` when necessary;
5. reads requests from SQLite;
6. persists request status changes.

Tests use separate temporary SQLite database files so that automated tests do not modify the normal development database.

---

## 4. API Contract

### Get Service Request

Endpoint:

`GET /api/requests/:id`

Required local-development headers:

`x-user-id`

`x-role`

Supported local roles:

- `EMPLOYEE`
- `IT_STAFF`

Example:

`GET /api/requests/REQ-1001`

Successful response:

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