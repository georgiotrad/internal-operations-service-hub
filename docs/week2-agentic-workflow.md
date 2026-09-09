# Week 2 Agentic Workflow — Operations Hub

## Milestone Claim

This milestone proves one narrow request lifecycle slice end to end:

**Authorized IT staff can move an IT request from `SUBMITTED` to `IN_PROGRESS`, the change is persisted, the React UI receives the updated result, and invalid or unauthorized attempts are rejected without changing state.**

## UNDERSTAND

### Week 1 sources used

- `docs/product-spec.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/decisions/ADR-001.md`

### State, rule, invariant

State used by this slice:

`SUBMITTED -> IN_PROGRESS -> COMPLETED`

Rule:
Only authorized department staff may perform handling-related status changes.

Invariant:
A rejected authorization or invalid transition must not change persisted request state.

### Implementation area

Frontend:
- `frontend/src/App.tsx`
- `frontend/src/api/requests.ts`

Backend:
- `backend/src/requests/requests.controller.ts`
- `backend/src/requests/requests.service.ts`
- `backend/src/requests/requests.repository.ts`
- `backend/data/requests.json`

### Explicit non-goals

- no full request-creation workflow;
- no approval workflow implementation;
- no production authentication provider;
- no database server;
- no notifications;
- no attachments;
- no microservices;
- no AI feature.

## DIRECT

### Bounded task

Implement only one lifecycle behavior: starting work on an existing IT request.

### Relevant context inspected before modification

The Week 1 documents require:
- system-enforced authorization;
- durable successful state changes;
- consistent lifecycle state;
- clear failure behavior.

### Plan before execution

1. Expose one request through a NestJS API.
2. Represent two local development identities.
3. Add one protected status-transition endpoint.
4. Validate authorization and lifecycle transition in the backend.
5. Persist the updated request to a local JSON file.
6. Return the updated request to React.
7. Show success or failure in the UI.
8. Verify valid, invalid, unauthorized, persistence, and system-failure cases.

### Control decision

Proceed because the task is bounded to one existing Week 1 behavior and does not require a new external dependency.

## PROVE

### Local development identities

1. `employee-001`
   - role: `EMPLOYEE`
   - department: none
   - may view the seeded request as requester
   - may not update its handling status

2. `it-staff-001`
   - role: `IT_STAFF`
   - department: `IT`
   - may update the seeded IT request from `SUBMITTED` to `IN_PROGRESS`

The selected identity is sent in the `x-user-id` and `x-role` request headers for this local teaching slice. This is not production authentication.

### Valid case

Request:
- ID: `REQ-1001`
- initial status: `SUBMITTED`
- identity: `it-staff-001 / IT_STAFF`
- action: update status to `IN_PROGRESS`

Expected:
- HTTP 200
- returned status is `IN_PROGRESS`
- `backend/data/requests.json` contains `IN_PROGRESS`
- after backend restart the request is still `IN_PROGRESS`

### Unauthorized case

Identity:
- `employee-001 / EMPLOYEE`

Action:
- attempt status update

Expected:
- HTTP 403
- clear authorization error
- persisted status is unchanged

### Invalid lifecycle case

From:
- `IN_PROGRESS`

Attempt:
- `SUBMITTED`

Expected:
- HTTP 400
- clear invalid-transition error
- persisted status is unchanged

### Intentional API/system failure

Stop the backend and press the UI action.

Expected:
- the frontend displays a clear backend/network error;
- the UI does not display a false successful update.

### Persistence proof

After the valid update:

1. inspect `backend/data/requests.json`;
2. verify `REQ-1001` is `IN_PROGRESS`;
3. stop the backend;
4. restart with `npm run dev`;
5. reload the UI or GET the request;
6. verify the status remains `IN_PROGRESS`.

### Expected vs actual evidence table

| Case | Expected | Actual to record locally |
|---|---|---|
| Valid staff transition | 200 + persisted `IN_PROGRESS` | Run verification |
| Employee tries update | 403 + unchanged state | Run verification |
| Invalid transition | 400 + unchanged state | Run verification |
| Backend stopped | clear UI failure, no false success | Run manually |
| Restart after valid update | `IN_PROGRESS` still present | Run verification |

### Regression check

After the change:
- GET request still works;
- authorized transition works;
- unauthorized transition fails;
- invalid transition fails;
- persistence survives restart;
- UI still renders the request and errors clearly.

## Week 1 decision changes

No Week 1 architectural decision is reversed.

`ADR-002.md` records a bounded Week 2 implementation choice: local JSON persistence for proof without adding an external database dependency.

## Git evidence

Before commit:

```bash
git diff
git status
```

Final suggested commit:

```bash
git add .
git commit -m "implement protected persistent request status slice"
```

A reviewer should be able to reproduce the claim using the README instructions.
