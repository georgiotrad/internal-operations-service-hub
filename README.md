Internal Operations Service Hub

v0.4 --- Production AI Feature

The Internal Operations Service Hub is a company-internal application
for requesting and tracking operational support from departments such as
IT, HR, and Finance.

Version 0.4 preserves the integrated Service Request flow delivered in
v0.3 and adds a narrow AI-assisted Request Intake feature. Employees can
describe an operational problem in natural language and receive a
structured request suggestion inside the trusted product context.

The application demonstrates:

React frontend

NestJS backend

SQLite database persistence

authorization rules

request lifecycle validation

AI-assisted request intake

structured AI output validation

safe AI failure handling

automated unit, integration, end-to-end, and AI evaluation tests

v0.4 AI-Assisted Request Intake

Employees can enter a natural-language description of an operational
problem and request AI assistance.

The AI-assisted flow produces a structured suggestion containing:

department

category

description

clarification requirement

clarification question when needed

Example input:

My laptop cannot connect to the office Wi-Fi since this morning.

Example structured suggestion:

Department: IT
Category: Laptop Support
Description: My laptop cannot connect to the office Wi-Fi since this morning.
Needs clarification: No

AI suggestions are advisory. The employee reviews the information before
using it.

The AI feature does not directly mutate the persisted Service Request
lifecycle.

AI Safety and Product Boundary

AI output is treated as untrusted input. The backend validates
AI-generated output before returning it to the frontend. Output outside
the trusted product context is rejected.

The implementation also handles AI provider failure safely so that a
provider error does not become an uncontrolled application failure.

AI assists with request intake and classification; authorization,
lifecycle rules, and persistence remain deterministic application
responsibilities.

AI Evaluation Coverage

The AI-assisted Request Intake evaluation suite covers:

classification of a clear laptop Wi-Fi problem

classification of an account problem that requires clarification

classification of a Finance expense-reimbursement request

ambiguous or thin employee input

empty employee input

invalid AI output outside the trusted product context

AI provider failure

Run the AI evaluation suite with:

npm run eval:ai --workspace backend

Detailed Week 4 implementation notes are available in:

docs/week4-production-ai.md

v0.3 --- Integrated Product Slice

Version 0.3 delivered one complete Service Request flow using React,
NestJS, SQLite persistence, authorization, lifecycle validation, and
automated tests.

The v0.4 work builds on this slice rather than replacing it.

Implemented Service Request Flow

The seeded request is:

Request ID: REQ-1001

Requester: employee-001

Department: IT

Category: Laptop Support

Description: Laptop cannot connect to the office Wi-Fi.

Initial status: SUBMITTED

An authorized IT staff member can perform:

SUBMITTED -> IN_PROGRESS

An employee cannot perform this staff-only action. Invalid lifecycle
transitions are rejected without changing the persisted request.

Architecture

Core Service Request path:

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

AI-assisted intake path:

Employee Input
      |
      v
React Frontend
      |
      v
NestJS Request Intake
      |
      v
AI-assisted classification
      |
      v
Validation / trusted product boundary
      |
      v
Structured advisory suggestion

Frontend

The frontend is implemented with React and Vite.

Backend

The backend is implemented with NestJS.

Persistence

Service requests are persisted in a real SQLite relational database
using better-sqlite3.

The development database is created automatically at:

backend/data/operations-hub.db

No separate database server is required.

Requirements

Install Node.js, npm, and Git.

Installation

git clone https://github.com/georgiotrad/internal-operations-service-hub.git
cd internal-operations-service-hub
npm install

Run the Application

From the repository root:

npm run dev

The backend normally runs at http://localhost:3000.

The frontend normally runs at http://localhost:5173. If port 5173 is
occupied, Vite may use another available port such as 5174.

Exercise the AI-Assisted Intake Flow

Open the frontend and enter an operational problem such as:

My laptop cannot connect to the office Wi-Fi since this morning.

Select:

Get AI assistance

Review the structured suggestion. The interface reminds the user that AI
suggestions are advisory.

Exercise the Service Request Flow

Use the local development identity selector.

Authorized IT Staff Flow

Select IT Staff and select Start work for REQ-1001.

Expected transition:

SUBMITTED -> IN_PROGRESS

The updated status is persisted in SQLite.

Unauthorized Employee Flow

Select Employee and attempt the same update.

Expected result:

403 Forbidden

The request remains unchanged.

API Contract

Get a Service Request

GET /api/requests/:id

Required local-development headers:

x-user-id
x-role

Supported roles:

EMPLOYEE
IT_STAFF

Example successful response:

{
  "id": "REQ-1001",
  "requesterId": "employee-001",
  "department": "IT",
  "category": "Laptop Support",
  "description": "Laptop cannot connect to the office Wi-Fi.",
  "status": "SUBMITTED",
  "updatedAt": "2026-09-09T08:00:00.000Z"
}

Possible responses:

200 --- request returned successfully

400 --- development identity is missing or invalid

403 --- user is not authorized

404 --- request does not exist

500 --- persistence layer is unavailable

Update Request Status

PATCH /api/requests/:id/status

Example body:

{
  "status": "IN_PROGRESS"
}

Possible responses:

200 --- status changed successfully

400 --- target status is missing or lifecycle transition is
invalid

403 --- user is not authorized to change the status

404 --- request does not exist

500 --- persistence operation failed

Authorization Rule

Only authorized IT staff can change the status of an IT service request.

Allowed:

Role: IT_STAFF
Department: IT

Denied:

Role: EMPLOYEE

A denied operation does not modify the persisted request.

Request Lifecycle

Supported transitions are:

SUBMITTED -> IN_PROGRESS
IN_PROGRESS -> COMPLETED

Other transitions are rejected with 400 Bad Request, and the persisted
request remains in its previous state.

Expected Failure Handling

SQLite operations use controlled error handling. If the request store
becomes unavailable, the backend returns a controlled
500 Internal Server Error instead of exposing an uncontrolled database
failure.

The AI-assisted intake flow also deliberately handles provider failure
and invalid AI output.

Automated Tests

Run all backend tests:

npm test --workspace backend

Coverage includes business rules, authorization, lifecycle validation,
SQLite persistence, backend-to-database integration, HTTP E2E behavior,
expected database failure handling, regression protection, and
AI-assisted request-intake evaluations.

Service Tests

backend/src/requests/requests.service.spec.ts

Repository Integration Tests

backend/src/requests/requests.repository.spec.ts

End-to-End Tests

backend/src/requests/requests.e2e.spec.ts

The E2E path is:

HTTP -> Controller -> Service -> Repository -> SQLite

AI Evaluation Tests

Run independently with:

npm run eval:ai --workspace backend

The evaluation suite exercises normal cases, ambiguous input, invalid
output, and provider failure.

Build and Final Verification

npm run build --workspace backend
npm run build --workspace frontend
npm test --workspace backend
npm run eval:ai --workspace backend

Verification Script

Start the backend:

npm run dev:backend

In another terminal:

node scripts/verify.mjs

The verification script checks requester access, denied employee
updates, persistence protection, authorized IT updates, valid transition
persistence, invalid transition rejection, and unchanged state after
rejection.

Regression Protection

The v0.4 AI feature is additive. Existing behavior remains protected,
including requester access, employee authorization denial, IT staff
status changes, SQLite persistence, and lifecycle validation.

Delivery Documentation

Week 3 full-stack delivery:

docs/week3-full-stack-delivery.md

Week 4 production AI delivery:

docs/week4-production-ai.md

Development Authentication

The x-user-id and x-role headers and frontend identity selector are
local-development mechanisms used to demonstrate authorization. They are
not production authentication.

Current Scope

The current application includes:

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
AI-assisted request intake
        +
Automated tests and AI evaluations

The AI feature assists with interpreting employee request text. It does
not replace deterministic authorization, lifecycle validation, or
persistence logic.

The goal is a repeatable, persistent, authorized, testable, and safely
AI-assisted Internal Operations Service Hub.