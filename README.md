# Internal Operations Service Hub

## v0.3 — Integrated Product Slice

The Internal Operations Service Hub is a company-internal application for requesting and tracking operational support from departments such as IT, HR, and Finance.

The Week 3 implementation delivers one complete Service Request flow using:

- React frontend
- NestJS backend
- SQLite persistence
- Authorization and lifecycle validation
- Automated unit, integration, and E2E tests

## Implemented Flow

The current slice uses seeded request `REQ-1001`.

Initial request:

- Requester: `employee-001`
- Department: `IT`
- Category: `Laptop Support`
- Status: `SUBMITTED`

An authorized IT staff member can start work on the request:

`SUBMITTED -> IN_PROGRESS`

An employee cannot perform this staff action.

Invalid lifecycle transitions are rejected without changing the persisted request.

## Architecture

The main runtime path is:

`React -> NestJS -> RequestsService -> RequestsRepository -> SQLite`

SQLite is implemented with `better-sqlite3`.

The development database is created automatically at:

`backend/data/operations-hub.db`

## Requirements

Install:

- Node.js
- npm

No separate database server is required because SQLite runs locally.

## Installation

Clone the repository:

```powershell
git clone https://github.com/georgiotrad/internal-operations-service-hub.git
cd internal-operations-service-hub