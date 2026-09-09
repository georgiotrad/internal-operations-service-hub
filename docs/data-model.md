# Internal Operations Service Hub — Data Model

## Core Entities

### User
Represents an employee, department staff member, approver, or administrator.

### Department
Represents an internal unit such as IT, HR, or Finance.

### ServiceCategory
Represents the requested service type and its responsible department.

### Request
Central business record containing requester, department, category, description, status, assignee when present, and timestamps.

### Approval
Represents an approval decision when a request requires approval.

### Activity
Represents important traceable actions.

## Relationships

- One User may submit many Requests.
- Each Request has one requester.
- One Department handles many Requests.
- Each Request has one responsible Department.
- One Department supports many Service Categories.
- A Request may have an assignee.
- A Request may have approval information.
- A Request may have many Activity records.

## Lifecycle Used for the Week 2 Slice

For the first implementation slice:

`SUBMITTED -> IN_PROGRESS -> COMPLETED`

Only `IT_STAFF` may perform the `SUBMITTED -> IN_PROGRESS` transition in the Week 2 local development scenario.

## Invariants

- Every Request has a unique identity.
- Every Request has one requester.
- Every Request has one responsible department.
- Request status must be valid.
- Unauthorized users cannot change status.
- Invalid transitions do not change persisted state.
- Success is returned only after persistence succeeds.

## Storage Reasoning

A relational store remains a reasonable future production choice. For the Week 2 teaching slice, a local JSON file is used only to prove persistence without adding a new external dependency.

## Access Patterns

- Find request by ID.
- List requests visible to a requester.
- List requests for a department.
- Update status of one request.
- Retrieve activity history for a request.
