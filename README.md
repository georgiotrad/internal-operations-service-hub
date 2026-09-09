# Internal Operations Service Hub

## Week 2 Product Milestone

This repository continues the Week 1 Operations Hub product foundation and implements one narrow, reproducible lifecycle slice.

### Claim

Authorized IT staff can move `REQ-1001` from `SUBMITTED` to `IN_PROGRESS`.
The backend enforces authorization and transition rules, persists the result to a local JSON file, and returns the updated state to the React UI.

Unauthorized and invalid actions are rejected without changing persisted state.

## Requirements

- Node.js 20.19+ or 22+ LTS
- npm
- Git

## Install

From the repository root:

```bash
npm install
```

## Run

```bash
npm run dev
```

Normally:
- backend: `http://localhost:3000`
- frontend: `http://localhost:5173`

Open the frontend.

## Local identities

The UI contains two teaching identities:

- **Employee (requester)** — `employee-001 / EMPLOYEE`
- **IT Staff** — `it-staff-001 / IT_STAFF`

These are local development identities only. They are not production authentication.

## Happy path

1. Reset `backend/data/requests.json` to `SUBMITTED` if necessary.
2. Select **IT Staff**.
3. Click **Start work**.
4. Expected UI status: **In progress**.
5. Open `backend/data/requests.json`.
6. Expected stored status: `IN_PROGRESS`.
7. Restart the backend and reload.
8. The status remains `IN_PROGRESS`.

## Unauthorized case

1. Ensure request is `SUBMITTED`.
2. Select **Employee (requester)**.
3. Click **Start work**.
4. Expected: authorization error.
5. Stored state remains `SUBMITTED`.

## Invalid lifecycle case

After a valid transition to `IN_PROGRESS`, try to send `SUBMITTED` again using curl:

```bash
curl -i -X PATCH http://localhost:3000/api/requests/REQ-1001/status   -H "Content-Type: application/json"   -H "x-user-id: it-staff-001"   -H "x-role: IT_STAFF"   -d "{\"status\":\"SUBMITTED\"}"
```

Expected: HTTP 400 and persisted state remains `IN_PROGRESS`.

## Automated verification

Keep the backend running, then in another terminal:

```bash
node scripts/verify.mjs
```

Expected output contains PASS lines for:
- requester can view request;
- employee is forbidden from status update;
- denied update does not persist;
- IT staff valid transition succeeds;
- valid transition persists;
- invalid transition returns 400;
- invalid transition does not mutate stored state.

The script resets the seed state after verification.

## Intentional system failure

To prove failure handling:

1. stop the backend with `Ctrl + C`;
2. leave the frontend open;
3. click **Reload request** or **Start work**;
4. verify a clear network/backend error appears;
5. verify no false success is displayed.

Restart using:

```bash
npm run dev
```

## Evidence and workflow

See:

- `docs/week2-agentic-workflow.md`
- `docs/product-spec.md`
- `docs/architecture.md`
- `docs/data-model.md`
- `docs/decisions/ADR-001.md`
- `docs/decisions/ADR-002.md`

## Git proof

Before committing:

```bash
git status
git diff
```

Suggested final commit:

```bash
git add .
git commit -m "implement protected persistent request status slice"
```

Push to the same public Operations Hub repository used for Week 1.
