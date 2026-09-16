/**
 * Run while the backend is running:
 *   node scripts/verify.mjs
 *
 * Verifies the protected Service Request flow using the SQLite database.
 */
import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const databaseFile = fileURLToPath(
  new URL('../backend/data/operations-hub.db', import.meta.url),
);

const base = 'http://localhost:3000';

const db = new Database(databaseFile);

function reset() {
  db.prepare(`
    UPDATE service_requests
    SET
      requester_id = ?,
      department = ?,
      category = ?,
      description = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    'employee-001',
    'IT',
    'Laptop Support',
    'Laptop cannot connect to the office Wi-Fi.',
    'SUBMITTED',
    '2026-09-09T08:00:00.000Z',
    'REQ-1001',
  );
}

function readRequest() {
  return db
    .prepare(`
      SELECT
        id,
        requester_id AS requesterId,
        department,
        category,
        description,
        status,
        updated_at AS updatedAt
      FROM service_requests
      WHERE id = ?
    `)
    .get('REQ-1001');
}

async function api(method, path, role, userId, body) {
  const response = await fetch(base + path, {
    method,
    headers: {
      'x-role': role,
      'x-user-id': userId,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json().catch(() => null);

  return {
    status: response.status,
    body: json,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error('FAILED: ' + message);
  }

  console.log('PASS:', message);
}

try {
  reset();

  const get1 = await api(
    'GET',
    '/api/requests/REQ-1001',
    'EMPLOYEE',
    'employee-001',
  );

  assert(
    get1.status === 200 &&
      get1.body.status === 'SUBMITTED',
    'requester can view seeded request',
  );

  const denied = await api(
    'PATCH',
    '/api/requests/REQ-1001/status',
    'EMPLOYEE',
    'employee-001',
    { status: 'IN_PROGRESS' },
  );

  assert(
    denied.status === 403,
    'employee cannot perform staff status update',
  );

  let persisted = readRequest();

  assert(
    persisted.status === 'SUBMITTED',
    'unauthorized attempt does not change persisted state',
  );

  const allowed = await api(
    'PATCH',
    '/api/requests/REQ-1001/status',
    'IT_STAFF',
    'it-staff-001',
    { status: 'IN_PROGRESS' },
  );

  assert(
    allowed.status === 200 &&
      allowed.body.status === 'IN_PROGRESS',
    'IT staff can start work',
  );

  persisted = readRequest();

  assert(
    persisted.status === 'IN_PROGRESS',
    'valid transition is persisted in SQLite',
  );

  const invalid = await api(
    'PATCH',
    '/api/requests/REQ-1001/status',
    'IT_STAFF',
    'it-staff-001',
    { status: 'SUBMITTED' },
  );

  assert(
    invalid.status === 400,
    'invalid lifecycle transition is rejected',
  );

  persisted = readRequest();

  assert(
    persisted.status === 'IN_PROGRESS',
    'invalid transition leaves persisted state unchanged',
  );

  console.log('\nVerification complete.');
} finally {
  reset();
  db.close();
}

