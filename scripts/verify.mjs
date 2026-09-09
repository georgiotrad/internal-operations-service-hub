/**
 * Run while the backend is running:
 *   node scripts/verify.mjs
 *
 * The script resets the local JSON state before and after verification.
 */
import { readFile, writeFile } from 'node:fs/promises';

const dataFile = new URL('../backend/data/requests.json', import.meta.url);
const base = 'http://localhost:3000';
const seed = [
  {
    id: 'REQ-1001',
    requesterId: 'employee-001',
    department: 'IT',
    category: 'Laptop Support',
    description: 'Laptop cannot connect to the office Wi-Fi.',
    status: 'SUBMITTED',
    updatedAt: '2026-09-09T08:00:00.000Z',
  },
];

async function reset() {
  await writeFile(dataFile, JSON.stringify(seed, null, 2) + '\n', 'utf8');
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
  return { status: response.status, body: json };
}

function assert(condition, message) {
  if (!condition) throw new Error('FAILED: ' + message);
  console.log('PASS:', message);
}

try {
  await reset();

  const get1 = await api('GET', '/api/requests/REQ-1001', 'EMPLOYEE', 'employee-001');
  assert(get1.status === 200 && get1.body.status === 'SUBMITTED', 'requester can view seeded request');

  const denied = await api(
    'PATCH',
    '/api/requests/REQ-1001/status',
    'EMPLOYEE',
    'employee-001',
    { status: 'IN_PROGRESS' },
  );
  assert(denied.status === 403, 'employee cannot perform staff status update');

  let disk = JSON.parse(await readFile(dataFile, 'utf8'));
  assert(disk[0].status === 'SUBMITTED', 'unauthorized attempt does not change persisted state');

  const allowed = await api(
    'PATCH',
    '/api/requests/REQ-1001/status',
    'IT_STAFF',
    'it-staff-001',
    { status: 'IN_PROGRESS' },
  );
  assert(allowed.status === 200 && allowed.body.status === 'IN_PROGRESS', 'IT staff can start work');

  disk = JSON.parse(await readFile(dataFile, 'utf8'));
  assert(disk[0].status === 'IN_PROGRESS', 'valid transition is persisted');

  const invalid = await api(
    'PATCH',
    '/api/requests/REQ-1001/status',
    'IT_STAFF',
    'it-staff-001',
    { status: 'SUBMITTED' },
  );
  assert(invalid.status === 400, 'invalid lifecycle transition is rejected');

  disk = JSON.parse(await readFile(dataFile, 'utf8'));
  assert(disk[0].status === 'IN_PROGRESS', 'invalid transition leaves persisted state unchanged');

  console.log('\nVerification complete.');
} finally {
  await reset();
}
